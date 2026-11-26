import assert from 'node:assert/strict';
import test from 'node:test';

import { createChatCommits } from '../src/tauri/web-host/protocols/chat-commit.js';

const TARGET = Object.freeze({ kind: 'character', characterId: 'Alice', fileName: 'Story' });

function createBackend() {
    const calls = [];
    return {
        calls,
        request: async (url, body) => {
            calls.push({ url, body });
            return { status: 200, body: '{"ok":true}' };
        },
        send: async (url, body) => {
            calls.push({ url, body });
            return { status: 200, body: '{"ok":true}' };
        },
        json: async (url, body) => {
            calls.push({ url, body: JSON.stringify(body) });
            if (url === '/api/chats/get') {
                return [{ chat_metadata: { integrity: 'source' } }, { mes: 'old' }];
            }
            return { ok: true };
        },
    };
}

async function commit(backend, kind, value, namespace) {
    const commits = createChatCommits(backend);
    const operation = kind === 'payload'
        ? { kind, force: false }
        : namespace === undefined ? { kind } : { kind, namespace };
    const begin = commits.begin_chat_commit({ target: TARGET, operation });
    const serialized = kind === 'payload'
        ? value.map(record => JSON.stringify(record)).join('\n')
        : JSON.stringify(value);
    const body = Buffer.from(serialized);
    const accepted = commits.append_chat_commit_chunk(body, {
        headers: { 'session-id': begin.sessionId, offset: '0' },
    });
    assert.equal(accepted, body.byteLength);
    await commits.finish_chat_commit({ sessionId: begin.sessionId, expectedSize: body.byteLength });
}

test('metadata commits send only the header value to the native route', async () => {
    const backend = createBackend();
    await commit(backend, 'metadata', { variables: { score: 1 } });

    assert.deepEqual(backend.calls.map(call => call.url), ['/api/chats/metadata']);
    const body = JSON.parse(backend.calls[0].body);
    assert.equal(body.avatar_url, 'Alice.png');
    assert.equal(body.file_name, 'Story');
    assert.deepEqual(body.chat_metadata, { variables: { score: 1 } });
    assert.equal(body.chat, undefined);
});

test('metadata extension commits carry the namespace to the native route', async () => {
    const backend = createBackend();
    await commit(backend, 'metadataExtension', { enabled: true }, 'example');

    assert.deepEqual(backend.calls.map(call => call.url), ['/api/chats/metadata']);
    const body = JSON.parse(backend.calls[0].body);
    assert.equal(body.namespace, 'example');
    assert.deepEqual(body.chat_metadata, { enabled: true });
});

test('payload commits still read the current integrity before a full save', async () => {
    const backend = createBackend();
    backend.request = async (url, body) => {
        backend.calls.push({ url, body });
        if (url === '/api/chats/get') {
            return { status: 200, body: JSON.stringify([{ chat_metadata: { integrity: 'source' } }, { mes: 'old' }]) };
        }
        return { status: 200, body: '{"ok":true}' };
    };
    await commit(backend, 'payload', [{ chat_metadata: { integrity: 'source' } }, { mes: 'new' }]);

    assert.deepEqual(backend.calls.map(call => call.url), ['/api/chats/get', '/api/chats/save']);
    const save = JSON.parse(backend.calls[1].body);
    assert.equal(save.chat.length, 2);
    assert.equal(save.force, false);
});

test('native metadata integrity responses become the chat commit integrity error', async () => {
    const backend = createBackend();
    backend.send = async (url, body) => {
        backend.calls.push({ url, body });
        return { status: 400, body: '{"error":"integrity"}' };
    };
    await assert.rejects(
        () => commit(backend, 'metadata', { integrity: 'changed' }),
        error => error?.BadRequest === 'integrity',
    );
});
