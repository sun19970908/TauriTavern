// @ts-check

import { installWebHost } from './install.js';
import { createHttpBackend, createRemoteStore, detectHostIdentity, resolveBackendUrl } from './remote-backend.js';

export { createHttpBackend, createRemoteStore, detectHostIdentity } from './remote-backend.js';

/** @param {unknown} value @returns {unknown} */
function describeForRemoteLog(value) {
    if (value instanceof Error) {
        return {
            type: 'Error',
            name: value.name,
            message: value.message,
            stack: value.stack,
            code: /** @type {any} */ (value).code,
            status: /** @type {any} */ (value).status,
        };
    }
    if (typeof Response !== 'undefined' && value instanceof Response) {
        return {
            type: 'Response',
            status: value.status,
            statusText: value.statusText,
            url: value.url,
            ok: value.ok,
        };
    }
    if (typeof value === 'object' && value !== null) {
        try {
            return JSON.parse(JSON.stringify(value));
        } catch {
            return String(value);
        }
    }
    return value;
}

/** @param {string} target */
function installRemoteDiagnostics(target) {
    if (!globalThis.location?.href) return;
    const endpoint = `${target.replace(/\/+$/, '')}/__remote/client-log`;
    /** @param {string} kind @param {unknown} detail */
    const report = (kind, detail) => {
        try {
            void fetch(endpoint, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    kind,
                    at: new Date().toISOString(),
                    href: globalThis.location?.href ?? '',
                    detail,
                }),
                keepalive: true,
            }).catch(() => {});
        } catch {
            // Diagnostics must never affect the page.
        }
    };

    const originalConsoleError = console.error.bind(console);
    console.error = (...args) => {
        originalConsoleError(...args);
        report('console-error', args.map(describeForRemoteLog));
    };
    const originalConsoleWarn = console.warn.bind(console);
    console.warn = (...args) => {
        originalConsoleWarn(...args);
        report('console-warn', args.map(describeForRemoteLog));
    };

    globalThis.addEventListener('error', event => {
        report('window-error', describeForRemoteLog(event.error ?? event.message));
    });
    globalThis.addEventListener('unhandledrejection', event => {
        report('unhandled-rejection', describeForRemoteLog(event.reason));
    });

    const instrumentToastr = () => {
        const toastr = /** @type {any} */ (globalThis).toastr;
        if (!toastr || typeof toastr.error !== 'function' || toastr.__ttRemoteInstrumented) return false;
        const originalError = toastr.error;
        /** @this {any} @param {any} message @param {any} title @param {...any} rest */
        const remoteToastError = function (message, title, ...rest) {
            report('toastr-error', {
                title: describeForRemoteLog(title),
                message: describeForRemoteLog(message),
            });
            return originalError.call(this, message, title, ...rest);
        };
        toastr.error = remoteToastError;
        toastr.__ttRemoteInstrumented = true;
        return true;
    };

    if (!instrumentToastr()) {
        const timer = setInterval(() => {
            if (instrumentToastr()) clearInterval(timer);
        }, 500);
        setTimeout(() => clearInterval(timer), 60_000);
    }

    report('install', {
        baseUrl: target,
        userAgent: globalThis.navigator?.userAgent ?? '',
        language: globalThis.navigator?.language ?? '',
    });
}

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
        nativeSettingsRevision: true,
    });
    /** @type {any} */ (globalThis).__TAURITAVERN_REMOTE__ = { baseUrl: target };
    installRemoteDiagnostics(target);
    return host;
}
