import { expect, test } from '@rstest/core';
import { createFrontend } from '../helpers/frontend.mjs';

/** @param {any} commits @param {string} payload */
async function finishWithPayload(commits, payload) {
    const begin = commits.begin_settings_commit({
        expectedRevision: {
            hash_algorithm: 'tt-user-settings-sections-sha256-v2',
            settings_hash: 'before',
        },
    });
    const size = commits.append_settings_commit_chunk(new TextEncoder().encode(payload), {
        headers: { 'session-id': begin.sessionId, offset: '0' },
    });
    return commits.finish_settings_commit({ sessionId: begin.sessionId, expectedSize: size });
}

test('Web Host settings commit forwards the native revision without reading settings', async () => {
    const { load, close } = await createFrontend();
    try {
        const { createSettingsCommits } = await load('tauri/web-host/protocols/settings-commit.js');
        const savedRevision = { hash_algorithm: 'tt-user-settings-sections-sha256-v2', settings_hash: 'after' };
        const sends = [];
        let reads = 0;
        const json = async () => {
            reads += 1;
            throw new Error('The native revision path must not read /api/settings/get');
        };
        const send = async (url, body, method, headers) => {
            sends.push({ url, body, method, headers });
            return {
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ result: 'ok', tauritavern_settings_revision: savedRevision }),
            };
        };

        const commits = createSettingsCommits({ json, send }, { nativeSettingsRevision: true });
        const result = await finishWithPayload(commits, JSON.stringify({ power_user: { persona_descriptions: {} } }));

        expect(result.tauritavern_settings_revision).toEqual(savedRevision);
        expect(reads).toEqual(0);
        expect(sends).toHaveLength(1);
        expect(sends[0].url).toEqual('/api/settings/save');
        expect(sends[0].headers['X-TauriTavern-Settings-Revision']).toEqual(JSON.stringify({
            hash_algorithm: 'tt-user-settings-sections-sha256-v2',
            settings_hash: 'before',
        }));
    } finally {
        close();
    }
});

test('Web Host settings commit maps a native conflict to a Web Host conflict', async () => {
    const { load, close } = await createFrontend();
    try {
        const { createSettingsCommits } = await load('tauri/web-host/protocols/settings-commit.js');
        const commits = createSettingsCommits({
            json: async () => {
                throw new Error('The native revision path must not read /api/settings/get');
            },
            send: async () => ({
                status: 409,
                headers: { 'content-type': 'text/plain' },
                body: 'Conflict: Settings revision mismatch. Reload settings before saving again.',
            }),
        }, { nativeSettingsRevision: true });

        let caught;
        try {
            await finishWithPayload(commits, JSON.stringify({ power_user: { persona_descriptions: {} } }));
        } catch (error) {
            caught = error;
        }
        expect(caught).toEqual({
            Conflict: 'Settings revision mismatch. Reload settings before saving again.',
        });
    } finally {
        close();
    }
});
