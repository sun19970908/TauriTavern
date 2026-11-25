import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRemoteHostServer } from '../scripts/remote-host.mjs';

let root;
let remote;
let origin;

function sendResponse(item, { status, headers, body, binary = false }) {
    return fetch(`${origin}/__remote/response`, {
        method: 'POST',
        headers: {
            'content-type': 'text/plain; charset=utf-8',
            'x-remote-id': String(item.id),
            'x-remote-status': String(status),
            'x-remote-headers': encodeURIComponent(JSON.stringify(headers)),
            ...(binary ? { 'x-remote-binary': '1' } : {}),
        },
        body,
    });
}

before(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'tt-remote-host-'));
    await writeFile(path.join(root, 'index.html'), '<!doctype html><title>remote</title>');
    await writeFile(path.join(root, 'asset.txt'), 'asset');
    remote = createRemoteHostServer({ root, host: '127.0.0.1', port: 0, pollTimeoutMs: 5_000, requestTimeoutMs: 10_000 });
    await remote.listen();
    origin = `http://127.0.0.1:${remote.server.address().port}`;
});

after(async () => {
    await remote.close();
    await rm(root, { recursive: true, force: true });
});

test('remote host serves the frontend root and static assets', async () => {
    const index = await fetch(`${origin}/`);
    assert.equal(index.status, 200);
    assert.match(await index.text(), /<title>remote<\/title>/);

    const asset = await fetch(`${origin}/asset.txt`);
    assert.equal(asset.status, 200);
    assert.equal(await asset.text(), 'asset');

    const missing = await fetch(`${origin}/../package.json`);
    assert.equal(missing.status, 404);
});

test('remote host relays a request through the poll/response bridge', async () => {
    const phone = fetch(`${origin}/api/echo`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{"hello":"world"}',
    });
    const poll = await fetch(`${origin}/__remote/poll`);
    assert.equal(poll.status, 200);
    const item = await poll.json();
    assert.equal(item.method, 'POST');
    assert.equal(item.url, '/api/echo');
    assert.equal(item.body, '{"hello":"world"}');

    await sendResponse(item, {
        status: 201,
        headers: { 'content-type': 'application/json', 'x-bridge': 'yes' },
        body: '{"ok":true}',
    });
    const response = await phone;
    assert.equal(response.status, 201);
    assert.equal(response.headers.get('x-bridge'), 'yes');
    assert.deepEqual(await response.json(), { ok: true });
});

test('remote host turns multipart forms into bridge entries', async () => {
    const form = new FormData();
    form.append('name', 'Alice');
    form.append('note', 'hello');
    const phone = fetch(`${origin}/api/form`, { method: 'POST', body: form });
    const item = await (await fetch(`${origin}/__remote/poll`)).json();
    assert.equal(item.url, '/api/form');
    assert.deepEqual(item.formEntries, [['name', 'Alice'], ['note', 'hello']]);
    assert.equal(item.body, undefined);
    assert.equal(item.headers['content-type'], undefined);

    await sendResponse(item, {
        status: 200,
        headers: { 'content-type': 'text/plain' },
        body: 'ok',
    });
    assert.equal(await phone.then(response => response.text()), 'ok');
});

test('remote host relays binary responses for thumbnails', async () => {
    const phone = fetch(`${origin}/thumbnail?type=avatar&file=test.png`);
    const item = await (await fetch(`${origin}/__remote/poll`)).json();
    assert.equal(item.url, '/thumbnail?type=avatar&file=test.png');
    const payload = Buffer.from([0, 1, 2, 255]);
    await sendResponse(item, {
        status: 200,
        headers: { 'content-type': 'image/png' },
        body: payload.toString('base64'),
        binary: true,
    });
    const response = await phone;
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'image/png');
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), payload);
});

test('remote host streams chunks until done', async () => {
    const phone = fetch(`${origin}/api/stream`);
    const item = await (await fetch(`${origin}/__remote/poll`)).json();
    await fetch(`${origin}/__remote/chunk`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            id: item.id,
            status: 200,
            headers: { 'content-type': 'text/event-stream' },
            chunk: 'data: one\n\n',
        }),
    });
    const response = await phone;
    assert.equal(response.headers.get('content-type'), 'text/event-stream');
    const reader = response.body.getReader();
    assert.equal(new TextDecoder().decode((await reader.read()).value), 'data: one\n\n');

    await fetch(`${origin}/__remote/chunk`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: item.id, chunk: 'data: two\n\n', done: true }),
    });
    const rest = [];
    for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) rest.push(chunk.value);
    assert.equal(new TextDecoder().decode(Buffer.concat(rest.map(value => Buffer.from(value)))), 'data: two\n\n');
});

test('remote host relays third-party extension assets', async () => {
    const phone = fetch(`${origin}/scripts/extensions/third-party/demo/manifest.json`);
    const item = await (await fetch(`${origin}/__remote/poll`)).json();
    assert.equal(item.url, '/scripts/extensions/third-party/demo/manifest.json');
    await sendResponse(item, {
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: '{"display_name":"Demo"}',
    });
    const response = await phone;
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'application/json');
    assert.deepEqual(await response.json(), { display_name: 'Demo' });
});

test('remote host reports bridge status', async () => {
    const status = await (await fetch(`${origin}/__remote/status`)).json();
    assert.equal(status.bridgeConnected, true);
    assert.equal(status.queued, 0);
    assert.equal(status.pending, 0);
});
