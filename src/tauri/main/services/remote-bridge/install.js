// @ts-check

const DEFAULT_BASE_URL = 'http://127.0.0.1:8787';
const DEFAULT_POLL_DELAY_MS = 3_000;

/** @type {{ stop: () => void } | null} */
let active = null;

/** @param {number} ms */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/** @param {string} contentType */
function isTextResponse(contentType) {
    return contentType === '' || contentType.startsWith('text/') || contentType.includes('json') || contentType.includes('xml');
}

/** @param {Uint8Array} bytes */
function toBase64(bytes) {
    let binary = '';
    for (let index = 0; index < bytes.length; index += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
    }
    return btoa(binary);
}

/**
 * Serve the PC frontend's existing fetch router to the remote host. This is a
 * bridge only: requests are executed by the patched fetch and the native
 * Tauri commands behind it.
 *
 * @param {{
 *   baseUrl?: string,
 *   fetchImpl?: typeof fetch,
 *   pollDelayMs?: number,
 * }} [options]
 */
export function installRemoteBridge({
    baseUrl = DEFAULT_BASE_URL,
    fetchImpl = globalThis.fetch,
    pollDelayMs = DEFAULT_POLL_DELAY_MS,
} = {}) {
    if (active) return active;
    if (typeof fetchImpl !== 'function') throw new Error('Remote bridge requires fetch');

    const controller = new AbortController();
    let stopped = false;

    /** @param {string} path @param {unknown} value */
    async function post(path, value) {
        const response = await fetchImpl(`${baseUrl}${path}`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(value),
            signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Remote bridge ${path}: ${response.status} ${await response.text()}`);
        return response;
    }

    /** @param {number} id @param {number} status @param {Record<string, string>} headers @param {string} body @param {boolean} [binary] */
    async function postResponse(id, status, headers, body, binary = false) {
        const response = await fetchImpl(`${baseUrl}/__remote/response`, {
            method: 'POST',
            headers: {
                'content-type': 'text/plain; charset=utf-8',
                'x-remote-id': String(id),
                'x-remote-status': String(status),
                'x-remote-headers': encodeURIComponent(JSON.stringify(headers)),
                ...(binary ? { 'x-remote-binary': '1' } : {}),
            },
            body,
            signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Remote bridge response ${id}: ${response.status} ${await response.text()}`);
    }

    /** @param {{ id: number, method: string, url: string, headers?: Record<string, string>, body?: string, formEntries?: [string, string][] }} item */
    async function execute(item) {
        const headers = new Headers(item.headers ?? {});
        /** @type {BodyInit | undefined} */
        let body;
        if (item.formEntries) {
            const form = new FormData();
            for (const [name, value] of item.formEntries) form.append(name, value);
            headers.delete('content-type');
            body = form;
        } else if (item.method !== 'GET' && item.body !== undefined) {
            body = item.body;
        }

        let response;
        try {
            response = await fetchImpl(new URL(item.url, globalThis.location.origin), {
                method: item.method,
                headers,
                body: body ?? null,
                signal: controller.signal,
            });
        } catch (error) {
            await postResponse(
                item.id,
                500,
                { 'content-type': 'text/plain; charset=utf-8' },
                String(error instanceof Error ? error.message : error),
            ).catch(() => {});
            return;
        }

        const contentType = response.headers.get('content-type') ?? '';
        if (!contentType.includes('text/event-stream') || !response.body) {
            if (isTextResponse(contentType)) {
                await postResponse(item.id, response.status, Object.fromEntries(response.headers), await response.text()).catch(() => {});
            } else {
                const bytes = new Uint8Array(await response.arrayBuffer());
                await postResponse(item.id, response.status, Object.fromEntries(response.headers), toBase64(bytes), true).catch(() => {});
            }
            return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let first = true;
        try {
            while (!stopped) {
                const { value, done } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                await post('/__remote/chunk', {
                    id: item.id,
                    ...(first ? { status: response.status, headers: Object.fromEntries(response.headers) } : {}),
                    chunk,
                });
                first = false;
            }
            const tail = decoder.decode();
            if (tail) await post('/__remote/chunk', { id: item.id, chunk: tail });
            await post('/__remote/chunk', {
                id: item.id,
                ...(first ? { status: response.status, headers: Object.fromEntries(response.headers) } : {}),
                done: true,
            });
        } catch (error) {
            if (!stopped) {
                console.error('TauriTavern remote bridge stream failed', error);
                await post('/__remote/chunk', { id: item.id, done: true }).catch(() => {});
            }
        } finally {
            reader.releaseLock();
        }
    }

    async function pollLoop() {
        while (!stopped) {
            try {
                const response = await fetchImpl(`${baseUrl}/__remote/poll`, {
                    cache: 'no-store',
                    signal: controller.signal,
                });
                if (response.status === 204) continue;
                if (!response.ok) throw new Error(`Remote bridge poll: ${response.status}`);
                const item = await response.json();
                void execute(item);
            } catch {
                if (stopped) return;
                await sleep(pollDelayMs);
            }
        }
    }

    active = {
        stop() {
            if (stopped) return;
            stopped = true;
            controller.abort();
        },
    };
    globalThis.addEventListener('pagehide', active.stop, { once: true });
    void pollLoop();
    return active;
}
