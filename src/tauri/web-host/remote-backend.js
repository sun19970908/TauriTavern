// @ts-check

/** @typedef {import('./install.js').BackendRequest} BackendRequest */
/** @typedef {import('./install.js').BackendResponse} BackendResponse */

const BACKEND_STORAGE_KEY = 'tauritavern:remote:backend';
const STORE_STORAGE_KEY = 'tauritavern:remote:web-host';

/** @param {string} text @returns {boolean} */
function isTextContentType(text) {
    const type = text.toLowerCase();
    return type === '' || type.startsWith('text/') || type.includes('json') || type.includes('xml');
}

/**
 * Build the Web Host backend over HTTP. Text responses carry the decoded body;
 * streams and binary responses keep the response body so callers can read them.
 *
 * @param {string} baseUrl
 * @param {typeof fetch} [fetchImpl]
 * @returns {import('./install.js').WebHostBackend}
 */
export function createHttpBackend(baseUrl, fetchImpl = globalThis.fetch) {
    const base = new URL(baseUrl);
    if (base.protocol !== 'http:' && base.protocol !== 'https:') {
        throw new Error(`Remote Web Host requires an http(s) backend, got ${base.protocol}`);
    }
    if (typeof fetchImpl !== 'function') throw new Error('Remote Web Host requires fetch');

    return {
        /** @param {BackendRequest} request @returns {Promise<BackendResponse>} */
        async handle(request) {
            const requestHeaders = { ...request.headers };
            /** @type {RequestInit} */
            const init = { method: request.method, headers: requestHeaders };
            if (request.method !== 'GET' && request.body !== null) {
                if (typeof request.body === 'string') {
                    init.body = request.body;
                } else {
                    const form = new FormData();
                    for (const [name, value] of request.body.entries) form.append(name, String(value));
                    init.body = form;
                    // fetch owns the multipart boundary.
                    delete requestHeaders['content-type'];
                }
            }
            const response = await fetchImpl(new URL(request.url, base), init);
            const headers = Object.fromEntries(response.headers);
            const contentType = headers['content-type'] ?? '';
            return {
                status: response.status,
                headers,
                body: contentType.includes('text/event-stream') || !isTextContentType(contentType)
                    ? response.body
                    : await response.text(),
            };
        },
    };
}

/**
 * @param {Storage} [storage]
 * @returns {{ load: () => Record<string, any> | null, save: (value: Record<string, any>) => void }}
 */
export function createRemoteStore(storage = globalThis.localStorage) {
    if (!storage) throw new Error('Remote Web Host requires localStorage');
    return {
        load() {
            const text = storage.getItem(STORE_STORAGE_KEY);
            if (text === null) return null;
            const value = JSON.parse(text);
            if (value === null || typeof value !== 'object' || Array.isArray(value)) {
                throw new Error('Remote Web Host store is not an object');
            }
            return value;
        },
        save(value) {
            storage.setItem(STORE_STORAGE_KEY, JSON.stringify(value));
        },
    };
}

/**
 * @param {string} [userAgent]
 * @param {number} [maxTouchPoints]
 * @returns {import('../../scripts/util/host-identity.js').HostIdentity}
 */
export function detectHostIdentity(
    userAgent = globalThis.navigator?.userAgent ?? '',
    maxTouchPoints = globalThis.navigator?.maxTouchPoints ?? 0,
) {
    const ua = String(userAgent);
    if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && maxTouchPoints > 1)) {
        return { platform: 'ios', kind: 'mobile' };
    }
    if (/Android/i.test(ua)) return { platform: 'android', kind: 'mobile' };
    if (/OpenHarmony|OHOS/i.test(ua)) return { platform: 'ohos', kind: 'mobile' };
    if (/Macintosh|Mac OS X/i.test(ua)) return { platform: 'macos', kind: 'desktop' };
    if (/Linux/i.test(ua)) return { platform: 'linux', kind: 'desktop' };
    return { platform: 'windows', kind: 'desktop' };
}

/**
 * The backend URL comes from `?backend=`, then localStorage, then the page origin.
 * @param {Storage} storage
 * @returns {string}
 */
export function resolveBackendUrl(storage = globalThis.localStorage) {
    if (!storage) throw new Error('Remote Web Host requires localStorage');
    const configured = new URLSearchParams(globalThis.location?.search ?? '').get('backend');
    if (configured) {
        try {
            storage.setItem(BACKEND_STORAGE_KEY, configured);
        } catch {
            // The query still applies; persistence is optional.
        }
        return configured;
    }
    try {
        const saved = storage.getItem(BACKEND_STORAGE_KEY);
        if (saved) return saved;
    } catch {
        // Fall through to the page origin.
    }
    if (!globalThis.location?.origin || globalThis.location.origin === 'null') {
        throw new Error('Remote Web Host needs an http(s) page origin or ?backend=<url>');
    }
    return globalThis.location.origin;
}
