// @ts-check

import { installWebHost } from './install.js';
import { createHttpBackend, createRemoteStore, detectHostIdentity, resolveBackendUrl } from './remote-backend.js';

export { createHttpBackend, createRemoteStore, detectHostIdentity } from './remote-backend.js';

/**
 * Install the browser host when the native bridge is absent. Call before init.js.
 *
 * @param {{
 *   baseUrl?: string,
 *   identity?: import('../../scripts/util/host-identity.js').HostIdentity,
 *   storage?: Storage,
 * }} [options]
 */
export function installRemoteWebHost({ baseUrl, identity, storage = globalThis.localStorage } = {}) {
    if (!storage) throw new Error('Remote Web Host requires localStorage');
    const target = baseUrl ?? resolveBackendUrl(storage);
    const host = installWebHost({
        identity: identity ?? detectHostIdentity(),
        backend: createHttpBackend(target),
        store: createRemoteStore(storage),
    });
    /** @type {any} */ (globalThis).__TAURITAVERN_REMOTE__ = { baseUrl: target };
    return host;
}
