// Resolution of "which image is under this press", split out of the long-press gesture so both stay
// small. A saveable image is not always an `<img>`: floating status bars and card widgets commonly
// draw avatars, portraits and maps as `background-image` on plain containers, and that is as much a
// visible image to the user as a real `<img>` is.
//
// The press does not always reach the document that paints the image either: a click-through root,
// an overlay or a third-party tap forwarder can hand the touch to the outer document while the
// visible image sits inside a frame. The press point is therefore also resolved through same-origin
// frames before the gesture is reported as a miss.

// Judgement call, not a measurement: deep enough for wrappers such as an avatar badge inside a card,
// shallow enough that a press never walks up to a layout container. Should be tuned against real
// device feedback.
const MAX_BACKGROUND_ANCESTORS = 6;
// A widget frame can itself embed a frame; two levels covers those without unbounded recursion.
const MAX_FRAME_DEPTH = 2;
// Matches the first layer of a computed `background-image` value, which is the one on top. The value
// may still carry gradients next to the URL, and quoted or unquoted URLs both occur.
const BACKGROUND_URL_PATTERN = /url\(\s*(['"]?)([^'")]+)\1\s*\)/i;

/**
 * @typedef {{ x: number, y: number }} ViewportPoint
 * @typedef {{ imageElement: Element, source: string, document: Document | null, point: ViewportPoint }} ImageTarget
 * @typedef {{ x: number, y: number, target: Element }} PressRecord
 */

/**
 * @param {Element} imageElement Element painting the image.
 * @param {string} source Absolute image URL.
 * @param {ViewportPoint} point Press point in the viewport of the document the element lives in.
 * @returns {ImageTarget} Target carrying everything a caller needs to act on the element.
 */
function createImageTarget(imageElement, source, point) {
    return {
        imageElement,
        source,
        // The element can live in a same-origin frame: an event for it has to be created in that
        // frame's own realm and expressed in that frame's own viewport coordinates.
        document: imageElement.ownerDocument || null,
        point: { x: point.x, y: point.y },
    };
}

/**
 * Reads the CSS background image an element paints, if any.
 * @param {Element} element Candidate element.
 * @returns {string} Absolute image URL, or an empty string when the element paints no image.
 */
function readBackgroundImageSource(element) {
    // The value must be read through the element's own window: an element that lives in a
    // same-origin frame has no meaning for the observing realm's `getComputedStyle`.
    const ownerWindow = element.ownerDocument?.defaultView;
    if (typeof ownerWindow?.getComputedStyle !== 'function') {
        return '';
    }

    // The computed value carries absolute URLs, so relative declarations, `var()` references and
    // `image-set()` entries are already resolved here.
    const backgroundImage = String(ownerWindow.getComputedStyle(element).backgroundImage || '');
    const match = BACKGROUND_URL_PATTERN.exec(backgroundImage);
    return match ? match[2].trim() : '';
}

/**
 * Resolves an image painted as a CSS background below the touch target.
 * @param {Element} eventTarget Touch event target.
 * @param {ViewportPoint} point Press point in the target's viewport.
 * @returns {ImageTarget | null} Nearest painted element, if any.
 */
function resolveBackgroundImageTarget(eventTarget, point) {
    const ownerDocument = eventTarget.ownerDocument || null;
    let element = eventTarget;

    for (let depth = 0; element && depth < MAX_BACKGROUND_ANCESTORS; depth += 1) {
        // Page-level containers are not widgets: their background is the app's own wallpaper, and
        // a press anywhere would otherwise resolve to it.
        if (element === ownerDocument?.body || element === ownerDocument?.documentElement) {
            return null;
        }

        const source = readBackgroundImageSource(element);
        if (source) {
            return createImageTarget(element, source, point);
        }

        element = element.parentElement || null;
    }

    return null;
}

/**
 * Resolves the image under a touch target, or null when the touch did not land on an image.
 * @param {EventTarget | null} eventTarget Touch event target.
 * @param {ViewportPoint} point Press point in the target's viewport.
 * @returns {ImageTarget | null} Matched image, if any.
 */
function resolveImageTarget(eventTarget, point) {
    // Same-origin frame events are observed from the parent realm, so the target element may
    // belong to another realm: duck-type instead of relying on `instanceof`.
    if (!eventTarget || eventTarget.nodeType !== 1 || typeof eventTarget.closest !== 'function') {
        return null;
    }

    const imageElement = eventTarget.closest('img');
    if (imageElement) {
        // `currentSrc` reflects the srcset entry the browser actually decoded. Both it and `src`
        // are absolute, so the source stays fetchable from the observing realm's base URL.
        const source = String(imageElement.currentSrc || imageElement.src || '').trim();
        if (source) {
            return createImageTarget(imageElement, source, point);
        }
    }

    // An `<img>` that has not decoded yet (`src=""`, a lazy placeholder) paints nothing, so fall
    // through to the container that may already show the image instead.
    return resolveBackgroundImageTarget(eventTarget, point);
}

/**
 * @param {Element | null} element Element to name.
 * @returns {string} Short tag/id/class description for logs.
 */
export function describeElement(element) {
    if (!element || element.nodeType !== 1) {
        return '(none)';
    }

    const name = String(element.nodeName || element.tagName || '').toLowerCase();
    const id = element.id ? `#${element.id}` : '';
    const className = typeof element.className === 'string' ? element.className.trim() : '';
    const classes = className ? `.${className.split(/\s+/).slice(0, 2).join('.')}` : '';
    return `${name}${id}${classes}`;
}

/**
 * Every hit-testable element under a point, topmost first. Unlike the touch target alone this still
 * lists the frame that a covering surface sits on top of.
 * @param {Document} targetDocument Document whose viewport the point belongs to.
 * @param {{ x: number, y: number }} point Point in that viewport.
 * @returns {Element[]} Hit-test stack, or an empty array when unavailable.
 */
function readHitStack(targetDocument, point) {
    // `elementsFromPoint` belongs to the document, not to the window.
    if (typeof targetDocument?.elementsFromPoint !== 'function') {
        return [];
    }

    return targetDocument.elementsFromPoint(point.x, point.y) || [];
}

/**
 * @param {Element} frame Candidate frame element.
 * @returns {Document | null} Frame document when it is same-origin and readable.
 */
function readFrameDocument(frame) {
    try {
        return frame.contentDocument || null;
    } catch {
        // Cross-origin and sandboxed frames cannot be reached.
        return null;
    }
}

/**
 * Converts a point from the outer viewport into the frame's own viewport. A frame can be scaled by
 * CSS, so the offset is mapped through the ratio between its rendered box and its layout viewport.
 * @param {Element} frame Frame element.
 * @param {Document} frameDocument Frame document.
 * @param {{ x: number, y: number }} point Point in the outer viewport.
 * @returns {{ x: number, y: number } | null} Point inside the frame, if the frame has a viewport.
 */
function mapPointIntoFrame(frame, frameDocument, point) {
    const rect = frame.getBoundingClientRect?.();
    const viewport = frameDocument.documentElement || frameDocument.body;
    const width = Number(viewport?.clientWidth) || 0;
    const height = Number(viewport?.clientHeight) || 0;
    if (!rect?.width || !rect?.height || !width || !height) {
        return null;
    }

    return {
        x: (point.x - rect.left) * (width / rect.width),
        y: (point.y - rect.top) * (height / rect.height),
    };
}

/**
 * Resolves the image a press reached, looking inside same-origin frames when the press itself landed
 * on a surface that covers them (an overlay, a forwarded tap, a click-through wrapper).
 * @param {Document} targetDocument Document the press was delivered to.
 * @param {PressRecord} press Recorded press.
 * @param {number} depth Frame nesting depth already descended.
 * @returns {ImageTarget | null} Matched image, if any.
 */
function resolveImageInsideFrames(targetDocument, press, depth) {
    if (depth >= MAX_FRAME_DEPTH) {
        return null;
    }

    for (const element of readHitStack(targetDocument, press)) {
        if (element.nodeName !== 'IFRAME') {
            continue;
        }

        const frameDocument = readFrameDocument(element);
        const innerPoint = frameDocument && mapPointIntoFrame(element, frameDocument, press);
        if (!innerPoint) {
            continue;
        }

        const innerTarget = frameDocument.elementFromPoint?.(innerPoint.x, innerPoint.y) || null;
        const inner = resolveImageTarget(innerTarget, innerPoint) || resolveImageInsideFrames(
            frameDocument,
            { x: innerPoint.x, y: innerPoint.y, target: innerTarget },
            depth + 1,
        );
        if (inner) {
            return inner;
        }
    }

    return null;
}

/**
 * @param {Document} targetDocument Document the press was delivered to.
 * @param {PressRecord} press Recorded press.
 * @returns {ImageTarget | null} Matched image, if any.
 */
export function resolvePressedImage(targetDocument, press) {
    const pressPoint = { x: press.x, y: press.y };
    const direct = resolveImageTarget(press.target, pressPoint);
    if (direct) {
        return direct;
    }

    // A covering surface — a state layer, a rounded-corner mask, a skeleton overlay — can sit
    // between the finger and the image without being an ancestor of it, so the ancestor walk
    // above cannot reach the carrier. The hit stack names every element under the point: scan
    // it topmost-first for an image the ancestor pass missed.
    for (const element of readHitStack(targetDocument, press)) {
        if (element === press.target || !element || element.nodeType !== 1) {
            continue;
        }
        if (element === targetDocument?.body || element === targetDocument?.documentElement) {
            continue;
        }
        if (element.nodeName === 'IMG') {
            const source = String(element.currentSrc || element.src || '').trim();
            if (source) {
                return createImageTarget(element, source, pressPoint);
            }
            continue;
        }
        const source = readBackgroundImageSource(element);
        if (source) {
            return createImageTarget(element, source, pressPoint);
        }
    }

    return resolveImageInsideFrames(targetDocument, press, 0);
}

/**
 * @param {Document} targetDocument Document the press was delivered to.
 * @param {PressRecord} press Recorded press.
 * @returns {string} Pressed element plus the layers under the point, for a diagnostic log.
 */
export function describePressMiss(targetDocument, press) {
    const layers = readHitStack(targetDocument, press).slice(0, 4).map(describeElement);
    const suffix = layers.length ? ` | layers: ${layers.join(' > ')}` : '';
    return `${describeElement(press.target)}${suffix}`;
}
