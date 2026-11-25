// @ts-check

/** @typedef {import('./install.js').BackendRequest} BackendRequest */
/** @typedef {import('./install.js').BackendResponse} BackendResponse */

/** @param {BackendRequest['body']} body */
function headersForBody(body) {
    return typeof body === 'string' ? { 'content-type': 'application/json' } : {};
}

/**
 * @param {string} method
 * @param {string} url
 * @param {BackendResponse} response
 */
function assertOk(method, url, response) {
    if (response.status < 200 || response.status >= 300) {
        throw new Error(`${method} ${url}: ${response.status} ${response.body}`);
    }
    return response;
}

/**
 * @param {string} method
 * @param {string} url
 * @param {BackendResponse} response
 */
function parseJson(method, url, response) {
    if (typeof response.body !== 'string') throw new Error(`${method} ${url}: expected a JSON response`);
    return JSON.parse(response.body);
}

/**
 * Adapts the Web Host backend to the async command layer. The handler may
 * return a response directly or a Promise for one.
 *
 * @param {import('./install.js').WebHostBackend} backend
 */
export function createAsyncBackend(backend) {
    /** @param {string} url @param {BackendRequest['body']} body @param {string} [method] */
    async function send(url, body, method = 'POST') {
        return backend.handle({ method, url, headers: headersForBody(body), body });
    }
    /** @param {string} url @param {BackendRequest['body']} body @param {string} [method] */
    async function request(url, body, method = 'POST') {
        return assertOk(method, url, await send(url, body, method));
    }
    /** @param {string} url @param {any} [body] @param {string} [method] */
    async function json(url, body = {}, method = 'POST') {
        return parseJson(
            method,
            url,
            await request(url, method === 'GET' ? null : JSON.stringify(body), method),
        );
    }
    return { json, request, send };
}
