import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP_ORIGIN = 'http://localhost:8000';
const LONG_PRESS_DELAY_MS = 500;

const state = {
    hostInvokes: [],
    nativeSaves: [],
    consoleErrors: [],
    consoleDebugs: [],
    contentTypeBySource: new Map(),
    failingSources: new Set(),
};

function resetState() {
    state.hostInvokes.length = 0;
    state.nativeSaves.length = 0;
    state.consoleErrors.length = 0;
    state.consoleDebugs.length = 0;
    state.contentTypeBySource.clear();
    state.failingSources.clear();
}

function setUserAgent(userAgent) {
    Object.defineProperty(globalThis, 'navigator', {
        value: { userAgent, language: 'en' },
        configurable: true,
    });
}

function flushAsyncWork() {
    // The save path is a chain of already-resolved promises; macrotask boundaries flush all of them
    // without depending on timing.
    return new Promise((resolve) => setImmediate(resolve))
        .then(() => new Promise((resolve) => setImmediate(resolve)))
        .then(() => new Promise((resolve) => setImmediate(resolve)));
}

globalThis.localStorage = { getItem: () => null };
globalThis.MutationObserver = class {
    observe() {}
    disconnect() {}
};

globalThis.console.error = (...args) => {
    state.consoleErrors.push(args.map(String).join(' '));
};

globalThis.console.debug = (...args) => {
    state.consoleDebugs.push(args.map(String).join(' '));
};

// The module reports gesture diagnostics at info level: the host dev-log pipeline drops debug
// entries before they reach logcat, so a device run would never see them.
globalThis.console.info = (...args) => {
    state.consoleDebugs.push(args.map(String).join(' '));
};

globalThis.fetch = async (url) => {
    const source = String(url);
    if (state.failingSources.has(source)) {
        throw new TypeError('Failed to fetch');
    }

    const type = state.contentTypeBySource.get(source) || 'image/png';
    return { ok: true, status: 200, blob: async () => new Blob([new Uint8Array([1, 2, 3])], { type }) };
};

globalThis.window = {
    location: { origin: APP_ORIGIN, href: `${APP_ORIGIN}/` },
    TauriTavernAndroidPublicDownloadBridge: {
        supportsDirectPublicDownloads: () => true,
        saveFileToDownloads: (sourcePath, displayName, mimeType) => {
            state.nativeSaves.push({ sourcePath, displayName, mimeType });
            return JSON.stringify({
                saved_path: `/storage/emulated/0/Download/${displayName}`,
                uri: 'content://downloads/1',
                display_name: displayName,
            });
        },
    },
    __TAURI__: {
        path: {
            join: async (...parts) => parts.join('/'),
            appCacheDir: async () => '/cache',
        },
        core: {
            invoke: async (command, args) => {
                if (command === 'download_remote_image') {
                    state.hostInvokes.push(args);
                    return { data: [4, 5, 6, 7], mimeType: 'image/webp', fileName: 'host-name.webp' };
                }

                return undefined;
            },
        },
    },
};

const modulePath = path.join(
    REPO_ROOT,
    'src/tauri/main/compat/mobile/mobile-image-long-press-save.js',
);
const { installMobileImageLongPressSave } = await import(pathToFileURL(modulePath).href);

function createDocument({ hitStack = [] } = {}) {
    const listeners = new Map();
    return {
        addEventListener(type, handler) {
            // Mirror the platform contract: identical (type, listener) pairs are deduped.
            const existing = listeners.get(type) || [];
            if (existing.includes(handler)) {
                return;
            }
            listeners.set(type, [...existing, handler]);
        },
        dispatch(type, event) {
            for (const handler of listeners.get(type) || []) {
                handler(event);
            }
        },
        listenerCount(type) {
            return (listeners.get(type) || []).length;
        },
        // Simulates document.open(): the document object survives while every listener is dropped.
        wipe() {
            listeners.clear();
        },
        elementsFromPoint: () => hitStack,
    };
}

// A same-origin frame: its own document, viewport size and rendered box, so the press point has to
// be mapped before the inner element can be looked up.
function createFrame({
    left = 0,
    top = 0,
    width = 100,
    height = 100,
    viewportWidth = 100,
    viewportHeight = 100,
    innerTarget = null,
} = {}) {
    const queries = [];
    const document = createDocument();
    document.documentElement = { clientWidth: viewportWidth, clientHeight: viewportHeight };
    document.elementFromPoint = (x, y) => {
        queries.push({ x, y });
        return innerTarget;
    };

    const frame = {
        nodeName: 'IFRAME',
        nodeType: 1,
        contentDocument: document,
        getBoundingClientRect: () => ({
            left,
            top,
            width,
            height,
            right: left + width,
            bottom: top + height,
        }),
    };

    return { frame, document, queries };
}

function createImage(source) {
    const element = {
        nodeType: 1,
        tagName: 'IMG',
        currentSrc: source,
        src: '',
        isConnected: true,
        closest: (selector) => (selector === 'img' ? element : null),
        contains: (node) => node === element,
    };
    return element;
}

// Elements that paint their image through CSS: the computed style lookup goes through the
// element's own window, which is what a same-origin frame element requires.
function createBackgroundTree() {
    const backgrounds = new Map();
    const ownerDocument = {
        body: null,
        documentElement: null,
        defaultView: {
            getComputedStyle: (element) => ({ backgroundImage: backgrounds.get(element) || 'none' }),
        },
    };

    const createElement = (backgroundImage = 'none') => {
        const element = {
            nodeType: 1,
            parentElement: null,
            ownerDocument,
            isConnected: true,
            closest: () => null,
            contains: (node) => node === element,
        };
        backgrounds.set(element, backgroundImage);
        return element;
    };

    return { ownerDocument, createElement };
}

function touchEvent(target, { x = 10, y = 10, count = 1 } = {}) {
    return {
        target,
        touches: Array.from({ length: count }, () => ({ clientX: x, clientY: y })),
    };
}

async function startLongPress(targetDocument, target, timers, options = {}) {
    targetDocument.dispatch('touchstart', touchEvent(target, options));
    timers.tick(LONG_PRESS_DELAY_MS);
    await flushAsyncWork();
}

test('a long press saves an image the page can read, naming it after the payload type', async (t) => {
    resetState();
    setUserAgent('Mozilla/5.0 (Linux; Android 15)');
    t.mock.timers.enable({ apis: ['setTimeout'] });

    const document = createDocument();
    const source = `${APP_ORIGIN}/user/images/abc`;
    state.contentTypeBySource.set(source, 'image/jpeg');
    installMobileImageLongPressSave({ document });

    await startLongPress(document, createImage(source), t.mock.timers);

    assert.deepEqual(state.hostInvokes, [], 'a readable image must not reach the host');
    assert.equal(state.nativeSaves.length, 1);
    assert.match(state.nativeSaves[0].displayName, /^image-\d+\.jpg$/);
    assert.equal(state.nativeSaves[0].mimeType, 'image/jpeg');
});

test('a cross-origin image the page cannot read falls back to the host and keeps its name and MIME', async (t) => {
    resetState();
    setUserAgent('Mozilla/5.0 (Linux; Android 15)');
    t.mock.timers.enable({ apis: ['setTimeout'] });

    const document = createDocument();
    const source = 'https://cdn.example.com/pic';
    state.failingSources.add(source);
    installMobileImageLongPressSave({ document });

    await startLongPress(document, createImage(source), t.mock.timers);

    assert.deepEqual(state.hostInvokes, [{ url: source }]);
    assert.equal(state.nativeSaves.length, 1);
    assert.equal(state.nativeSaves[0].displayName, 'host-name.webp');
    assert.equal(state.nativeSaves[0].mimeType, 'image/webp');
});

test('a same-origin failure is not proxied through the host and is reported', async (t) => {
    resetState();
    setUserAgent('Mozilla/5.0 (Linux; Android 15)');
    t.mock.timers.enable({ apis: ['setTimeout'] });

    const document = createDocument();
    const source = `${APP_ORIGIN}/user/images/missing.png`;
    state.failingSources.add(source);
    installMobileImageLongPressSave({ document });

    await startLongPress(document, createImage(source), t.mock.timers);

    assert.deepEqual(state.hostInvokes, [], 'the host has no route for the app\'s own URLs');
    assert.deepEqual(state.nativeSaves, []);
    assert.ok(
        state.consoleErrors.some((message) => message.includes('Image source is not readable')),
        'the failure must be reported',
    );
});

test('every trailing tap of the gesture is swallowed, and the next touch taps normally again', async (t) => {
    resetState();
    setUserAgent('Mozilla/5.0 (Linux; Android 15)');
    t.mock.timers.enable({ apis: ['setTimeout'] });

    const document = createDocument();
    const target = createImage(`${APP_ORIGIN}/user/images/abc`);
    installMobileImageLongPressSave({ document });

    await startLongPress(document, target, t.mock.timers);

    let prevented = 0;
    const clickEvent = {
        target,
        preventDefault() { prevented += 1; },
        stopImmediatePropagation() {},
    };

    document.dispatch('click', clickEvent);
    assert.equal(prevented, 1, 'the trailing tap must not reach the image click handlers');
    document.dispatch('click', clickEvent);
    assert.equal(prevented, 2, 'a gesture can leave more than one tap behind');

    document.dispatch('touchstart', touchEvent(target));
    document.dispatch('touchend', {});
    document.dispatch('click', clickEvent);
    assert.equal(prevented, 2, 'the next touch is a new interaction and must behave normally');
});

test('dragging, lifting and multi-touch all cancel the gesture', async (t) => {
    resetState();
    setUserAgent('Mozilla/5.0 (Linux; Android 15)');
    t.mock.timers.enable({ apis: ['setTimeout'] });

    const document = createDocument();
    installMobileImageLongPressSave({ document });

    const target = createImage(`${APP_ORIGIN}/user/images/abc`);

    document.dispatch('touchstart', touchEvent(target));
    document.dispatch('touchmove', touchEvent(target, { x: 80 }));
    t.mock.timers.tick(LONG_PRESS_DELAY_MS);
    await flushAsyncWork();

    document.dispatch('touchstart', touchEvent(target));
    document.dispatch('touchend', {});
    t.mock.timers.tick(LONG_PRESS_DELAY_MS);
    await flushAsyncWork();

    document.dispatch('touchstart', touchEvent(target, { count: 2 }));
    t.mock.timers.tick(LONG_PRESS_DELAY_MS);
    await flushAsyncWork();

    assert.deepEqual(state.nativeSaves, []);
    assert.deepEqual(state.hostInvokes, []);
});

test('runtimes that already own an image menu are left untouched, and install is idempotent', () => {
    resetState();

    // Only Android installs the gesture: every other runtime already owns an image menu (desktop
    // WebView context menu, iOS system callout). iOS is asserted because the module is invoked on
    // it too: the mobile compat installer runs on every mobile runtime.
    for (const userAgent of [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)',
        'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)',
    ]) {
        setUserAgent(userAgent);
        const document = createDocument();
        installMobileImageLongPressSave({ document });
        assert.equal(document.listenerCount('touchstart'), 0, userAgent);
    }

    setUserAgent('Mozilla/5.0 (Linux; Android 15)');
    const androidDocument = createDocument();
    installMobileImageLongPressSave({ document: androidDocument });
    installMobileImageLongPressSave({ document: androidDocument });
    assert.equal(androidDocument.listenerCount('touchstart'), 1);
    assert.equal(androidDocument.listenerCount('click'), 1);
});

test('an empty host payload fails loudly instead of saving nothing', async (t) => {
    resetState();
    setUserAgent('Mozilla/5.0 (Linux; Android 15)');
    t.mock.timers.enable({ apis: ['setTimeout'] });

    const document = createDocument();
    const source = 'https://cdn.example.com/empty';
    state.failingSources.add(source);
    const previousInvoke = globalThis.window.__TAURI__.core.invoke;
    globalThis.window.__TAURI__.core.invoke = async (command) => {
        if (command === 'download_remote_image') {
            return { data: [], mimeType: 'image/png', fileName: 'x.png' };
        }

        return undefined;
    };

    try {
        installMobileImageLongPressSave({ document });
        await startLongPress(document, createImage(source), t.mock.timers);
    } finally {
        globalThis.window.__TAURI__.core.invoke = previousInvoke;
    }

    assert.deepEqual(state.nativeSaves, []);
    assert.ok(
        state.consoleErrors.some((message) => message.includes('Host returned an empty image payload')),
        'an empty payload must not produce a file',
    );
});

test('an image painted as a CSS background is saved like an <img>', async (t) => {
    resetState();
    setUserAgent('Mozilla/5.0 (Linux; Android 15)');
    t.mock.timers.enable({ apis: ['setTimeout'] });

    const document = createDocument();
    const tree = createBackgroundTree();
    const painted = tree.createElement(`url(${APP_ORIGIN}/user/images/portrait.png)`);
    const pressed = tree.createElement();
    pressed.parentElement = painted;
    tree.ownerDocument.body = tree.createElement();
    installMobileImageLongPressSave({ document });

    await startLongPress(document, pressed, t.mock.timers);

    assert.deepEqual(state.hostInvokes, []);
    assert.equal(state.nativeSaves.length, 1);
    assert.equal(state.nativeSaves[0].displayName, 'portrait.png');
});

test('the topmost URL layer of a multi-layer background is the image that gets saved', async (t) => {
    resetState();
    setUserAgent('Mozilla/5.0 (Linux; Android 15)');
    t.mock.timers.enable({ apis: ['setTimeout'] });

    const document = createDocument();
    const tree = createBackgroundTree();
    const painted = tree.createElement(
        `linear-gradient(rgb(4, 7, 18), rgb(0, 0, 0)), url("${APP_ORIGIN}/user/images/map.webp")`,
    );
    tree.ownerDocument.body = tree.createElement();
    installMobileImageLongPressSave({ document });

    await startLongPress(document, painted, t.mock.timers);

    assert.equal(state.nativeSaves.length, 1);
    assert.equal(state.nativeSaves[0].displayName, 'map.webp');
});

test('page-level backgrounds and distant wrappers are not treated as widget images', async (t) => {
    resetState();
    setUserAgent('Mozilla/5.0 (Linux; Android 15)');
    t.mock.timers.enable({ apis: ['setTimeout'] });

    const document = createDocument();
    const tree = createBackgroundTree();
    tree.ownerDocument.body = tree.createElement(`url("${APP_ORIGIN}/theme/wallpaper.png")`);
    const pressedOnAppChrome = tree.createElement();
    pressedOnAppChrome.parentElement = tree.ownerDocument.body;

    // The image sits above the walk limit, so the press resolves to nothing rather than to a
    // layout container.
    const deepImage = tree.createElement(`url("${APP_ORIGIN}/user/images/far.png")`);
    let deepest = deepImage;
    for (let depth = 0; depth < 7; depth += 1) {
        const wrapper = tree.createElement();
        wrapper.parentElement = deepest;
        deepest = wrapper;
    }

    installMobileImageLongPressSave({ document });
    await startLongPress(document, pressedOnAppChrome, t.mock.timers);
    await startLongPress(document, deepest, t.mock.timers);

    assert.deepEqual(state.nativeSaves, []);
    assert.deepEqual(state.hostInvokes, []);
    assert.deepEqual(state.consoleErrors, []);
});

test('a press that lands on a covering surface resolves the image inside the frame underneath', async (t) => {
    resetState();
    setUserAgent('Mozilla/5.0 (Linux; Android 15)');
    t.mock.timers.enable({ apis: ['setTimeout'] });

    const tree = createBackgroundTree();
    const overlay = tree.createElement();
    const inner = createImage(`${APP_ORIGIN}/user/images/portrait.png`);
    const { frame } = createFrame({ innerTarget: inner });
    const document = createDocument({ hitStack: [overlay, frame] });
    installMobileImageLongPressSave({ document });

    await startLongPress(document, overlay, t.mock.timers);

    assert.deepEqual(state.hostInvokes, []);
    assert.equal(state.nativeSaves.length, 1);
    assert.equal(state.nativeSaves[0].displayName, 'portrait.png');
});

test('an image painted as a CSS background inside the frame is resolved too', async (t) => {
    resetState();
    setUserAgent('Mozilla/5.0 (Linux; Android 15)');
    t.mock.timers.enable({ apis: ['setTimeout'] });

    const tree = createBackgroundTree();
    const overlay = tree.createElement();
    const framedTree = createBackgroundTree();
    const painted = framedTree.createElement(`url("${APP_ORIGIN}/user/images/framed.png")`);
    const { frame } = createFrame({ innerTarget: painted });
    const document = createDocument({ hitStack: [overlay, frame] });
    installMobileImageLongPressSave({ document });

    await startLongPress(document, overlay, t.mock.timers);

    assert.equal(state.nativeSaves.length, 1);
    assert.equal(state.nativeSaves[0].displayName, 'framed.png');
});

test('the press point is mapped through the frame rendered box, so a scaled frame still resolves', async (t) => {
    resetState();
    setUserAgent('Mozilla/5.0 (Linux; Android 15)');
    t.mock.timers.enable({ apis: ['setTimeout'] });

    const tree = createBackgroundTree();
    const overlay = tree.createElement();
    const inner = createImage(`${APP_ORIGIN}/user/images/scaled.png`);
    // Rendered at 200x200 while the frame's own viewport is 400x400: the offset doubles.
    const { frame, queries } = createFrame({
        left: 50,
        top: 20,
        width: 200,
        height: 200,
        viewportWidth: 400,
        viewportHeight: 400,
        innerTarget: inner,
    });
    const document = createDocument({ hitStack: [overlay, frame] });
    installMobileImageLongPressSave({ document });

    await startLongPress(document, overlay, t.mock.timers, { x: 60, y: 40 });

    assert.deepEqual(queries, [{ x: 20, y: 40 }]);
    assert.equal(state.nativeSaves[0].displayName, 'scaled.png');
});

test('a press with no image anywhere is reported with the layers under it', async (t) => {
    resetState();
    setUserAgent('Mozilla/5.0 (Linux; Android 15)');
    t.mock.timers.enable({ apis: ['setTimeout'] });

    const tree = createBackgroundTree();
    const pressed = tree.createElement();
    // A frame that cannot be read (cross-origin) must not break the report.
    const unreadableFrame = { nodeName: 'IFRAME', nodeType: 1, contentDocument: null };
    const document = createDocument({ hitStack: [pressed, unreadableFrame] });
    installMobileImageLongPressSave({ document });

    await startLongPress(document, pressed, t.mock.timers);

    assert.deepEqual(state.nativeSaves, []);
    assert.deepEqual(state.consoleErrors, []);
    const report = state.consoleDebugs.find((message) => message.includes('no image under'));
    assert.ok(report, 'a miss must be reported so the gesture can be diagnosed on a device');
    assert.ok(report.includes('iframe'), 'the layers under the press must be named');
});

test('a press the system takes over for text selection still saves the image under the finger', async (t) => {
    resetState();
    setUserAgent('Mozilla/5.0 (Linux; Android 15)');
    t.mock.timers.enable({ apis: ['setTimeout'] });

    // A status-bar-style surface: text-bearing, painting its image as a background. The system
    // claims the gesture for text selection at ~470ms and cancels the touch stream, so the 500ms
    // timer never fires; the takeover itself must complete the save.
    const tree = createBackgroundTree();
    const pressed = tree.createElement('url("http://localhost:8000/user/images/portrait.png")');
    const document = createDocument();
    installMobileImageLongPressSave({ document });

    document.dispatch('touchstart', touchEvent(pressed));
    document.dispatch('touchcancel', touchEvent(pressed));
    await flushAsyncWork();

    assert.equal(state.nativeSaves.length, 1);
    assert.equal(state.nativeSaves[0].displayName, 'portrait.png');
    assert.deepEqual(state.consoleErrors, []);

    document.dispatch('touchcancel', touchEvent(pressed));
    await flushAsyncWork();
    assert.equal(state.nativeSaves.length, 1, 'a cancel without a pending press must not save again');
});

test('a takeover over a surface with no image leaves the selection to the system', async (t) => {
    resetState();
    setUserAgent('Mozilla/5.0 (Linux; Android 15)');
    t.mock.timers.enable({ apis: ['setTimeout'] });

    const tree = createBackgroundTree();
    const pressed = tree.createElement();
    const document = createDocument({ hitStack: [pressed] });
    installMobileImageLongPressSave({ document });

    document.dispatch('touchstart', touchEvent(pressed));
    document.dispatch('touchcancel', touchEvent(pressed));
    await flushAsyncWork();

    assert.deepEqual(state.nativeSaves, []);
    const report = state.consoleDebugs.find((message) => message.includes('press taken over'));
    assert.ok(report, 'a takeover miss must be reported so the gesture can be diagnosed on a device');
});

test('a press on a transparent overlay resolves the image carried by a sibling layer', async (t) => {
    resetState();
    setUserAgent('Mozilla/5.0 (Linux; Android 15)');
    t.mock.timers.enable({ apis: ['setTimeout'] });

    // Status-bar panels paint their pictures on a layer UNDER a state overlay: the pressed
    // element and its ancestors carry no image, and only the hit stack names the carrier.
    const tree = createBackgroundTree();
    const overlay = tree.createElement();
    const carrier = tree.createElement('url("https://i.postimg.cc/W1Nz532Z/image.png")');
    const document = createDocument({ hitStack: [overlay, carrier] });
    installMobileImageLongPressSave({ document });

    await startLongPress(document, overlay, t.mock.timers);

    assert.equal(state.nativeSaves.length, 1);
    assert.equal(state.nativeSaves[0].displayName, 'image.png');
});

test('a frame document rewritten in place keeps the gesture alive after a re-install', async (t) => {    resetState();
    setUserAgent('Mozilla/5.0 (Linux; Android 15)');
    t.mock.timers.enable({ apis: ['setTimeout'] });

    const document = createDocument();
    const source = `${APP_ORIGIN}/user/images/panel.png`;
    installMobileImageLongPressSave({ document });

    // The panel script rewrites its document in place: document.open() drops every listener
    // while the document object (and the install record) survives.
    document.wipe();

    await startLongPress(document, createImage(source), t.mock.timers);
    assert.deepEqual(state.nativeSaves, [], 'a wiped document must not fire the gesture');

    // The open()/write() hook (or a parent patch round) re-runs the install on the same document.
    installMobileImageLongPressSave({ document });

    await startLongPress(document, createImage(source), t.mock.timers);
    assert.equal(state.nativeSaves.length, 1, 'the re-installed gesture must save exactly once');
    assert.equal(document.listenerCount('touchstart'), 1, 're-attaching must not duplicate listeners');
});

test('a tap forwarded into the frame is swallowed as well as the outer one', async (t) => {
    resetState();
    setUserAgent('Mozilla/5.0 (Linux; Android 15)');
    t.mock.timers.enable({ apis: ['setTimeout'] });

    const tree = createBackgroundTree();
    const overlay = tree.createElement();
    const inner = createImage(`${APP_ORIGIN}/user/images/portrait.png`);
    const { frame, document: frameDocument } = createFrame({ innerTarget: inner });
    const document = createDocument({ hitStack: [overlay, frame] });
    installMobileImageLongPressSave({ document });
    installMobileImageLongPressSave({ document: frameDocument });

    await startLongPress(document, overlay, t.mock.timers);

    const clickOn = (target) => {
        let prevented = 0;
        return {
            event: {
                target,
                preventDefault() { prevented += 1; },
                stopImmediatePropagation() {},
            },
            prevented: () => prevented,
        };
    };

    const forwarded = clickOn(inner);
    frameDocument.dispatch('click', forwarded.event);
    assert.equal(forwarded.prevented(), 1, 'the tap forwarded into the frame must not reach the image');

    const outer = clickOn(overlay);
    document.dispatch('click', outer.event);
    assert.equal(outer.prevented(), 1, 'the tap on the covering surface must not reach it either');
});

test('an <img> that paints nothing yet defers to the container that already shows the image', async (t) => {
    resetState();
    setUserAgent('Mozilla/5.0 (Linux; Android 15)');
    t.mock.timers.enable({ apis: ['setTimeout'] });

    const document = createDocument();
    const tree = createBackgroundTree();
    const painted = tree.createElement(`url("${APP_ORIGIN}/user/images/avatar.png")`);
    tree.ownerDocument.body = tree.createElement();
    const placeholder = createImage('');
    placeholder.ownerDocument = tree.ownerDocument;
    placeholder.parentElement = painted;
    installMobileImageLongPressSave({ document });

    await startLongPress(document, placeholder, t.mock.timers);

    assert.equal(state.nativeSaves.length, 1);
    assert.equal(state.nativeSaves[0].displayName, 'avatar.png');
});
