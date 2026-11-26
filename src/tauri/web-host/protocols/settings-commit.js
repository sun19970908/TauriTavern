// @ts-check

import { createByteCommits } from './byte-commit.js';
import { settingsRevision } from '../commands/read.js';
import { personaProjection, personaRecords } from '../../main/kernel/persona-projection.js';

const SETTINGS_REVISION_HEADER = 'X-TauriTavern-Settings-Revision';

/** @param {any} response */
function parseSavedResult(response) {
    if (typeof response.body !== 'string') return response.body ?? {};
    return response.body.trim() ? JSON.parse(response.body) : {};
}

/** @param {any} response @returns {{ Conflict: string }} */
function conflictFromResponse(response) {
    const message = typeof response.body === 'string' ? response.body.trim() : '';
    const detail = message.replace(/^Conflict:\s*/i, '');
    return { Conflict: detail || 'Settings changed. Reload before saving again.' };
}

/**
 * In native-revision mode the browser forwards its expected revision to
 * `/api/settings/save`; the PC route and Rust repository compare it against
 * the stored sections in the same write. The full settings aggregate is not
 * read just to obtain the revision.
 *
 * @param {ReturnType<import('../backend.js').createAsyncBackend>} backend
 * @param {{ nativeSettingsRevision?: boolean }} [options]
 * @returns {import('../install.js').CommandHandlers}
 */
export function createSettingsCommits({ json, request, send }, { nativeSettingsRevision = false } = {}) {
    const commits = createByteCommits();
    return {
        begin_settings_commit: commits.begin,
        append_settings_commit_chunk: commits.append,
        finish_settings_commit: async args => {
            const { metadata: { expectedRevision }, text } = commits.finish(args);
            const payload = JSON.parse(text);

            if (!nativeSettingsRevision) {
                const current = await json('/api/settings/get');
                const revision = current.tauritavern_settings_revision ?? settingsRevision(current.settings);
                if (expectedRevision != null && (expectedRevision.hash_algorithm !== revision.hash_algorithm
                        || expectedRevision.settings_hash !== revision.settings_hash)) {
                    throw { Conflict: 'Settings changed. Reload before saving again.' };
                }
                // The registry is a delta of complete cards; omitted ids remain stored.
                const personas = { ...personaRecords(JSON.parse(current.settings)), ...personaRecords(payload) };
                payload.power_user = { ...payload.power_user, ...personaProjection(personas) };
                const saved = await request('/api/settings/save', JSON.stringify(payload));
                const savedResult = parseSavedResult(saved);
                return {
                    ...savedResult,
                    result: 'ok',
                    tauritavern_settings_revision: savedResult.tauritavern_settings_revision
                        ?? settingsRevision((await json('/api/settings/get')).settings),
                    persona_errors: savedResult.persona_errors ?? {},
                };
            }

            const headers = expectedRevision == null
                ? {}
                : { [SETTINGS_REVISION_HEADER]: JSON.stringify(expectedRevision) };
            const saved = await send('/api/settings/save', JSON.stringify(payload), 'POST', headers);
            if (saved.status === 409) throw conflictFromResponse(saved);
            if (saved.status < 200 || saved.status >= 300) {
                throw new Error(`POST /api/settings/save: ${saved.status} ${saved.body}`);
            }
            const savedResult = parseSavedResult(saved);
            if (!savedResult.tauritavern_settings_revision) {
                throw new Error('Settings save response is missing tauritavern_settings_revision');
            }
            return {
                ...savedResult,
                result: savedResult.result ?? 'ok',
                persona_errors: savedResult.persona_errors ?? {},
            };
        },
        abort_settings_commit: commits.abort,
    };
}
