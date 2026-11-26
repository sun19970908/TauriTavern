import { expect, test } from '@rstest/core';
import { frontendText, importFrontend } from '../helpers/frontend.mjs';

const jquerySource = await frontendText('lib/jquery-3.5.1.min.js');
const { createInterceptors } = await importFrontend('tauri/main/interceptors.js');
const { jsonResponse, readRequestBody, textResponse } = await importFrontend('tauri/main/http-utils.js');

function installAjax(routeRequest, options = { dataType: 'json' }) {
    const iframe = document.createElement('iframe');
    document.body.append(iframe);
    const frame = iframe.contentWindow;
    frame.eval(jquerySource);
    createInterceptors({
        originalFetch: frame.fetch.bind(frame),
        canHandleRequest: () => true,
        toUrl: (input, base) => new URL(String(input), base),
        routeRequest,
    }).patchJQueryAjax(frame);
    return {
        frame,
        xhr: frame.jQuery.ajax({ url: '/api/test', ...options }),
    };
}

function completed(xhr) {
    return new Promise((resolve, reject) => xhr.done(resolve).fail((_, status, error) => reject(error)));
}

test('jQuery abort cancels an active response body', async () => {
    const reading = Promise.withResolvers();
    const cancelled = Promise.withResolvers();
    const { xhr } = installAjax(async () => new Response(new ReadableStream({
        pull() { reading.resolve(); },
        cancel() { cancelled.resolve(); },
    })));
    const outcome = completed(xhr);
    await reading.promise;
    xhr.abort();
    await expect(outcome).rejects.toMatchObject({ name: 'AbortError' });
    await cancelled.promise;
});

test('jQuery accepts text responses when dataType is omitted', async () => {
    const { xhr } = installAjax(async () => textResponse('OK'), {});
    expect(await completed(xhr)).toBe('OK');
});

test('jQuery forwards contentType option into routed request headers', async () => {
    let seen;
    const { xhr } = installAjax(async (url, input, init) => {
        seen = {
            url: url.pathname,
            contentType: new Headers(init.headers).get('content-type'),
            textBody: await readRequestBody(input, init, 'text'),
        };
        return jsonResponse({ ok: true });
    }, {
        url: '/api/plugins/anima-rag/proxy/forward',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ targetUrl: 'https://example.com/v1/models' }),
    });

    expect(await completed(xhr)).toEqual({ ok: true });
    expect(seen).toEqual({
        url: '/api/plugins/anima-rag/proxy/forward',
        contentType: 'application/json',
        textBody: '{"targetUrl":"https://example.com/v1/models"}',
    });
});

test('jQuery preserves explicit Content-Type header and omits header when contentType is false', async () => {
    const seen = [];
    const iframe = document.createElement('iframe');
    document.body.append(iframe);
    const frame = iframe.contentWindow;
    frame.eval(jquerySource);
    createInterceptors({
        originalFetch: frame.fetch.bind(frame),
        canHandleRequest: () => true,
        toUrl: (input, base) => new URL(String(input), base),
        routeRequest: async (_url, _input, init) => {
            seen.push({
                contentType: new Headers(init.headers).get('content-type'),
                hasContentType: new Headers(init.headers).has('content-type'),
            });
            return jsonResponse({ ok: true });
        },
    }).patchJQueryAjax(frame);

    await completed(frame.jQuery.ajax({
        url: '/api/test',
        type: 'POST',
        headers: { 'Content-Type': 'text/plain', 'X-Ignored': undefined },
        contentType: 'application/json',
        data: 'hello',
    }));

    const formData = new frame.FormData();
    formData.append('name', 'alice');
    await completed(frame.jQuery.ajax({
        url: '/api/test',
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
    }));

    expect(seen).toEqual([
        { contentType: 'text/plain', hasContentType: true },
        { contentType: null, hasContentType: false },
    ]);
});

test('jQuery serializes GET data as query params and POST objects as form-urlencoded', async () => {
    let getSeen;
    let postSeen;
    const { frame, xhr: getXhr } = installAjax(async (url, _input, init) => {
        getSeen = {
            search: url.search,
            body: init.body,
            hasContentType: new Headers(init.headers).has('content-type'),
        };
        return jsonResponse({ ok: true });
    }, {
        url: '/api/plugins/test?existing=1',
        type: 'GET',
        data: { foo: 'bar baz' },
    });
    await completed(getXhr);

    createInterceptors({
        originalFetch: frame.fetch.bind(frame),
        canHandleRequest: () => true,
        toUrl: (input, base) => new URL(String(input), base),
        routeRequest: async (_url, input, init) => {
            postSeen = {
                contentType: new Headers(init.headers).get('content-type'),
                textBody: await readRequestBody(input, init, 'text'),
                jsonBody: await readRequestBody(input, init, 'json'),
            };
            return jsonResponse({ ok: true });
        },
    }).patchJQueryAjax(frame);
    await completed(frame.jQuery.ajax({
        url: '/api/test',
        type: 'POST',
        data: { foo: 'bar', count: 2 },
    }));

    expect(getSeen).toEqual({
        search: '?existing=1&foo=bar%20baz',
        body: undefined,
        hasContentType: false,
    });
    expect(postSeen).toEqual({
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        textBody: 'foo=bar&count=2',
        jsonBody: { foo: 'bar', count: '2' },
    });
});
