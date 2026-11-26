import { createAbortError, isAbortError } from './kernel/abort-error.js';
import { streamResponse } from './http-utils.js';

function getTypeTag(value) {
    return Object.prototype.toString.call(value);
}

function isBinaryOrFormBody(value) {
    const tag = getTypeTag(value);
    return tag === '[object FormData]'
        || tag === '[object Blob]'
        || tag === '[object ArrayBuffer]'
        || ArrayBuffer.isView(value);
}

function appendQueryParams(url, query) {
    const cleaned = String(query || '').replace(/^\?+/, '');
    if (!cleaned) {
        return url;
    }

    const updated = new URL(url.href);
    updated.search = updated.search ? `${updated.search}&${cleaned}` : `?${cleaned}`;
    return updated;
}

function buildAjaxHeaders(rawHeaders, contentType, hasBody, skipDefaultContentType) {
    const headers = new Headers();
    if (rawHeaders instanceof Headers || getTypeTag(rawHeaders) === '[object Headers]') {
        for (const [name, value] of rawHeaders.entries()) {
            headers.append(name, value);
        }
    } else if (Array.isArray(rawHeaders)) {
        for (const entry of rawHeaders) {
            if (Array.isArray(entry) && entry.length >= 2 && entry[1] !== undefined && entry[1] !== null) {
                headers.append(entry[0], String(entry[1]));
            }
        }
    } else if (rawHeaders && typeof rawHeaders === 'object') {
        for (const [name, value] of Object.entries(rawHeaders)) {
            if (value !== undefined && value !== null) {
                headers.set(name, String(value));
            }
        }
    }

    if (contentType !== false && !headers.has('content-type')) {
        if (typeof contentType === 'string') {
            const trimmed = contentType.trim();
            if (trimmed) {
                headers.set('content-type', trimmed);
            }
        } else if (contentType === undefined && hasBody && !skipDefaultContentType) {
            headers.set('content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
        }
    }

    return headers;
}

function prepareAjaxRequest(requestUrl, options, $, signal) {
    const method = String(options.type || options.method || 'GET').toUpperCase();
    const isBodylessMethod = method === 'GET' || method === 'HEAD';
    const processData = options.processData !== false;

    let targetUrl = requestUrl;
    let body = options.data;
    const isSearchParams = getTypeTag(body) === '[object URLSearchParams]';
    const binaryOrForm = isBinaryOrFormBody(body);

    if (isBodylessMethod) {
        if (body !== undefined && body !== null && processData) {
            const query = typeof body === 'string'
                ? body
                : isSearchParams
                    ? body.toString()
                    : !binaryOrForm && typeof body === 'object'
                        ? $.param(body, options.traditional)
                        : '';
            targetUrl = appendQueryParams(requestUrl, query);
        }
        body = undefined;
    } else if (processData && body !== undefined && body !== null && typeof body === 'object' && !binaryOrForm && !isSearchParams) {
        body = $.param(body, options.traditional);
    }

    const hasBody = body !== undefined && body !== null;
    const headers = buildAjaxHeaders(options.headers, options.contentType, hasBody, binaryOrForm);
    return {
        targetUrl,
        init: {
            method,
            headers,
            body,
            signal,
        },
    };
}

export function createInterceptors({
    originalFetch,
    canHandleRequest,
    toUrl,
    routeRequest,
}) {
    const fetchPatchState = new WeakMap();
    const ajaxPatchState = new WeakMap();
    const OPAQUE_BASE_PROTOCOLS = new Set(['about:', 'blob:', 'data:', 'javascript:']);

    function getAbortSignal(input, init) {
        if (init && typeof init === 'object' && init.signal) {
            return init.signal;
        }

        if (input && typeof input === 'object' && 'signal' in input) {
            return input.signal;
        }

        return null;
    }

    function createAbortRace(signal) {
        if (!signal || typeof signal.addEventListener !== 'function') {
            return null;
        }

        if (signal.aborted) {
            return {
                promise: Promise.reject(createAbortError()),
                cleanup: () => {},
            };
        }

        let abortHandler = null;
        const abortPromise = new Promise((_, reject) => {
            abortHandler = () => reject(createAbortError());
            signal.addEventListener('abort', abortHandler, { once: true });
        });

        return {
            promise: abortPromise,
            cleanup: () => {
                if (abortHandler) {
                    signal.removeEventListener('abort', abortHandler);
                }
            },
        };
    }

    async function routedResponse(requestUrl, input, init, targetWindow) {
        const signal = getAbortSignal(input, init);
        if (signal?.aborted) throw createAbortError();
        const abortRace = createAbortRace(signal);
        try {
            const pending = Promise.resolve(routeRequest(requestUrl, input, init, targetWindow))
                .then((result) => {
                    if (signal?.aborted) {
                        // Opening may finish after the caller has already aborted.
                        void result.body?.cancel().catch(error => console.warn('Failed to close aborted response', error));
                        throw createAbortError();
                    }
                    return signal && result.body ? streamResponse(result.body, result, signal) : result;
                });
            return await (abortRace ? Promise.race([pending, abortRace.promise]) : pending);
        } finally {
            abortRace?.cleanup();
        }
    }

    function resolveWindowBaseUrl(targetWindow) {
        try {
            const href = String(targetWindow?.location?.href || '');
            if (href) {
                const parsedHref = new URL(href, window.location.origin);
                if (!OPAQUE_BASE_PROTOCOLS.has(parsedHref.protocol)) {
                    return parsedHref.href;
                }
            }

            const origin = String(targetWindow?.location?.origin || '');
            if (origin && origin !== 'null') {
                return origin;
            }

        } catch {
            // Ignore cross-origin access failures.
        }

        return window.location.origin;
    }

    function getFetchDelegate(targetWindow) {
        const state = fetchPatchState.get(targetWindow);
        let currentFetch;
        try {
            currentFetch = targetWindow?.fetch;
        } catch {
            return null;
        }

        if (state && currentFetch === state.patchedFetch) {
            return state.delegateFetch;
        }

        if (typeof currentFetch === 'function') {
            return currentFetch.bind(targetWindow);
        }

        if (targetWindow === window && typeof originalFetch === 'function') {
            return originalFetch;
        }

        return null;
    }

    function patchFetch(targetWindow = window) {
        if (!targetWindow) {
            return;
        }

        let currentFetch;
        try {
            currentFetch = targetWindow.fetch;
        } catch {
            return;
        }

        const state = fetchPatchState.get(targetWindow);
        if (state && currentFetch === state.patchedFetch) {
            return;
        }

        const delegateFetch = getFetchDelegate(targetWindow);
        if (!delegateFetch) {
            return;
        }

        const patchedFetch = async function patchedFetch(input, init = {}) {
            const signal = getAbortSignal(input, init);
            if (signal?.aborted) {
                throw createAbortError();
            }

            const requestUrl = toUrl(input, resolveWindowBaseUrl(targetWindow));
            if (!requestUrl || !canHandleRequest(requestUrl, input, init, targetWindow)) {
                return delegateFetch(input, init);
            }

            return routedResponse(requestUrl, input, init, targetWindow);
        };

        try {
            targetWindow.fetch = patchedFetch;
            fetchPatchState.set(targetWindow, { patchedFetch, delegateFetch });
        } catch {
            // Ignore non-writable or cross-origin fetch bindings.
        }
    }

    function patchJQueryAjax(targetWindow = window) {
        if (!targetWindow) {
            return;
        }

        let $;
        try {
            $ = targetWindow.jQuery || targetWindow.$;
        } catch {
            return;
        }
        if (!$ || typeof $.ajax !== 'function') {
            return;
        }

        const state = ajaxPatchState.get(targetWindow);
        if (state && state.owner === $ && $.ajax === state.patchedAjax) {
            return;
        }

        const originalAjax = $.ajax.bind($);

        const patchedAjax = function ajaxProxy(urlOrOptions, maybeOptions) {
            const options = typeof urlOrOptions === 'string'
                ? { ...(maybeOptions || {}), url: urlOrOptions }
                : { ...(urlOrOptions || {}) };

            const requestUrl = toUrl(options.url, resolveWindowBaseUrl(targetWindow));
            if (!requestUrl || !canHandleRequest(requestUrl, options.url, {
                method: options.type || options.method || 'GET',
            }, targetWindow)) {
                return originalAjax(urlOrOptions, maybeOptions);
            }

            const deferred = $.Deferred();
            const jqXHR = deferred.promise();
            const controller = new AbortController();
            jqXHR.abort = () => { controller.abort(); return jqXHR; };

            (async () => {
                const { targetUrl, init } = prepareAjaxRequest(requestUrl, options, $, controller.signal);
                const response = await routedResponse(targetUrl, options.url, init, targetWindow);

                jqXHR.status = response.status;
                jqXHR.readyState = 4;
                jqXHR.getResponseHeader = (name) => response.headers.get(name);

                const dataType = (options.dataType || '*').toLowerCase();
                const isJson = dataType === 'json' || (dataType === '*'
                    && /\bjson\b/i.test(response.headers.get('Content-Type') || ''));
                let payload;

                if (response.ok) {
                    const noContent = response.status === 204 || init.method.toUpperCase() === 'HEAD';
                    payload = noContent ? undefined : isJson ? await response.json() : await response.text();
                } else if (isJson) {
                    const text = await response.text();
                    const normalized = String(text ?? '').trim();
                    if (!normalized) {
                        payload = '';
                    } else {
                        try {
                            payload = JSON.parse(normalized);
                        } catch {
                            payload = normalized;
                        }
                    }
                } else {
                    payload = await response.text();
                }

                jqXHR.responseJSON = isJson && typeof payload !== 'string' ? payload : undefined;
                if (typeof payload === 'string') {
                    jqXHR.responseText = payload;
                } else {
                    // Preserve jqXHR compatibility without serializing JSON unless responseText is read.
                    Object.defineProperty(jqXHR, 'responseText', {
                        configurable: true,
                        enumerable: true,
                        get() {
                            const responseText = JSON.stringify(payload);
                            Object.defineProperty(jqXHR, 'responseText', {
                                configurable: true,
                                enumerable: true,
                                writable: true,
                                value: responseText,
                            });
                            return responseText;
                        },
                    });
                }

                if (response.ok) {
                    if (typeof options.success === 'function') {
                        options.success(payload, 'success', jqXHR);
                    }
                    if (typeof options.complete === 'function') {
                        options.complete(jqXHR, 'success');
                    }
                    deferred.resolve(payload, 'success', jqXHR);
                    return;
                }

                const message = typeof payload === 'string'
                    ? payload
                    : payload?.error || response.statusText;
                const error = new Error(message);

                if (typeof options.error === 'function') {
                    options.error(jqXHR, 'error', error);
                }
                if (typeof options.complete === 'function') {
                    options.complete(jqXHR, 'error');
                }

                deferred.reject(jqXHR, 'error', error);
            })().catch((error) => {
                const status = isAbortError(error) ? 'abort' : error instanceof SyntaxError ? 'parsererror' : 'error';
                if (typeof options.error === 'function') {
                    options.error(jqXHR, status, error);
                }
                if (typeof options.complete === 'function') {
                    options.complete(jqXHR, status);
                }
                deferred.reject(jqXHR, status, error);
            });

            return jqXHR;
        };

        $.ajax = patchedAjax;
        if (targetWindow.$ && targetWindow.$ !== $) {
            targetWindow.$.ajax = patchedAjax;
        }
        if (targetWindow.jQuery && targetWindow.jQuery !== $) {
            targetWindow.jQuery.ajax = patchedAjax;
        }

        ajaxPatchState.set(targetWindow, { owner: $, patchedAjax });
    }

    return {
        patchFetch,
        patchJQueryAjax,
    };
}
