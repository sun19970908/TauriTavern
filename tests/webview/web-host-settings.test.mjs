import { expect, test } from '@rstest/core';
import { createFrontend } from '../helpers/frontend.mjs';

test('Web Host settings commit keeps the backend revision', async () => {
    const { load, close } = await createFrontend();
    try {
        const { createSettingsCommits } = await load('tauri/web-host/protocols/settings-commit.js');
        const currentRevision = { hash_algorithm: 'tt-user-settings-sections-sha256-v2', settings_hash: 'before' };
        const savedRevision = { hash_algorithm: 'tt-user-settings-sections-sha256-v2', settings_hash: 'after' };
        const settings = JSON.stringify({ power_user: { persona_descriptions: {} } });
        const json = async url => {
            if (url === '/api/settings/get') return { settings, tauritavern_settings_revision: currentRevision };
            throw new Error(`Unexpected JSON request: ${url}`);
        };
        const request = async (url) => {
            if (url !== '/api/settings/save') throw new Error(`Unexpected request: ${url}`);
            return {
                status: 200,
                body: JSON.stringify({ result: 'ok', tauritavern_settings_revision: savedRevision }),
            };
        };

        const commits = createSettingsCommits({ json, request });
        const begin = commits.begin_settings_commit({ expectedRevision: currentRevision });
        const payload = JSON.stringify({ power_user: { persona_descriptions: {} } });
        const size = commits.append_settings_commit_chunk(new TextEncoder().encode(payload), {
            headers: { 'session-id': begin.sessionId, offset: '0' },
        });
        const result = await commits.finish_settings_commit({ sessionId: begin.sessionId, expectedSize: size });

        expect(result.tauritavern_settings_revision).toEqual(savedRevision);
    } finally {
        close();
    }
});
