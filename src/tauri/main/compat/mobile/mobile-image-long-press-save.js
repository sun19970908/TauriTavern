import { downloadBlobWithRuntime } from '../../../../scripts/file-export.js';
import { showExportFailureToast, showExportSuccessToast } from '../../../../scripts/download-feedback.js';
import { isAndroidRuntime } from '../../../../scripts/util/mobile-runtime.js';
import { invoke } from '../../../../tauri-bridge.js';
import { normalizeBinaryPayload } from '../../binary-utils.js';
import { describeElement, describePressMiss, resolvePressedImage } from './mobile-image-press-target.js';

// Android WebView does not implement the desktop image context menu, so images have no user-facing
// "save" affordance there. This compat layer adds the single action with no other entry point:
// long-press an image to save it. Desktop and iOS already provide their own native image menus,
// which is why the gesture is Android-only. Which element counts as an image, and how a press that
// landed on a covering surface still finds it, is `./mobile-image-press-target.js`.
//
// Long-press detection is deliberately a second implementation next to `scripts/utils.js`'s
// `addLongPressEvent`: that helper is document-wide and imports the main script module, while this
// one installs per document (same-origin frames are patched separately). Converging both into a
// dependency-free `util/long-press.js` is the intended follow-up; it is out of scope here because it
// would change an upstream file without changing behavior.
const REMOTE_IMAGE_COMMAND = 'download_remote_image';
// Judgement calls, not measurements: long enough that a hold reads as intentional, short enough to
// still feel immediate. They should be tuned against real device feedback.
const LONG_PRESS_DELAY_MS = 500;
const MOVE_TOLERANCE_PX = 10;
const FALLBACK_FILE_NAME = 'image.png';
const SAFE_FILE_NAME_PATTERN = /^[^\\/:*?"<>|\s]{1,80}\.[A-Za-z0-9]{2,5}$/;
const LOG_PREFIX = '[mobile-image-long-press]';

// Per-document registration records. Keyed by the document object itself: a frame document that
// gets rewritten in place keeps its identity (and this entry), so a re-install can re-attach the
// exact closures that were wiped — see the document.open()/write() hooks at the end of install.
const attachedDocuments = new WeakMap();

function attachRegistrations(targetDocument, registrations) {
    for (const [type, handler, options] of registrations) {
        targetDocument.addEventListener(type, handler, options);
    }
}

// Only MIME subtypes that are not already usable as a file extension need an alias.
const MIME_SUBTYPE_ALIASES = Object.freeze({
    jpeg: 'jpg',
    'svg+xml': 'svg',
    'x-icon': 'ico',
});

// The press and the image it resolves to can live in different documents: a covering surface (frame
// border, overlay, forwarded tap) receives the touch while the image sits inside the frame. The
// suppression has to be shared by every installed document so each of those taps is swallowed.
/** @type {{ image: Element, pressed: Element } | null} */
let pendingSuppression = null;

/**
 * @param {unknown} error Failure to describe.
 * @returns {string} Message suitable for a combined error, never empty.
 */
function errorText(error) {
    return String(error?.message || error);
}

/**
 * @param {Blob} blob Image payload.
 * @returns {string} File extension without the leading dot.
 */
function resolveFileExtension(blob) {
    const subtype = String(blob?.type || '').split(';', 1)[0].trim().toLowerCase().split('/')[1] || '';
    const extension = MIME_SUBTYPE_ALIASES[subtype] || subtype;
    return /^[a-z0-9]{1,5}$/.test(extension) ? extension : 'png';
}

/**
 * @param {string} source Absolute image source URL.
 * @param {Blob} blob Image payload.
 * @returns {string} File name; `file-export` performs the final sanitization.
 */
function resolveFileName(source, blob) {
    try {
        const basename = decodeURIComponent(new URL(source).pathname.split('/').pop() || '').trim();
        if (SAFE_FILE_NAME_PATTERN.test(basename)) {
            return basename;
        }
    } catch {
        // `blob:` and inline payloads have no usable path; fall through to a generated name.
    }

    return `image-${Date.now()}.${resolveFileExtension(blob)}`;
}

/**
 * Reads the image bytes through the page, so cookies and routed resources keep working.
 * @param {string} source Absolute image source URL.
 * @returns {Promise<Blob>} Image payload.
 */
async function readImageBlob(source) {
    let response;
    try {
        response = await fetch(source);
    } catch (error) {
        // Cross-origin images without CORS headers cannot be read back by the page.
        throw new Error(`Image source is not readable: ${errorText(error)}`);
    }

    if (!response.ok) {
        throw new Error(`Failed to read image: HTTP ${response.status}`);
    }

    return response.blob();
}

/**
 * @param {string} source Absolute image source URL.
 * @returns {boolean} True for cross-origin `http(s)` sources, the only ones the host can fetch.
 */
function isCrossOriginHttpSource(source) {
    try {
        const url = new URL(source);
        return (url.protocol === 'http:' || url.protocol === 'https:')
            && url.origin !== window.location.origin;
    } catch {
        return false;
    }
}

/**
 * Reads image bytes through the host. The browser renders cross-origin images but keeps their
 * payload opaque without CORS; native HTTP has no such policy, so the host fetches instead.
 * @param {string} source Absolute image source URL.
 * @returns {Promise<{ blob: Blob, fileName: string }>} Payload plus the name the host resolved.
 */
async function readImageBlobThroughHost(source) {
    const result = await invoke(REMOTE_IMAGE_COMMAND, { url: source });
    const bytes = normalizeBinaryPayload(result?.data);
    if (!bytes.length) {
        throw new Error('Host returned an empty image payload');
    }

    const mimeType = String(result?.mimeType || '').trim() || 'application/octet-stream';
    const blob = new Blob([bytes], { type: mimeType });
    // The host resolves the name from the URL path and keeps percent-encoding intact; a saved
    // file named "%E8%8A%82%E6%97%A5-..." instead of "节日-..." is user-hostile, so decode here
    // where a malformed sequence can simply fall back to the encoded form.
    const hostName = String(result?.fileName || '').trim();
    let fileName = hostName;
    try {
        fileName = decodeURIComponent(hostName);
    } catch {
        // Malformed percent-encoding keeps the host's original name.
    }
    fileName = fileName || resolveFileName(source, blob);

    return { blob, fileName };
}

/**
 * Resolves the payload to save: the page first, the host as the cross-origin fallback.
 *
 * The fallback is limited to cross-origin `http(s)` sources on purpose. The host has no route for
 * the app's own virtual URLs, so proxying a same-origin failure would replace a real 404 with a
 * misleading network error.
 *
 * @param {string} source Absolute image source URL.
 * @returns {Promise<{ blob: Blob, fileName: string }>} Image payload and download name.
 */
async function readImagePayload(source) {
    try {
        const blob = await readImageBlob(source);
        return { blob, fileName: resolveFileName(source, blob) };
    } catch (pageError) {
        if (!isCrossOriginHttpSource(source)) {
            throw pageError;
        }

        try {
            return await readImageBlobThroughHost(source);
        } catch (hostError) {
            const details = `page: ${errorText(pageError)}; host: ${errorText(hostError)}`;
            throw new Error(`Image source is not readable (${details})`);
        }
    }
}

/**
 * Saves a single image through the shared export pipeline.
 * @param {string} source Absolute image source URL.
 * @returns {Promise<void>} Resolves once the export feedback has been shown.
 */
async function saveImageSource(source) {
    const { blob, fileName } = await readImagePayload(source);
    if (!blob.size) {
        throw new Error('Image payload is empty');
    }

    const result = await downloadBlobWithRuntime(blob, fileName, {
        fallbackName: FALLBACK_FILE_NAME,
    });
    showExportSuccessToast(result);
}

/**
 * Registers the long-press-to-save gesture for every image of a document, whether it is an `<img>`
 * or an element painting one as a CSS background, and whether it is painted by the document that
 * receives the press or by a same-origin frame underneath it.
 *
 * Installed for the main window and for every same-origin frame, because touch events do not
 * propagate out of frames. The gesture reuses the frontend image handlers' contract: the tap
 * that ends a long press is swallowed so it cannot trigger the caller's own tap action.
 *
 * @param {Window} [targetWindow] Window whose document should be watched.
 * @returns {void}
 */
export function installMobileImageLongPressSave(targetWindow = window) {
    if (!isAndroidRuntime()) {
        return;
    }

    let targetDocument;
    try {
        targetDocument = targetWindow?.document;
    } catch {
        // Cross-origin and sandboxed frames cannot expose their document.
        return;
    }

    // The per-document registration record doubles as the install guard: script panels rewrite
    // their frame documents in place (document.open()/write()), which wipes listeners while the
    // document object — and any expando marker on it — survives, so a boolean marker would
    // permanently block the re-install that has to follow every rewrite.
    const existing = attachedDocuments.get(targetDocument);
    if (existing) {
        attachRegistrations(targetDocument, existing);
        return;
    }
    console.info(LOG_PREFIX, 'installed(v3) on', targetDocument === window.document ? 'the main document' : 'a frame', String(targetDocument.location?.href || '').slice(-60));

    /** @type {ReturnType<typeof setTimeout> | null} */
    let pressTimer = null;
    /** @type {{ x: number, y: number, target: Element } | null} */
    let press = null;

    const cancelPress = () => {
        clearTimeout(pressTimer);
        pressTimer = null;
        press = null;
    };

    // Shared by both triggers: the 500ms timer for presses the system leaves alone, and the
    // touchcancel takeover below for presses it claims for text selection.
    const saveResolvedImageForPress = (current) => {
        const image = resolvePressedImage(targetDocument, current);
        if (!image) {
            return null;
        }

        pendingSuppression = { image: image.imageElement, pressed: current.target };
        console.info(LOG_PREFIX, 'saving', describeElement(image.imageElement), image.source);

        // The same press may have started the WebView's native text selection (the finger can sit
        // on text painted next to or behind the image). The save supersedes it, so collapse it.
        try {
            targetDocument.getSelection?.()?.removeAllRanges();
        } catch {
            // A selection API from another realm refusing to cooperate must not fail the save.
        }

        void saveImageSource(image.source).catch((error) => {
            console.error('Failed to save image from long press:', error);
            showExportFailureToast(error);
        });
        return image;
    };

    // The image is resolved when the gesture has been held, not when it starts: only then is the
    // press deliberate, and only then is the frame hit-test worth its layout read.
    const handleLongPress = () => {
        const current = press;
        pressTimer = null;
        press = null;
        if (!current) {
            return;
        }

        if (!saveResolvedImageForPress(current)) {
            console.info(LOG_PREFIX, 'no image under', describePressMiss(targetDocument, current));
        }
    };

    const handleTouchStart = (event) => {
        // Diagnostic probe: one line per document, so a device run shows which document the
        // touches actually land in and whether that document has this module at all.
        if (!targetDocument.__TT_LONGPRESS_TOUCH_PROBE__) {
            targetDocument.__TT_LONGPRESS_TOUCH_PROBE__ = true;
            console.info(LOG_PREFIX, 'touch seen in', String(targetDocument.location?.href || '').slice(-60));
        }

        // Pinch and multi-finger gestures are never long presses.
        const target = event.touches?.length === 1 ? event.target : null;
        // A new touch begins a new interaction: the previous gesture's suppression must not leak
        // into it, however many trailing taps it still has queued.
        pendingSuppression = null;
        cancelPress();
        if (!target || target.nodeType !== 1) {
            return;
        }

        press = { x: event.touches[0].clientX, y: event.touches[0].clientY, target };
        pressTimer = setTimeout(handleLongPress, LONG_PRESS_DELAY_MS);
    };

    const handleTouchMove = (event) => {
        if (!press) {
            return;
        }

        const touch = event.touches?.[0];
        if (!touch) {
            return;
        }

        if (Math.abs(touch.clientX - press.x) > MOVE_TOLERANCE_PX
            || Math.abs(touch.clientY - press.y) > MOVE_TOLERANCE_PX) {
            cancelPress();
        }
    };

    // The tap that ends a long press must not reach image click handlers: the chat media viewer
    // would open on top of the save the user just asked for. One gesture can produce more than one
    // tap (an outer one plus a tap forwarded into the frame), so the record survives until the next
    // touch begins, and it lives at module scope because the taps can arrive in different documents.
    const handleClick = (event) => {
        const suppression = pendingSuppression;
        if (!suppression) {
            return;
        }

        const reached = (element) => Boolean(element?.isConnected && element.contains(event.target));
        if (reached(suppression.image) || reached(suppression.pressed)) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    };

    // Android's native long-press pipeline (text selection) fires at ~470ms, ahead of the 500ms
    // timer, and reports ACTION_CANCEL: a press on any text-bearing surface — a status bar widget
    // painting its image as a background behind text — is taken over before the timer can fire.
    // The takeover is itself the long-press signal: resolve the press point, and when it is an
    // image, save it and collapse the selection the system just started. A miss stays with the
    // system, because the user may genuinely be selecting text.
    const handleTouchCancel = () => {
        const pending = pressTimer !== null;
        const current = press;
        cancelPress();
        if (!pending || !current) {
            return;
        }
        if (!saveResolvedImageForPress(current)) {
            console.info(LOG_PREFIX, 'press taken over by system selection; no image under', describePressMiss(targetDocument, current));
        }
    };

    const registrations = [
        ['touchstart', handleTouchStart, { passive: true }],
        ['touchmove', handleTouchMove, { passive: true }],
        ['touchend', cancelPress],
        ['touchcancel', handleTouchCancel],
        ['click', handleClick, true],
    ];
    attachRegistrations(targetDocument, registrations);
    attachedDocuments.set(targetDocument, registrations);

    // Panel scripts build their UI by rewriting the frame document in place (document.open()/
    // write()), which drops every listener while keeping the document object — and its expando
    // markers — alive. Hook both entry points so the very same closures are re-attached the
    // moment a rewrite lands; addEventListener dedupes whatever is still attached.
    try {
        const nativeOpen = targetDocument.open.bind(targetDocument);
        targetDocument.open = function documentOpenWithReattach(...args) {
            const result = nativeOpen(...args);
            queueMicrotask(() => attachRegistrations(targetDocument, registrations));
            return result;
        };
        const nativeWrite = targetDocument.write.bind(targetDocument);
        targetDocument.write = function documentWriteWithReattach(...args) {
            const result = nativeWrite(...args);
            queueMicrotask(() => attachRegistrations(targetDocument, registrations));
            return result;
        };
    } catch {
        // A document that refuses to be hooked still keeps the normal install above.
    }
}
