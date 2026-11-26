use std::collections::{BTreeMap, HashMap};
use std::sync::{Arc, Mutex as StdMutex, OnceLock};
use std::time::Duration;

use base64::{Engine as _, engine::general_purpose::STANDARD};
use reqwest::header::{HeaderMap, HeaderName, HeaderValue, SET_COOKIE};
use reqwest::{Client, Method, StatusCode};
use serde::{Deserialize, Serialize};
use tauri::{State, WebviewWindow};
use tokio::sync::Mutex as AsyncMutex;
use url::Url;

use crate::app::AppState;
use crate::presentation::commands::helpers::log_command;
use crate::presentation::commands::user_endpoint_access::ensure_user_endpoint_access;
use crate::presentation::errors::CommandError;

/// Reverse proxy for SillyTavern server plugins hosted by an external
/// SillyTavern instance. The frontend route (`routes/plugin-proxy-routes.js`)
/// tunnels `/api/plugins/*` requests here; this command performs the actual
/// HTTP call on the native stack (no WebView CORS restrictions).
///
/// Scope guard: only `/api/plugins/*` paths may be requested so the command
/// can never act as a general-purpose SSRF tunnel for extensions.
///
/// CSRF/session management: SillyTavern enforces `cookie-session` + `csrf-sync`
/// on state-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`, etc.), while
/// TauriTavern's local `/csrf-token` stub returns a dummy token and the IPC
/// boundary strips cookies. This module transparently performs `GET /csrf-token`
/// per `(baseUrl, authorization)` in Rust, caches the resulting session cookies
/// and CSRF token, and refreshes once on `403 Invalid CSRF token`.
const PLUGIN_API_PREFIX: &str = "/api/plugins/";
const CSRF_TOKEN_PATH: &str = "/csrf-token";
const DEFAULT_TIMEOUT_MS: u64 = 120_000;
const MIN_TIMEOUT_MS: u64 = 1_000;
const MAX_TIMEOUT_MS: u64 = 600_000;
const MAX_CSRF_HANDSHAKE_TIMEOUT: Duration = Duration::from_secs(30);
const DEFAULT_MAX_RESPONSE_BYTES: usize = 64 * 1024 * 1024;
const MAX_RESPONSE_BYTES_CEILING: usize = 256 * 1024 * 1024;
const MAX_CSRF_RESPONSE_BYTES: usize = 64 * 1024;
const MAX_CACHED_SESSIONS: usize = 64;

/// Hop-by-hop and framing headers that must not be passed through verbatim
/// (the response body is re-framed into the IPC payload).
const STRIPPED_RESPONSE_HEADERS: &[&str] = &[
    "content-length",
    "connection",
    "keep-alive",
    "transfer-encoding",
    "content-encoding",
    "set-cookie",
];

static PROXY_CLIENT: OnceLock<Client> = OnceLock::new();
static SESSION_CACHE: OnceLock<BridgeSessionCache> = OnceLock::new();

#[derive(Clone, PartialEq, Eq, Hash)]
struct SessionKey {
    base_url: String,
    authorization: Option<String>,
}

impl SessionKey {
    fn new(base_url: &Url, headers: &[(HeaderName, HeaderValue)]) -> Self {
        let normalized_base = base_url.as_str().trim_end_matches('/').to_string();
        let authorization = headers
            .iter()
            .rfind(|(name, _)| name.as_str().eq_ignore_ascii_case("authorization"))
            .and_then(|(_, value)| value.to_str().ok())
            .map(ToString::to_string);
        Self {
            base_url: normalized_base,
            authorization,
        }
    }
}

#[derive(Clone)]
struct BridgeSession {
    cookies: BTreeMap<String, String>,
    csrf_token: String,
}

impl BridgeSession {
    fn cookie_header(&self) -> Option<String> {
        if self.cookies.is_empty() {
            return None;
        }
        let pairs: Vec<String> = self
            .cookies
            .iter()
            .map(|(name, value)| format!("{name}={value}"))
            .collect();
        Some(pairs.join("; "))
    }
}

#[derive(Default)]
struct SessionSlot {
    session: Option<BridgeSession>,
    generation: u64,
}

#[derive(Default)]
struct BridgeSessionCache {
    slots: StdMutex<HashMap<SessionKey, Arc<AsyncMutex<SessionSlot>>>>,
}

impl BridgeSessionCache {
    fn slot(&self, key: &SessionKey) -> Arc<AsyncMutex<SessionSlot>> {
        let mut guard = self
            .slots
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner());
        if guard.len() >= MAX_CACHED_SESSIONS && !guard.contains_key(key) {
            guard.clear();
        }
        guard
            .entry(key.clone())
            .or_insert_with(|| Arc::new(AsyncMutex::new(SessionSlot::default())))
            .clone()
    }

    fn peek_slot(&self, key: &SessionKey) -> Option<Arc<AsyncMutex<SessionSlot>>> {
        let guard = self
            .slots
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner());
        guard.get(key).cloned()
    }
}

struct SessionLease {
    session: Option<BridgeSession>,
    generation: u64,
    freshly_fetched: bool,
}

enum HandshakeOutcome {
    Session(BridgeSession),
    Unsupported,
    EarlyResponse(PluginProxyResponseDto),
}

enum RefreshOutcome {
    Refreshed(BridgeSession, u64),
    Unsupported,
    EarlyResponse(PluginProxyResponseDto),
}

struct UpstreamResponse {
    status: StatusCode,
    headers: HeaderMap,
    body: Vec<u8>,
}

#[derive(Deserialize)]
struct CsrfTokenResponse {
    token: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PluginProxyRequestDto {
    pub base_url: String,
    pub method: String,
    pub path_and_query: String,
    #[serde(default)]
    pub headers: Vec<(String, String)>,
    #[serde(default)]
    pub body: Option<String>,
    #[serde(default)]
    pub timeout_ms: Option<u64>,
    #[serde(default)]
    pub max_response_bytes: Option<usize>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PluginProxyResponseDto {
    pub status: u16,
    pub status_text: String,
    pub headers: Vec<(String, String)>,
    pub body_base64: String,
}

#[tauri::command]
pub async fn plugin_proxy_request(
    request: PluginProxyRequestDto,
    locale: String,
    window: WebviewWindow,
    app_state: State<'_, Arc<AppState>>,
) -> Result<PluginProxyResponseDto, CommandError> {
    log_command("plugin_proxy_request");

    let (base_url, target) = validate_and_resolve_target(&request)?;
    ensure_user_endpoint_access(
        Some(&base_url),
        &locale,
        &window,
        &app_state.services.user_endpoint_access_service,
    )
    .await?;

    execute_proxy_with_cache(&request, &base_url, &target, session_cache()).await
}

fn validate_and_resolve_target(
    request: &PluginProxyRequestDto,
) -> Result<(Url, String), CommandError> {
    let base = request.base_url.trim().trim_end_matches('/');
    if !(base.starts_with("http://") || base.starts_with("https://")) {
        return Err(CommandError::BadRequest(
            "Plugin bridge baseUrl must be an http(s) URL".to_string(),
        ));
    }

    let base_url = Url::parse(base).map_err(|error| {
        CommandError::BadRequest(format!("Plugin bridge baseUrl is not a valid URL: {error}"))
    })?;
    if base_url.host_str().is_none() || base_url.query().is_some() || base_url.fragment().is_some()
    {
        return Err(CommandError::BadRequest(
            "Plugin bridge baseUrl must be an http(s) origin/base path without query or fragment"
                .to_string(),
        ));
    }

    let path = request.path_and_query.trim();
    if !path.starts_with(PLUGIN_API_PREFIX) {
        return Err(CommandError::BadRequest(format!(
            "Plugin proxy path must start with {PLUGIN_API_PREFIX}"
        )));
    }

    let normalized_base = base_url.as_str().trim_end_matches('/');
    Ok((base_url.clone(), format!("{normalized_base}{path}")))
}

#[cfg(test)]
fn validate_target(request: &PluginProxyRequestDto) -> Result<String, CommandError> {
    validate_and_resolve_target(request).map(|(_, target)| target)
}

fn proxy_client() -> Result<&'static Client, CommandError> {
    if let Some(client) = PROXY_CLIENT.get() {
        return Ok(client);
    }

    let client = tt_adapter_http::build_http_client(Client::builder(), crate::product::USER_AGENT)
        .map_err(|error| {
            CommandError::InternalServerError(format!(
                "Failed to build plugin proxy client: {error}"
            ))
        })?;
    Ok(PROXY_CLIENT.get_or_init(|| client))
}

fn session_cache() -> &'static BridgeSessionCache {
    SESSION_CACHE.get_or_init(BridgeSessionCache::default)
}

fn validate_request_headers(
    headers: &[(String, String)],
) -> Result<Vec<(HeaderName, HeaderValue)>, CommandError> {
    let mut validated = Vec::with_capacity(headers.len());
    for (name, value) in headers {
        // Request headers are contract input from our own frontend route, so a
        // malformed pair means the contract is broken: fail fast with context
        // instead of silently forwarding a degraded request. Validation stays
        // manual because reqwest's header() panics on invalid names/values.
        let header_name = HeaderName::from_bytes(name.as_bytes()).map_err(|error| {
            CommandError::BadRequest(format!("Invalid proxy header name '{name}': {error}"))
        })?;
        let header_value = HeaderValue::from_bytes(value.as_bytes()).map_err(|error| {
            CommandError::BadRequest(format!("Invalid proxy header value for '{name}': {error}"))
        })?;
        validated.push((header_name, header_value));
    }
    Ok(validated)
}

async fn execute_proxy_with_cache(
    request: &PluginProxyRequestDto,
    base_url: &Url,
    target: &str,
    cache: &BridgeSessionCache,
) -> Result<PluginProxyResponseDto, CommandError> {
    let client = proxy_client()?;
    let method = Method::from_bytes(request.method.to_uppercase().as_bytes()).map_err(|error| {
        CommandError::BadRequest(format!(
            "Invalid proxy method '{}': {error}",
            request.method
        ))
    })?;
    let validated_headers = validate_request_headers(&request.headers)?;
    let timeout = Duration::from_millis(
        request
            .timeout_ms
            .unwrap_or(DEFAULT_TIMEOUT_MS)
            .clamp(MIN_TIMEOUT_MS, MAX_TIMEOUT_MS),
    );
    let handshake_timeout = timeout.min(MAX_CSRF_HANDSHAKE_TIMEOUT);
    let max_response_bytes = request
        .max_response_bytes
        .unwrap_or(DEFAULT_MAX_RESPONSE_BYTES)
        .clamp(1, MAX_RESPONSE_BYTES_CEILING);

    let session_key = SessionKey::new(base_url, &validated_headers);
    let csrf_url = format!("{}{}", session_key.base_url, CSRF_TOKEN_PATH);
    let requires_csrf = !matches!(method.as_str(), "GET" | "HEAD" | "OPTIONS");

    let mut lease = if requires_csrf {
        match ensure_bridge_session(client, cache, &session_key, &csrf_url, handshake_timeout).await
        {
            Ok(lease) => lease,
            Err(early) => return Ok(early),
        }
    } else {
        peek_bridge_session(cache, &session_key).await
    };

    let mut upstream = match send_proxied_request(
        client,
        &method,
        target,
        &validated_headers,
        request.body.as_deref(),
        timeout,
        max_response_bytes,
        lease.session.as_ref(),
    )
    .await
    {
        Ok(upstream) => upstream,
        Err(error_dto) => return Ok(error_dto),
    };

    if requires_csrf
        && !lease.freshly_fetched
        && lease.session.is_some()
        && upstream.status == StatusCode::FORBIDDEN
        && is_invalid_csrf_response(&upstream.body)
    {
        match refresh_bridge_session(
            client,
            cache,
            &session_key,
            lease.generation,
            &csrf_url,
            handshake_timeout,
        )
        .await
        {
            RefreshOutcome::Refreshed(refreshed, new_generation) => {
                lease.session = Some(refreshed);
                lease.generation = new_generation;
                upstream = match send_proxied_request(
                    client,
                    &method,
                    target,
                    &validated_headers,
                    request.body.as_deref(),
                    timeout,
                    max_response_bytes,
                    lease.session.as_ref(),
                )
                .await
                {
                    Ok(retried) => retried,
                    Err(error_dto) => return Ok(error_dto),
                };
            }
            RefreshOutcome::EarlyResponse(early) => return Ok(early),
            RefreshOutcome::Unsupported => {}
        }
    }

    if upstream.status != StatusCode::FORBIDDEN {
        merge_cached_cookies(cache, &session_key, lease.generation, &upstream.headers).await;
    }

    Ok(build_proxy_response_dto(
        upstream.status,
        &upstream.headers,
        upstream.body,
    ))
}

async fn peek_bridge_session(cache: &BridgeSessionCache, key: &SessionKey) -> SessionLease {
    let Some(slot_lock) = cache.peek_slot(key) else {
        return SessionLease {
            session: None,
            generation: 0,
            freshly_fetched: false,
        };
    };
    let slot = slot_lock.lock().await;
    SessionLease {
        session: slot.session.clone(),
        generation: slot.generation,
        freshly_fetched: false,
    }
}

async fn ensure_bridge_session(
    client: &Client,
    cache: &BridgeSessionCache,
    key: &SessionKey,
    csrf_url: &str,
    timeout: Duration,
) -> Result<SessionLease, PluginProxyResponseDto> {
    let slot_lock = cache.slot(key);
    let mut slot = slot_lock.lock().await;
    if let Some(session) = slot.session.clone() {
        return Ok(SessionLease {
            session: Some(session),
            generation: slot.generation,
            freshly_fetched: false,
        });
    }

    match fetch_bridge_session(client, key, csrf_url, timeout).await {
        HandshakeOutcome::Session(session) => {
            slot.generation += 1;
            slot.session = Some(session.clone());
            Ok(SessionLease {
                session: Some(session),
                generation: slot.generation,
                freshly_fetched: true,
            })
        }
        HandshakeOutcome::Unsupported => Ok(SessionLease {
            session: None,
            generation: slot.generation,
            freshly_fetched: true,
        }),
        HandshakeOutcome::EarlyResponse(early) => Err(early),
    }
}

async fn refresh_bridge_session(
    client: &Client,
    cache: &BridgeSessionCache,
    key: &SessionKey,
    failed_generation: u64,
    csrf_url: &str,
    timeout: Duration,
) -> RefreshOutcome {
    let slot_lock = cache.slot(key);
    let mut slot = slot_lock.lock().await;
    if slot.generation != failed_generation
        && let Some(session) = slot.session.clone()
    {
        return RefreshOutcome::Refreshed(session, slot.generation);
    }

    match fetch_bridge_session(client, key, csrf_url, timeout).await {
        HandshakeOutcome::Session(session) => {
            slot.generation += 1;
            let generation = slot.generation;
            slot.session = Some(session.clone());
            RefreshOutcome::Refreshed(session, generation)
        }
        HandshakeOutcome::Unsupported => {
            slot.generation += 1;
            slot.session = None;
            RefreshOutcome::Unsupported
        }
        HandshakeOutcome::EarlyResponse(early) => {
            slot.generation += 1;
            slot.session = None;
            RefreshOutcome::EarlyResponse(early)
        }
    }
}

async fn merge_cached_cookies(
    cache: &BridgeSessionCache,
    key: &SessionKey,
    used_generation: u64,
    headers: &HeaderMap,
) {
    if headers.get_all(SET_COOKIE).iter().next().is_none() {
        return;
    }
    let Some(slot_lock) = cache.peek_slot(key) else {
        return;
    };
    let mut slot = slot_lock.lock().await;
    if slot.generation != used_generation {
        return;
    }
    if let Some(session) = slot.session.as_mut() {
        apply_set_cookie_headers(&mut session.cookies, headers);
    }
}

async fn fetch_bridge_session(
    client: &Client,
    key: &SessionKey,
    csrf_url: &str,
    timeout: Duration,
) -> HandshakeOutcome {
    let mut builder = client
        .get(csrf_url)
        .timeout(timeout)
        .header(reqwest::header::ACCEPT, "application/json");
    if let Some(auth) = key.authorization.as_deref() {
        builder = builder.header(reqwest::header::AUTHORIZATION, auth);
    }

    let mut response = match builder.send().await {
        Ok(response) => response,
        Err(error) => {
            return HandshakeOutcome::EarlyResponse(gateway_error_response(format!(
                "Bridge target unreachable: {error}"
            )));
        }
    };

    let status = response.status();
    let headers = response.headers().clone();
    let body = match read_response_bytes(&mut response, MAX_CSRF_RESPONSE_BYTES).await {
        Ok(body) => body,
        Err(error_dto) => return HandshakeOutcome::EarlyResponse(error_dto),
    };

    if !status.is_success() {
        if matches!(status.as_u16(), 404 | 405 | 501) {
            return HandshakeOutcome::Unsupported;
        }
        return HandshakeOutcome::EarlyResponse(build_proxy_response_dto(status, &headers, body));
    }

    let Ok(parsed) = serde_json::from_slice::<CsrfTokenResponse>(&body) else {
        return HandshakeOutcome::EarlyResponse(gateway_error_response(
            "Bridge target returned an invalid /csrf-token JSON payload".to_string(),
        ));
    };
    let Some(csrf_token) = parsed.token.filter(|token| !token.trim().is_empty()) else {
        return HandshakeOutcome::EarlyResponse(gateway_error_response(
            "Bridge target /csrf-token response is missing token".to_string(),
        ));
    };

    let mut cookies = BTreeMap::new();
    apply_set_cookie_headers(&mut cookies, &headers);
    HandshakeOutcome::Session(BridgeSession {
        cookies,
        csrf_token,
    })
}

#[allow(clippy::too_many_arguments)]
async fn send_proxied_request(
    client: &Client,
    method: &Method,
    target: &str,
    headers: &[(HeaderName, HeaderValue)],
    body: Option<&str>,
    timeout: Duration,
    max_response_bytes: usize,
    session: Option<&BridgeSession>,
) -> Result<UpstreamResponse, PluginProxyResponseDto> {
    let mut builder = client.request(method.clone(), target).timeout(timeout);
    for (name, value) in headers {
        // Never forward caller cookies; when a SillyTavern bridge session is
        // active, also replace the WebView's dummy CSRF token with the real one.
        if name == reqwest::header::COOKIE {
            continue;
        }
        if session.is_some() && name.as_str().eq_ignore_ascii_case("x-csrf-token") {
            continue;
        }
        builder = builder.header(name, value);
    }

    if let Some(session) = session {
        if let Some(cookie_header) = session.cookie_header() {
            builder = builder.header(reqwest::header::COOKIE, cookie_header);
        }
        builder = builder.header("x-csrf-token", session.csrf_token.as_str());
    }

    if let Some(body) = body.filter(|body| !body.is_empty()) {
        builder = builder.body(body.to_owned());
    }

    let mut response = match builder.send().await {
        Ok(response) => response,
        // Transport-level failures (connect refused, DNS, timeout) must read
        // as "backend absent" to probe-driven extensions, so surface them as
        // a 502 payload instead of an IPC error.
        Err(error) => {
            return Err(gateway_error_response(format!(
                "Bridge target unreachable: {error}"
            )));
        }
    };

    let status = response.status();
    let response_headers = response.headers().clone();
    let response_body = read_response_bytes(&mut response, max_response_bytes).await?;

    Ok(UpstreamResponse {
        status,
        headers: response_headers,
        body: response_body,
    })
}

async fn read_response_bytes(
    response: &mut reqwest::Response,
    max_response_bytes: usize,
) -> Result<Vec<u8>, PluginProxyResponseDto> {
    let mut body: Vec<u8> = Vec::new();
    loop {
        match response.chunk().await {
            Ok(Some(chunk)) => {
                if body.len() + chunk.len() > max_response_bytes {
                    return Err(gateway_error_response(format!(
                        "Plugin response exceeds the {max_response_bytes} byte limit"
                    )));
                }
                body.extend_from_slice(&chunk);
            }
            Ok(None) => return Ok(body),
            Err(error) => {
                return Err(gateway_error_response(format!(
                    "Bridge target read failed: {error}"
                )));
            }
        }
    }
}

fn build_proxy_response_dto(
    status: StatusCode,
    headers: &HeaderMap,
    body: Vec<u8>,
) -> PluginProxyResponseDto {
    PluginProxyResponseDto {
        status: status.as_u16(),
        status_text: status.canonical_reason().unwrap_or("").to_string(),
        headers: collect_response_headers(headers),
        body_base64: STANDARD.encode(body),
    }
}

fn apply_set_cookie_headers(cookies: &mut BTreeMap<String, String>, headers: &HeaderMap) {
    for value in headers.get_all(SET_COOKIE) {
        let Ok(raw) = value.to_str() else {
            continue;
        };
        let Some((name, cookie_value)) = parse_set_cookie_pair(raw) else {
            continue;
        };
        match cookie_value {
            Some(val) => {
                cookies.insert(name.to_string(), val.to_string());
            }
            None => {
                cookies.remove(name);
            }
        }
    }
}

fn parse_set_cookie_pair(raw: &str) -> Option<(&str, Option<&str>)> {
    let mut parts = raw.split(';');
    let pair = parts.next()?.trim();
    let (name, value) = pair.split_once('=')?;
    let name = name.trim();
    if name.is_empty() {
        return None;
    }
    let value = value.trim();
    let expired = value.is_empty()
        || parts.any(|attr| {
            let Some((attr_name, attr_value)) = attr.trim().split_once('=') else {
                return false;
            };
            attr_name.trim().eq_ignore_ascii_case("max-age")
                && attr_value.trim().parse::<i64>().is_ok_and(|secs| secs <= 0)
        });
    if expired {
        Some((name, None))
    } else {
        Some((name, Some(value)))
    }
}

fn is_invalid_csrf_response(body: &[u8]) -> bool {
    String::from_utf8_lossy(body)
        .to_ascii_lowercase()
        .contains("invalid csrf token")
}

fn collect_response_headers(headers: &HeaderMap) -> Vec<(String, String)> {
    let mut collected = Vec::new();
    for (name, value) in headers.iter() {
        let lower = name.as_str().to_ascii_lowercase();
        if STRIPPED_RESPONSE_HEADERS.contains(&lower.as_str()) {
            continue;
        }
        // Response headers are upstream input; a non-visible-ASCII value is
        // skipped rather than guessed, but the skip is logged so the caller
        // can see the response was degraded.
        let Ok(value) = value.to_str() else {
            tracing::warn!(header = %name, "Dropping non-UTF-8 plugin response header");
            continue;
        };
        collected.push((lower, value.to_string()));
    }
    collected
}

fn gateway_error_response(message: String) -> PluginProxyResponseDto {
    let body =
        serde_json::json!({ "error": "Plugin bridge unreachable", "message": message }).to_string();
    PluginProxyResponseDto {
        status: 502,
        status_text: "Bad Gateway".to_string(),
        headers: vec![("content-type".to_string(), "application/json".to_string())],
        body_base64: STANDARD.encode(body),
    }
}

#[cfg(test)]
mod tests {
    use std::sync::atomic::{AtomicUsize, Ordering};

    use tokio::io::{AsyncReadExt, AsyncWriteExt};
    use tokio::net::TcpListener;
    use tokio::task::JoinSet;

    use super::*;

    fn request(base_url: &str, path_and_query: &str) -> PluginProxyRequestDto {
        PluginProxyRequestDto {
            base_url: base_url.to_string(),
            method: "GET".to_string(),
            path_and_query: path_and_query.to_string(),
            headers: Vec::new(),
            body: None,
            timeout_ms: None,
            max_response_bytes: None,
        }
    }

    fn post_request(
        base_url: &str,
        path_and_query: &str,
        headers: Vec<(String, String)>,
        body: Option<&str>,
    ) -> PluginProxyRequestDto {
        PluginProxyRequestDto {
            base_url: base_url.to_string(),
            method: "POST".to_string(),
            path_and_query: path_and_query.to_string(),
            headers,
            body: body.map(ToString::to_string),
            timeout_ms: Some(5_000),
            max_response_bytes: None,
        }
    }

    struct MockRequest {
        method: String,
        path: String,
        headers: HashMap<String, String>,
        body: String,
    }

    struct MockResponse {
        status_line: &'static str,
        headers: Vec<(&'static str, String)>,
        body: String,
    }

    async fn read_http_request(socket: &mut tokio::net::TcpStream) -> Option<MockRequest> {
        let mut buffer = Vec::new();
        let mut temp = [0u8; 4096];
        let header_end;
        loop {
            let read = socket.read(&mut temp).await.ok()?;
            if read == 0 {
                return None;
            }
            buffer.extend_from_slice(&temp[..read]);
            if let Some(pos) = buffer.windows(4).position(|window| window == b"\r\n\r\n") {
                header_end = pos + 4;
                break;
            }
        }

        let header_text = String::from_utf8_lossy(&buffer[..header_end]);
        let mut lines = header_text.split("\r\n");
        let request_line = lines.next()?;
        let mut parts = request_line.split_whitespace();
        let method = parts.next()?.to_string();
        let path = parts.next()?.to_string();

        let mut headers = HashMap::new();
        let mut content_length = 0usize;
        for line in lines {
            if let Some((name, value)) = line.split_once(':') {
                let lower = name.trim().to_ascii_lowercase();
                let trimmed = value.trim().to_string();
                if lower == "content-length" {
                    content_length = trimmed.parse::<usize>().unwrap_or(0);
                }
                headers.insert(lower, trimmed);
            }
        }

        while buffer.len() < header_end + content_length {
            let read = socket.read(&mut temp).await.ok()?;
            if read == 0 {
                break;
            }
            buffer.extend_from_slice(&temp[..read]);
        }

        let body = String::from_utf8_lossy(
            &buffer[header_end..(header_end + content_length).min(buffer.len())],
        )
        .to_string();

        Some(MockRequest {
            method,
            path,
            headers,
            body,
        })
    }

    async fn spawn_mock_server<F>(handler: F) -> String
    where
        F: Fn(MockRequest) -> MockResponse + Send + Sync + 'static,
    {
        let listener = TcpListener::bind("127.0.0.1:0")
            .await
            .expect("bind mock server");
        let addr = listener.local_addr().expect("mock local_addr");
        let handler = Arc::new(handler);

        tokio::spawn(async move {
            while let Ok((mut socket, _)) = listener.accept().await {
                let handler = Arc::clone(&handler);
                tokio::spawn(async move {
                    let Some(req) = read_http_request(&mut socket).await else {
                        return;
                    };
                    let resp = handler(req);
                    let mut raw = format!(
                        "HTTP/1.1 {}\r\nContent-Length: {}\r\nConnection: close\r\n",
                        resp.status_line,
                        resp.body.len()
                    );
                    for (name, value) in resp.headers {
                        raw.push_str(&format!("{name}: {value}\r\n"));
                    }
                    raw.push_str("\r\n");
                    raw.push_str(&resp.body);
                    let _ = socket.write_all(raw.as_bytes()).await;
                    let _ = socket.shutdown().await;
                });
            }
        });

        format!("http://{addr}")
    }

    fn decode_dto_body(dto: &PluginProxyResponseDto) -> String {
        let bytes = STANDARD.decode(&dto.body_base64).expect("valid base64");
        String::from_utf8(bytes).expect("valid utf8")
    }

    #[test]
    fn validate_target_accepts_plugin_paths_on_http_bases() {
        let target = validate_target(&request(
            "http://127.0.0.1:8000/",
            "/api/plugins/baibaoku/v1/status",
        ))
        .expect("valid target");
        assert_eq!(
            target,
            "http://127.0.0.1:8000/api/plugins/baibaoku/v1/status"
        );
    }

    #[test]
    fn validate_target_rejects_paths_outside_the_plugin_namespace() {
        let error =
            validate_target(&request("http://127.0.0.1:8000", "/api/chats/get")).unwrap_err();
        assert!(matches!(error, CommandError::BadRequest(_)));
    }

    #[test]
    fn validate_target_rejects_non_http_schemes() {
        let error = validate_target(&request(
            "file:///etc/passwd",
            "/api/plugins/baibaoku/v1/status",
        ))
        .unwrap_err();
        assert!(matches!(error, CommandError::BadRequest(_)));
    }

    #[test]
    fn validate_target_rejects_query_or_fragment_in_base_url() {
        let error = validate_target(&request(
            "http://127.0.0.1:8000?foo=bar",
            "/api/plugins/baibaoku/v1/status",
        ))
        .unwrap_err();
        assert!(matches!(error, CommandError::BadRequest(_)));
    }

    #[test]
    fn parse_set_cookie_pair_handles_values_and_deletions() {
        assert_eq!(
            parse_set_cookie_pair("session=abc==; path=/; httponly"),
            Some(("session", Some("abc==")))
        );
        assert_eq!(
            parse_set_cookie_pair("session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"),
            Some(("session", None))
        );
        assert_eq!(
            parse_set_cookie_pair("session=stale; Max-Age=0; path=/"),
            Some(("session", None))
        );
    }

    #[tokio::test]
    async fn post_performs_single_csrf_handshake_and_reuses_cached_session() {
        let csrf_hits = Arc::new(AtomicUsize::new(0));
        let post_hits = Arc::new(AtomicUsize::new(0));
        let csrf_hits_clone = Arc::clone(&csrf_hits);
        let post_hits_clone = Arc::clone(&post_hits);

        let base = spawn_mock_server(move |req| match (req.method.as_str(), req.path.as_str()) {
            ("GET", "/csrf-token") => {
                csrf_hits_clone.fetch_add(1, Ordering::SeqCst);
                assert_eq!(
                    req.headers.get("authorization").map(String::as_str),
                    Some("Basic dXNlcjpwYXNz")
                );
                MockResponse {
                    status_line: "200 OK",
                    headers: vec![
                        ("Content-Type", "application/json".to_string()),
                        ("Set-Cookie", "session=sess-1; path=/; httponly".to_string()),
                        (
                            "Set-Cookie",
                            "session.sig=sig-1; path=/; httponly".to_string(),
                        ),
                    ],
                    body: r#"{"token":"csrf-1"}"#.to_string(),
                }
            }
            ("POST", "/api/plugins/baibaoku/v1/get") => {
                post_hits_clone.fetch_add(1, Ordering::SeqCst);
                assert_eq!(
                    req.headers.get("cookie").map(String::as_str),
                    Some("session=sess-1; session.sig=sig-1")
                );
                assert_eq!(
                    req.headers.get("x-csrf-token").map(String::as_str),
                    Some("csrf-1")
                );
                assert_eq!(
                    req.headers.get("authorization").map(String::as_str),
                    Some("Basic dXNlcjpwYXNz")
                );
                assert_eq!(req.body, r#"{"key":"demo"}"#);
                MockResponse {
                    status_line: "200 OK",
                    headers: vec![("Content-Type", "application/json".to_string())],
                    body: r#"{"ok":true}"#.to_string(),
                }
            }
            _ => MockResponse {
                status_line: "404 Not Found",
                headers: Vec::new(),
                body: "unexpected".to_string(),
            },
        })
        .await;

        let cache = BridgeSessionCache::default();
        let headers = vec![
            (
                "authorization".to_string(),
                "Basic dXNlcjpwYXNz".to_string(),
            ),
            ("x-csrf-token".to_string(), "tauri-dummy-token".to_string()),
            ("cookie".to_string(), "caller=forbidden".to_string()),
            ("content-type".to_string(), "application/json".to_string()),
        ];

        for _ in 0..2 {
            let req = post_request(
                &base,
                "/api/plugins/baibaoku/v1/get",
                headers.clone(),
                Some(r#"{"key":"demo"}"#),
            );
            let (base_url, target) = validate_and_resolve_target(&req).expect("valid target");
            let resp = execute_proxy_with_cache(&req, &base_url, &target, &cache)
                .await
                .expect("proxy ok");
            assert_eq!(resp.status, 200);
            assert_eq!(decode_dto_body(&resp), r#"{"ok":true}"#);
            assert!(!resp.headers.iter().any(|(name, _)| name == "set-cookie"));
        }

        assert_eq!(csrf_hits.load(Ordering::SeqCst), 1);
        assert_eq!(post_hits.load(Ordering::SeqCst), 2);
    }

    #[tokio::test]
    async fn concurrent_posts_coalesce_into_single_csrf_handshake() {
        let csrf_hits = Arc::new(AtomicUsize::new(0));
        let csrf_hits_clone = Arc::clone(&csrf_hits);

        let base = spawn_mock_server(move |req| match (req.method.as_str(), req.path.as_str()) {
            ("GET", "/csrf-token") => {
                csrf_hits_clone.fetch_add(1, Ordering::SeqCst);
                MockResponse {
                    status_line: "200 OK",
                    headers: vec![
                        ("Content-Type", "application/json".to_string()),
                        ("Set-Cookie", "session=s1; path=/; httponly".to_string()),
                    ],
                    body: r#"{"token":"csrf-co"}"#.to_string(),
                }
            }
            ("POST", "/api/plugins/cocktail-plus/probe") => {
                assert_eq!(
                    req.headers.get("cookie").map(String::as_str),
                    Some("session=s1")
                );
                assert_eq!(
                    req.headers.get("x-csrf-token").map(String::as_str),
                    Some("csrf-co")
                );
                MockResponse {
                    status_line: "200 OK",
                    headers: vec![("Content-Type", "application/json".to_string())],
                    body: r#"{"ok":true}"#.to_string(),
                }
            }
            _ => MockResponse {
                status_line: "404 Not Found",
                headers: Vec::new(),
                body: "unexpected".to_string(),
            },
        })
        .await;

        let cache = Arc::new(BridgeSessionCache::default());
        let mut join_set = JoinSet::new();
        for _ in 0..6 {
            let base = base.clone();
            let cache = Arc::clone(&cache);
            join_set.spawn(async move {
                let req = post_request(
                    &base,
                    "/api/plugins/cocktail-plus/probe",
                    vec![("x-csrf-token".to_string(), "tauri-dummy-token".to_string())],
                    Some("{}"),
                );
                let (base_url, target) = validate_and_resolve_target(&req).expect("valid target");
                execute_proxy_with_cache(&req, &base_url, &target, &cache).await
            });
        }

        while let Some(joined) = join_set.join_next().await {
            let resp = joined.expect("task ok").expect("proxy ok");
            assert_eq!(resp.status, 200);
        }
        assert_eq!(csrf_hits.load(Ordering::SeqCst), 1);
    }

    #[tokio::test]
    async fn stale_csrf_session_refreshes_once_on_403_invalid_csrf_token() {
        let generation = Arc::new(AtomicUsize::new(0));
        let gen_clone = Arc::clone(&generation);

        let base = spawn_mock_server(move |req| match (req.method.as_str(), req.path.as_str()) {
            ("GET", "/csrf-token") => {
                let current = gen_clone.fetch_add(1, Ordering::SeqCst) + 1;
                MockResponse {
                    status_line: "200 OK",
                    headers: vec![
                        ("Content-Type", "application/json".to_string()),
                        ("Set-Cookie", format!("session=sess-{current}; path=/")),
                    ],
                    body: format!(r#"{{"token":"csrf-{current}"}}"#),
                }
            }
            ("POST", "/api/plugins/baibaoku/v1/set") => {
                let active = gen_clone.load(Ordering::SeqCst);
                let expected_cookie = format!("session=sess-{active}");
                let expected_token = format!("csrf-{active}");
                // Simulate ST restart after the first POST succeeded: reject gen 1 once
                // bumped externally to active = 2 before the second POST arrives.
                if req.headers.get("cookie").map(String::as_str) == Some(expected_cookie.as_str())
                    && req.headers.get("x-csrf-token").map(String::as_str)
                        == Some(expected_token.as_str())
                {
                    MockResponse {
                        status_line: "200 OK",
                        headers: vec![("Content-Type", "application/json".to_string())],
                        body: format!(r#"{{"gen":{active}}}"#),
                    }
                } else {
                    MockResponse {
                        status_line: "403 Forbidden",
                        headers: vec![("Content-Type", "text/html; charset=utf-8".to_string())],
                        body: "ForbiddenError: \u{001b}[31mInvalid CSRF token. Please refresh the page and try again.\u{001b}[39m".to_string(),
                    }
                }
            }
            _ => MockResponse {
                status_line: "404 Not Found",
                headers: Vec::new(),
                body: "unexpected".to_string(),
            },
        })
        .await;

        let cache = BridgeSessionCache::default();
        let req = post_request(
            &base,
            "/api/plugins/baibaoku/v1/set",
            vec![("x-csrf-token".to_string(), "tauri-dummy-token".to_string())],
            Some("{}"),
        );
        let (base_url, target) = validate_and_resolve_target(&req).expect("valid target");

        let first = execute_proxy_with_cache(&req, &base_url, &target, &cache)
            .await
            .expect("first ok");
        assert_eq!(first.status, 200);
        assert_eq!(decode_dto_body(&first), r#"{"gen":1}"#);

        // Simulate ST restarting / rotating its session secret.
        generation.store(2, Ordering::SeqCst);

        let second = execute_proxy_with_cache(&req, &base_url, &target, &cache)
            .await
            .expect("retry ok");
        assert_eq!(second.status, 200);
        assert_eq!(decode_dto_body(&second), r#"{"gen":3}"#);
    }

    #[tokio::test]
    async fn session_cache_is_isolated_by_authorization_header() {
        let csrf_hits = Arc::new(AtomicUsize::new(0));
        let csrf_clone = Arc::clone(&csrf_hits);

        let base = spawn_mock_server(move |req| match (req.method.as_str(), req.path.as_str()) {
            ("GET", "/csrf-token") => {
                let hit = csrf_clone.fetch_add(1, Ordering::SeqCst) + 1;
                MockResponse {
                    status_line: "200 OK",
                    headers: vec![
                        ("Content-Type", "application/json".to_string()),
                        ("Set-Cookie", format!("session=auth-{hit}")),
                    ],
                    body: format!(r#"{{"token":"tok-{hit}"}}"#),
                }
            }
            ("POST", "/api/plugins/baibaoku/v1/get") => MockResponse {
                status_line: "200 OK",
                headers: vec![("Content-Type", "application/json".to_string())],
                body: format!(
                    r#"{{"cookie":"{}","csrf":"{}"}}"#,
                    req.headers.get("cookie").cloned().unwrap_or_default(),
                    req.headers.get("x-csrf-token").cloned().unwrap_or_default(),
                ),
            },
            _ => MockResponse {
                status_line: "404 Not Found",
                headers: Vec::new(),
                body: "unexpected".to_string(),
            },
        })
        .await;

        let cache = BridgeSessionCache::default();
        let req1 = post_request(
            &base,
            "/api/plugins/baibaoku/v1/get",
            vec![(
                "authorization".to_string(),
                "Basic dXNlcjE6MQ==".to_string(),
            )],
            None,
        );
        let (base1, target1) = validate_and_resolve_target(&req1).expect("valid");
        let resp1 = execute_proxy_with_cache(&req1, &base1, &target1, &cache)
            .await
            .expect("ok");
        assert_eq!(
            decode_dto_body(&resp1),
            r#"{"cookie":"session=auth-1","csrf":"tok-1"}"#
        );

        let req2 = post_request(
            &base,
            "/api/plugins/baibaoku/v1/get",
            vec![(
                "authorization".to_string(),
                "Basic dXNlcjI6Mg==".to_string(),
            )],
            None,
        );
        let (base2, target2) = validate_and_resolve_target(&req2).expect("valid");
        let resp2 = execute_proxy_with_cache(&req2, &base2, &target2, &cache)
            .await
            .expect("ok");
        assert_eq!(
            decode_dto_body(&resp2),
            r#"{"cookie":"session=auth-2","csrf":"tok-2"}"#
        );
        assert_eq!(csrf_hits.load(Ordering::SeqCst), 2);
    }

    #[tokio::test]
    async fn get_request_skips_csrf_handshake_when_cold() {
        let csrf_hits = Arc::new(AtomicUsize::new(0));
        let csrf_clone = Arc::clone(&csrf_hits);

        let base = spawn_mock_server(move |req| match (req.method.as_str(), req.path.as_str()) {
            ("GET", "/csrf-token") => {
                csrf_clone.fetch_add(1, Ordering::SeqCst);
                MockResponse {
                    status_line: "200 OK",
                    headers: Vec::new(),
                    body: r#"{"token":"unused"}"#.to_string(),
                }
            }
            ("GET", "/api/plugins/baibaoku/v1/status") => MockResponse {
                status_line: "200 OK",
                headers: vec![("Content-Type", "application/json".to_string())],
                body: r#"{"ok":true}"#.to_string(),
            },
            _ => MockResponse {
                status_line: "404 Not Found",
                headers: Vec::new(),
                body: "unexpected".to_string(),
            },
        })
        .await;

        let cache = BridgeSessionCache::default();
        let req = request(&base, "/api/plugins/baibaoku/v1/status");
        let (base_url, target) = validate_and_resolve_target(&req).expect("valid");
        let resp = execute_proxy_with_cache(&req, &base_url, &target, &cache)
            .await
            .expect("ok");
        assert_eq!(resp.status, 200);
        assert_eq!(csrf_hits.load(Ordering::SeqCst), 0);
    }

    #[tokio::test]
    async fn csrf_401_short_circuits_without_hitting_plugin_route() {
        let post_hits = Arc::new(AtomicUsize::new(0));
        let post_clone = Arc::clone(&post_hits);

        let base = spawn_mock_server(move |req| match (req.method.as_str(), req.path.as_str()) {
            ("GET", "/csrf-token") => MockResponse {
                status_line: "401 Unauthorized",
                headers: vec![(
                    "WWW-Authenticate",
                    r#"Basic realm="SillyTavern""#.to_string(),
                )],
                body: "Unauthorized".to_string(),
            },
            ("POST", "/api/plugins/baibaoku/v1/get") => {
                post_clone.fetch_add(1, Ordering::SeqCst);
                MockResponse {
                    status_line: "200 OK",
                    headers: Vec::new(),
                    body: "should not reach".to_string(),
                }
            }
            _ => MockResponse {
                status_line: "404 Not Found",
                headers: Vec::new(),
                body: "unexpected".to_string(),
            },
        })
        .await;

        let cache = BridgeSessionCache::default();
        let req = post_request(
            &base,
            "/api/plugins/baibaoku/v1/get",
            Vec::new(),
            Some("{}"),
        );
        let (base_url, target) = validate_and_resolve_target(&req).expect("valid");
        let resp = execute_proxy_with_cache(&req, &base_url, &target, &cache)
            .await
            .expect("ok");
        assert_eq!(resp.status, 401);
        assert_eq!(post_hits.load(Ordering::SeqCst), 0);
    }

    #[tokio::test]
    async fn csrf_404_unsupported_falls_back_to_direct_post() {
        let base = spawn_mock_server(move |req| match (req.method.as_str(), req.path.as_str()) {
            ("GET", "/csrf-token") => MockResponse {
                status_line: "404 Not Found",
                headers: Vec::new(),
                body: "not found".to_string(),
            },
            ("POST", "/api/plugins/custom/ping") => MockResponse {
                status_line: "200 OK",
                headers: vec![("Content-Type", "application/json".to_string())],
                body: r#"{"pong":true}"#.to_string(),
            },
            _ => MockResponse {
                status_line: "404 Not Found",
                headers: Vec::new(),
                body: "unexpected".to_string(),
            },
        })
        .await;

        let cache = BridgeSessionCache::default();
        let req = post_request(&base, "/api/plugins/custom/ping", Vec::new(), Some("{}"));
        let (base_url, target) = validate_and_resolve_target(&req).expect("valid");
        let resp = execute_proxy_with_cache(&req, &base_url, &target, &cache)
            .await
            .expect("ok");
        assert_eq!(resp.status, 200);
        assert_eq!(decode_dto_body(&resp), r#"{"pong":true}"#);
    }
}
