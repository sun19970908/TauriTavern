// @ts-check
import { createByteCommits } from './byte-commit.js';
import { characterAvatarFileNameFromStem } from '../../main/services/characters/character-identity.js';
import { readChatRecords } from '../commands/chat.js';

/** @param {ReturnType<import('../backend.js').createAsyncBackend>} backend @returns {import('../install.js').CommandHandlers} */
export function createChatCommits(backend) {
    const { request, send } = backend;
    const commits = createByteCommits();
    /** @param {any} response */
    function assertMetadataResponse(response) {
        if (response.status >= 200 && response.status < 300) return;
        if (response.status === 400 && typeof response.body === 'string') {
            /** @type {any} */
            let problem = null;
            try {
                problem = JSON.parse(response.body);
            } catch {
                // A malformed error body falls through to the generic failure.
            }
            if (problem?.error === 'integrity') throw { BadRequest: 'integrity' };
        }
        throw new Error(`POST /api/chats/metadata: ${response.status} ${response.body}`);
    }
    return {
        begin_chat_commit: ({ target, operation }) => {
            if (target.kind !== 'character' || operation.coldSourceId != null) {
                throw { Unsupported: 'Web Host supports character chat commits without cold swipe resources' };
            }
            return commits.begin({ target, operation });
        },
        append_chat_commit_chunk: commits.append,
        finish_chat_commit: async args => {
            const { metadata: { target, operation }, text } = commits.finish(args);
            const address = { avatar_url: characterAvatarFileNameFromStem(target.characterId), file_name: target.fileName };
            let chat;
            let force = false;
            switch (operation.kind) {
                case 'payload': {
                    const current = await readChatRecords(backend, address);
                    const integrity = current?.[0]?.chat_metadata?.integrity;
                    chat = text.split('\n').filter(Boolean).map(line => JSON.parse(line));
                    force = operation.force;
                    if (!force && integrity != null && integrity !== chat[0]?.chat_metadata?.integrity) {
                        throw { BadRequest: 'integrity' };
                    }
                    break;
                }
                case 'metadata':
                    assertMetadataResponse(await send('/api/chats/metadata', JSON.stringify({
                        ...address,
                        chat_metadata: JSON.parse(text),
                    })));
                    return;
                case 'metadataExtension':
                    assertMetadataResponse(await send('/api/chats/metadata', JSON.stringify({
                        ...address,
                        namespace: operation.namespace,
                        chat_metadata: JSON.parse(text),
                    })));
                    return;
                default: throw { BadRequest: `Unknown chat commit operation: ${operation.kind}` };
            }
            await request('/api/chats/save', JSON.stringify({ ...address, chat, force }));
        },
        abort_chat_commit: commits.abort,
    };
}
