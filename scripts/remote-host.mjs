import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { networkInterfaces } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const DEFAULT_PORT = 8787;
const MAX_REQUEST_BYTES = 256 * 1024 * 1024;
const POLL_TIMEOUT_MS = 25_000;
const BRIDGE_TIMEOUT_MS = 30_000;
const REQUEST_TIMEOUT_MS = 600_000;
const REMOTE_PREFIX = '/__remote/';

const CONTENT_TYPES = new Map(Object.entries({
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.ico': 'image/x-icon',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.ttf': 'font/ttf',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
}));

/** @param {import('node:http').ServerResponse} response */
function setCors(response) {
    response.setHeader('access-control-allow-origin', '*');
    response.setHeader('access-control-allow-methods', 'GET, POST, OPTIONS');
    response.setHeader('access-control-allow-headers', '*');
    response.setHeader('access-control-expose-headers', '*');
}

/** @param {import('node:http').ServerResponse} response @param {number} status @param {string} text */
function sendText(response, status, text) {
    response.statusCode = status;
    response.setHeader('content-type', 'text/plain; charset=utf-8');
    response.end(text);
}

/** @param {import('node:http').ServerResponse} response @param {number} status @param {unknown} value */
function sendJson(response, status, value) {
    response.statusCode = status;
    response.setHeader('content-type', 'application/json; charset=utf-8');
    response.setHeader('cache-control', 'no-store');
    response.end(JSON.stringify(value));
}

/** @param {import('node:http').IncomingMessage} request */
async function readBody(request) {
    const chunks = [];
    let size = 0;
    for await (const chunk of request) {
        size += chunk.length;
        if (size > MAX_REQUEST_BYTES) {
            const error = new Error(`Request body exceeds ${MAX_REQUEST_BYTES} bytes`);
            // @ts-expect-error status is carried by the server error handler.
            error.status = 413;
            throw error;
        }
        chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString('utf8');
}

/**
 * The Web Host sends character forms as multipart text. Node reconstructs the
 * entries so the PC bridge can build a real FormData in its own realm.
 *
 * @param {string} body
 * @param {string} contentType
 * @returns {[string, string][]}
 */
function parseMultipart(body, contentType) {
    const boundaryMatch = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType);
    if (!boundaryMatch) throw new Error('Multipart request has no boundary');
    const boundary = `--${(boundaryMatch[1] ?? boundaryMatch[2]).trim()}`;
    const entries = [];
    for (const part of body.split(boundary)) {
        if (!part || part === '--' || part === '--\r\n') continue;
        const text = part.startsWith('\r\n') ? part.slice(2) : part;
        const headerEnd = text.indexOf('\r\n\r\n');
        if (headerEnd === -1) continue;
        const headers = text.slice(0, headerEnd);
        let value = text.slice(headerEnd + 4);
        if (value.endsWith('\r\n')) value = value.slice(0, -2);
        const name = /(?:^|\r\n)content-disposition:\s*form-data;\s*name="([^"]*)"/i.exec(headers)?.[1];
        if (name === undefined) continue;
        const partType = /(?:^|\r\n)content-type:\s*([^\r\n]+)/i.exec(headers)?.[1]?.trim();
        if (partType && !partType.startsWith('text/')) {
            throw new Error(`Remote bridge only supports text form fields, got ${partType}`);
        }
        entries.push([name, value]);
    }
    return entries;
}

/** @param {import('node:http').IncomingHttpHeaders} headers */
function requestHeaders(headers) {
    /** @type {Record<string, string>} */
    const result = {};
    for (const [name, value] of Object.entries(headers)) {
        if (value === undefined) continue;
        if (['connection', 'content-length', 'host', 'keep-alive', 'proxy-connection', 'transfer-encoding', 'upgrade'].includes(name)) continue;
        result[name] = Array.isArray(value) ? value.join(', ') : value;
    }
    return result;
}

/** @param {Record<string, string>} headers */
function responseHeaders(headers = {}) {
    /** @type {Record<string, string>} */
    const result = {};
    for (const [name, value] of Object.entries(headers)) {
        if (['connection', 'content-encoding', 'content-length', 'transfer-encoding'].includes(name.toLowerCase())) continue;
        result[name] = String(value);
    }
    return result;
}

/** @param {string} pathname @returns {boolean} */
function isRelayPath(pathname) {
    return pathname.startsWith('/api/') || pathname === '/version' || pathname === '/thumbnail'
        || pathname === '/css/user.css'
        || pathname.startsWith('/scripts/extensions/third-party/')
        || pathname.startsWith('/backgrounds/') || pathname.startsWith('/characters/')
        || pathname.startsWith('/user/') || pathname.startsWith('/User Avatars/') || pathname.startsWith('/User%20Avatars/')
        || pathname === '/getallchatsofcharacter' || pathname === '/getchat' || pathname === '/getgroupchat';
}

/**
 * @param {string} root
 * @param {string} pathname
 * @returns {Promise<string | null>}
 */
async function resolveStaticFile(root, pathname) {
    let decoded;
    try {
        decoded = decodeURIComponent(pathname);
    } catch {
        return null;
    }
    const relative = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
    const candidate = path.resolve(root, relative);
    if (candidate !== root && !candidate.startsWith(`${root}${path.sep}`)) return null;
    const info = await stat(candidate).catch(() => null);
    if (!info) return null;
    if (info.isDirectory()) {
        const index = path.join(candidate, 'index.html');
        const indexInfo = await stat(index).catch(() => null);
        return indexInfo?.isFile() ? index : null;
    }
    return info.isFile() ? candidate : null;
}

/**
 * @param {string} file
 * @param {import('node:http').ServerResponse} response
 */
function sendFile(file, response) {
    const type = CONTENT_TYPES.get(path.extname(file).toLowerCase()) ?? 'application/octet-stream';
    response.statusCode = 200;
    response.setHeader('content-type', type);
    response.setHeader('cache-control', 'no-cache');
    createReadStream(file).on('error', () => {
        if (!response.headersSent) sendText(response, 500, 'Cannot read file');
        else response.end();
    }).pipe(response);
}

/**
 * @param {{
 *   root?: string,
 *   host?: string,
 *   port?: number,
 *   pollTimeoutMs?: number,
 *   bridgeTimeoutMs?: number,
 *   requestTimeoutMs?: number,
 * }} [options]
 */
export function createRemoteHostServer({
    root = fileURLToPath(new URL('../src/', import.meta.url)),
    host = '0.0.0.0',
    port = DEFAULT_PORT,
    pollTimeoutMs = POLL_TIMEOUT_MS,
    bridgeTimeoutMs = BRIDGE_TIMEOUT_MS,
    requestTimeoutMs = REQUEST_TIMEOUT_MS,
} = {}) {
    const rootPath = path.resolve(root);
    let nextId = 0;
    let lastBridgeAt = 0;
    /** @type {Array<any>} */
    const queue = [];
    /** @type {Map<number, any>} */
    const pending = new Map();
    /** @type {Array<{ response: import('node:http').ServerResponse, timer?: NodeJS.Timeout }>} */
    const waiters = [];
    /** @type {Array<{ method: string, path: string, status: number, durationMs: number, bridgeConnected: boolean, at: string, bytes: number }>} */
    const recentRelays = [];
    /** @type {Array<unknown>} */
    const recentClientErrors = [];

    function bridgeSeen() {
        lastBridgeAt = Date.now();
    }

    /** @param {any} item */
    function cleanup(item) {
        if (item.timer) clearTimeout(item.timer);
        pending.delete(item.id);
        const index = queue.indexOf(item);
        if (index !== -1) queue.splice(index, 1);
    }

    /** @param {any} item @param {import('node:http').ServerResponse} response */
    function deliver(item, response) {
        if (response.destroyed || response.writableEnded) return false;
        if (item.timer) clearTimeout(item.timer);
        pending.set(item.id, item);
        item.delivered = true;
        item.timer = setTimeout(() => {
            cleanup(item);
            if (!item.response.writableEnded) sendText(item.response, 504, 'Remote bridge did not answer in time');
        }, requestTimeoutMs);
        const payload = {
            id: item.id,
            method: item.method,
            url: item.url,
            headers: item.headers,
            ...(item.formEntries ? { formEntries: item.formEntries } : { body: item.body }),
        };
        sendJson(response, 200, payload);
        return true;
    }

    function pump() {
        while (queue.length && waiters.length) {
            const waiter = /** @type {any} */ (waiters.shift());
            if (waiter.timer) clearTimeout(waiter.timer);
            if (waiter.response.destroyed || waiter.response.writableEnded) continue;
            deliver(/** @type {any} */ (queue.shift()), waiter.response);
        }
    }

    /** @param {import('node:http').ServerResponse} response */
    function addWaiter(response) {
        const waiter = { response, timer: undefined };
        waiter.timer = setTimeout(() => {
            const index = waiters.indexOf(waiter);
            if (index !== -1) waiters.splice(index, 1);
            if (!response.writableEnded) {
                response.statusCode = 204;
                response.end();
            }
        }, pollTimeoutMs);
        waiters.push(waiter);
        response.on('close', () => {
            if (waiter.timer) clearTimeout(waiter.timer);
            const index = waiters.indexOf(waiter);
            if (index !== -1) waiters.splice(index, 1);
        });
    }

    /** @param {import('node:http').IncomingMessage} request @param {import('node:http').ServerResponse} response @param {URL} url */
    async function relay(request, response, url) {
        const contentType = String(request.headers['content-type'] ?? '');
        const body = await readBody(request);
        const headers = requestHeaders(request.headers);
        let formEntries;
        if (contentType.startsWith('multipart/form-data')) {
            formEntries = parseMultipart(body, contentType);
            delete headers['content-type'];
        }
        const item = {
            id: ++nextId,
            method: request.method ?? 'POST',
            url: `${url.pathname}${url.search}`,
            headers,
            ...(formEntries ? { formEntries } : { body }),
            response,
            delivered: false,
            streamStarted: false,
            timer: undefined,
        };
        item.timer = setTimeout(() => {
            cleanup(item);
            if (!response.writableEnded) sendText(response, 504, 'No PC bridge connected');
        }, bridgeTimeoutMs);
        const startedAt = Date.now();
        const bridgeConnectedAtStart = startedAt - lastBridgeAt < pollTimeoutMs + 5_000;
        response.on('finish', () => {
            recentRelays.unshift({
                at: new Date(startedAt).toISOString(),
                method: item.method,
                path: url.pathname,
                status: response.statusCode,
                durationMs: Date.now() - startedAt,
                bytes: Number(response.getHeader('content-length') ?? 0),
                bridgeConnected: bridgeConnectedAtStart,
            });
            recentRelays.splice(50);
        });
        response.on('close', () => {
            if (!response.writableEnded) cleanup(item);
        });
        queue.push(item);
        pump();
    }

    /** @param {import('node:http').IncomingMessage} request @param {import('node:http').ServerResponse} response */
    async function poll(request, response) {
        bridgeSeen();
        if (queue.length) {
            const item = /** @type {any} */ (queue.shift());
            if (!deliver(item, response)) sendText(response, 500, 'No poll response');
            return;
        }
        addWaiter(response);
    }

    /** @param {import('node:http').IncomingMessage} request @param {import('node:http').ServerResponse} response */
    async function acceptResponse(request, response) {
        bridgeSeen();
        const body = await readBody(request);
        const id = Number(request.headers['x-remote-id']);
        const item = pending.get(id);
        if (!item) {
            sendText(response, 404, 'Unknown remote request');
            return;
        }
        cleanup(item);
        if (item.response.writableEnded) {
            sendJson(response, 200, { ok: true, ignored: true });
            return;
        }
        const metadata = String(request.headers['x-remote-headers'] ?? '');
        const headers = metadata ? JSON.parse(decodeURIComponent(metadata)) : {};
        item.response.statusCode = Number(request.headers['x-remote-status']) || 200;
        for (const [name, value] of Object.entries(responseHeaders(headers))) {
            item.response.setHeader(name, value);
        }
        setCors(item.response);
        item.response.end(request.headers['x-remote-binary'] === '1' ? Buffer.from(body, 'base64') : body);
        sendJson(response, 200, { ok: true });
    }

    /** @param {import('node:http').IncomingMessage} request @param {import('node:http').ServerResponse} response */
    async function acceptChunk(request, response) {
        bridgeSeen();
        const body = await readBody(request);
        const payload = JSON.parse(body);
        const item = pending.get(payload.id);
        if (!item) {
            sendText(response, 404, 'Unknown remote stream');
            return;
        }
        if (item.response.writableEnded) {
            sendJson(response, 200, { ok: true, ignored: true });
            return;
        }
        if (!item.streamStarted) {
            item.streamStarted = true;
            item.response.statusCode = Number(payload.status) || 200;
            for (const [name, value] of Object.entries(responseHeaders(payload.headers))) {
                item.response.setHeader(name, value);
            }
            setCors(item.response);
        }
        if (payload.chunk) item.response.write(String(payload.chunk));
        if (payload.done) {
            cleanup(item);
            item.response.end();
        }
        sendJson(response, 200, { ok: true });
    }

    /** @param {import('node:http').IncomingMessage} request @param {import('node:http').ServerResponse} response @param {URL} url */
    async function route(request, response, url) {
        setCors(response);
        if (request.method === 'OPTIONS') {
            response.statusCode = 204;
            response.end();
            return;
        }
        if (url.pathname === `${REMOTE_PREFIX}poll`) return poll(request, response);
        if (url.pathname === `${REMOTE_PREFIX}response`) return acceptResponse(request, response);
        if (url.pathname === `${REMOTE_PREFIX}chunk`) return acceptChunk(request, response);
        if (url.pathname === `${REMOTE_PREFIX}client-log`) {
            if (request.method !== 'POST') {
                sendText(response, 405, 'Client log accepts POST only');
                return;
            }
            const raw = await readBody(request);
            let data;
            try {
                data = JSON.parse(raw);
            } catch {
                data = { kind: 'invalid-json', raw: raw.slice(0, 2000) };
            }
            const serialized = JSON.stringify(data ?? null);
            recentClientErrors.unshift({
                receivedAt: new Date().toISOString(),
                remoteAddress: request.socket.remoteAddress ?? '',
                data: serialized.length > 12_000 ? { truncated: serialized.slice(0, 12_000) } : data,
            });
            recentClientErrors.splice(50);
            sendJson(response, 200, { ok: true });
            return;
        }
        if (url.pathname === `${REMOTE_PREFIX}status`) {
            return sendJson(response, 200, {
                bridgeConnected: Date.now() - lastBridgeAt < pollTimeoutMs + 5_000,
                queued: queue.length,
                pending: pending.size,
                recentRelays,
                recentClientErrors,
            });
        }
        if (isRelayPath(url.pathname)) return relay(request, response, url);
        if (request.method !== 'GET' && request.method !== 'HEAD') {
            sendText(response, 405, 'Static files support GET and HEAD only');
            return;
        }
        const file = await resolveStaticFile(rootPath, url.pathname);
        if (!file) {
            sendText(response, 404, 'Not found');
            return;
        }
        if (request.method === 'HEAD') {
            response.statusCode = 200;
            response.setHeader('content-type', CONTENT_TYPES.get(path.extname(file).toLowerCase()) ?? 'application/octet-stream');
            response.end();
            return;
        }
        sendFile(file, response);
    }

    const server = createServer((request, response) => {
        const url = new URL(request.url ?? '/', 'http://localhost');
        route(request, response, url).catch((error) => {
            if (response.headersSent) {
                response.end();
                return;
            }
            sendText(response, Number(error?.status) || 500, error instanceof Error ? error.message : String(error));
        });
    });

    return {
        server,
        state: { queue, pending, waiters },
        listen() {
            return new Promise((resolve, reject) => {
                server.once('error', reject);
                server.listen(port, host, () => {
                    server.off('error', reject);
                    resolve(server.address());
                });
            });
        },
        async close() {
            for (const waiter of waiters) {
                if (waiter.timer) clearTimeout(waiter.timer);
                if (!waiter.response.writableEnded) waiter.response.end();
            }
            waiters.length = 0;
            for (const item of [...pending.values()]) {
                cleanup(item);
                if (!item.response.writableEnded) sendText(item.response, 503, 'Remote bridge stopped');
            }
            for (const item of [...queue]) {
                cleanup(item);
                if (!item.response.writableEnded) sendText(item.response, 503, 'Remote bridge stopped');
            }
            await new Promise(resolve => server.close(() => resolve(undefined)));
        },
    };
}

function localAddresses() {
    const addresses = [];
    for (const values of Object.values(networkInterfaces())) {
        for (const value of values ?? []) {
            if (value.family === 'IPv4' && !value.internal) addresses.push(value.address);
        }
    }
    return addresses;
}

async function main() {
    const { values } = parseArgs({
        options: {
            port: { type: 'string', short: 'p' },
            host: { type: 'string' },
            root: { type: 'string' },
        },
    });
    const host = values.host ?? '0.0.0.0';
    const port = Number(values.port ?? DEFAULT_PORT);
    if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error(`Invalid port: ${values.port}`);
    const remote = createRemoteHostServer({ host, port, root: values.root });
    await remote.listen();
    console.log(`TauriTavern remote host listening on http://${host}:${port}/`);
    if (host === '0.0.0.0') {
        for (const address of localAddresses()) console.log(`  http://${address}:${port}/`);
    }
    const stop = async () => {
        await remote.close();
        process.exit(0);
    };
    process.once('SIGINT', stop);
    process.once('SIGTERM', stop);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    main().catch((error) => {
        console.error(error);
        process.exit(1);
    });
}
