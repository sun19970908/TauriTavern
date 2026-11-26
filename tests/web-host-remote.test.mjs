import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createHttpBackend, createRemoteStore, detectHostIdentity } from '../src/tauri/web-host/remote-backend.js';
import { createAsyncBackend } from '../src/tauri/web-host/backend.js';

let server;
let origin;
const requests = new Map();

before(async () => {
    server = createServer(async (request, response) => {
        const chunks = [];
        for await (const chunk of request) chunks.push(chunk);
        const body = Buffer.concat(chunks).toString('utf8');
        requests.set(`${request.method} ${request.url}`, { headers: request.headers, body });

        if (request.url === '/version') {
            response.setHeader('content-type', 'application/json');
            response.end(JSON.stringify({ agent: 'review' }));
        } else if (request.url === '/api/json') {
            response.setHeader('content-type', 'application/json');
            response.end(JSON.stringify({ method: request.method, body: JSON.parse(body) }));
        } else if (request.url === '/api/form') {
            response.setHeader('content-type', 'text/plain');
            response.end('form-ok');
        } else if (request.url === '/api/binary') {
            response.setHeader('content-type', 'image/png');
            response.end(Buffer.from([0, 1, 2, 255]));
        } else if (request.url === '/api/stream') {
            response.setHeader('content-type', 'text/event-stream');
            response.write('data: one\n\n');
            response.end('data: two\n\n');
        } else if (request.url === '/api/error') {
            response.statusCode = 400;
            response.setHeader('content-type', 'text/plain');
            response.end('bad');
        } else {
            response.statusCode = 404;
            response.end();
        }
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    origin = `http://127.0.0.1:${server.address().port}`;
});

after(() => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())));

test('HTTP backend maps GET, JSON POST and error responses', async () => {
    const backend = createHttpBackend(origin);
    const version = await backend.handle({ method: 'GET', url: '/version', headers: {}, body: null });
    assert.equal(version.status, 200);
    assert.deepEqual(JSON.parse(version.body), { agent: 'review' });

    const json = await backend.handle({
        method: 'POST', url: '/api/json', headers: { 'content-type': 'application/json' }, body: '{"hello":"world"}',
    });
    assert.equal(json.status, 200);
    assert.deepEqual(JSON.parse(json.body), { method: 'POST', body: { hello: 'world' } });

    const failure = await backend.handle({ method: 'POST', url: '/api/error', headers: {}, body: '{}' });
    assert.equal(failure.status, 400);
    assert.equal(failure.body, 'bad');
});

test('async backend merges custom request headers', async () => {
    /** @type {any[]} */
    const seen = [];
    const st = createAsyncBackend({
        async handle(request) {
            seen.push(request);
            return {
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(request.headers),
            };
        },
    });

    const response = await st.send('/api/settings/save', '{}', 'POST', {
        'X-TauriTavern-Settings-Revision': '{"hash":"before"}',
    });
    assert.equal(response.status, 200);
    assert.equal(seen.length, 1);
    assert.equal(seen[0].headers['content-type'], 'application/json');
    assert.equal(seen[0].headers['X-TauriTavern-Settings-Revision'], '{"hash":"before"}');
});

test('HTTP backend encodes form entries as multipart and lets fetch set the boundary', async () => {
    const backend = createHttpBackend(origin);
    const response = await backend.handle({
        method: 'POST', url: '/api/form', headers: {},
        body: { kind: 'form', entries: [['name', 'Alice'], ['note', 'hello']] },
    });
    assert.equal(response.status, 200);
    assert.equal(response.body, 'form-ok');
    const request = requests.get('POST /api/form');
    assert.match(request.headers['content-type'], /^multipart\/form-data; boundary=/);
    assert.match(request.body, /name="name"\r\n\r\nAlice/);
    assert.match(request.body, /name="note"\r\n\r\nhello/);
});

test('HTTP backend keeps event streams as a readable body', async () => {
    const backend = createHttpBackend(origin);
    const response = await backend.handle({ method: 'POST', url: '/api/stream', headers: {}, body: '{}' });
    assert.equal(response.status, 200);
    assert.equal(response.headers['content-type'], 'text/event-stream');
    assert.equal(await new Response(response.body).text(), 'data: one\n\ndata: two\n\n');
});

test('HTTP backend keeps binary responses as a readable body', async () => {
    const backend = createHttpBackend(origin);
    const response = await backend.handle({ method: 'GET', url: '/api/binary', headers: {}, body: null });
    assert.equal(response.status, 200);
    assert.equal(response.headers['content-type'], 'image/png');
    assert.deepEqual(new Uint8Array(await new Response(response.body).arrayBuffer()), new Uint8Array([0, 1, 2, 255]));
});

test('remote host identity follows the browser user agent', () => {
    assert.deepEqual(detectHostIdentity('Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36'), { platform: 'android', kind: 'mobile' });
    assert.deepEqual(detectHostIdentity('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'), { platform: 'ios', kind: 'mobile' });
    assert.deepEqual(detectHostIdentity('Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)'), { platform: 'macos', kind: 'desktop' });
    assert.deepEqual(detectHostIdentity('Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)', 5), { platform: 'ios', kind: 'mobile' });
    assert.deepEqual(detectHostIdentity('Mozilla/5.0 (X11; Linux x86_64)'), { platform: 'linux', kind: 'desktop' });
    assert.deepEqual(detectHostIdentity('Mozilla/5.0 (Windows NT 10.0; Win64; x64)'), { platform: 'windows', kind: 'desktop' });
});

test('remote store persists one JSON document and rejects non-objects', () => {
    const values = new Map();
    const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
    const store = createRemoteStore(storage);
    assert.equal(store.load(), null);
    store.save({ settings: { theme: 'dark' } });
    assert.deepEqual(store.load(), { settings: { theme: 'dark' } });

    values.set('tauritavern:remote:web-host', '[]');
    assert.throws(() => store.load(), /not an object/);
});
