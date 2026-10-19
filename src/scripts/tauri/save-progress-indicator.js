// @ts-check

/**
 * Renders `tt-chat-commit` in the composer placeholder as `savechat:53%` / `savemeta:53%`.
 *
 * The placeholder is the least invasive surface: no new DOM, no layout height, which is what makes
 * it acceptable on a phone. The trade-off is that it is only visible while the composer is empty.
 * It deliberately leaves `#chat_generation_status` alone: that element is the screen-reader
 * projection of the generation stage, and per-frame percentages would be noise there.
 *
 * Labels are ASCII and short because a localized label does not fit this line on a phone. They are
 * derived from the commit `kind`, so the transport layer stays free of UI copy.
 */

export const SAVE_PROGRESS_EVENT = 'tt-chat-commit';

/** A single-frame metadata write finishes in milliseconds; without a floor the line only flashes. */
export const SAVE_PROGRESS_MIN_VISIBLE_MS = 400;

/**
 * Consecutive writes drain the queue momentarily between them. A merged or cancelled commit
 * releases before the next one registers, so this has to outlast the merge machinery, not just the
 * queue hand-off; a shorter delay let the line fall back to the host placeholder mid-save.
 */
export const SAVE_PROGRESS_SETTLE_MS = 300;

const SHORT_LABELS = Object.freeze({
    payload: 'savechat',
    metadata: 'savemeta',
    metadataExtension: 'savemeta',
});

/**
 * Our own progress line. It must never be adopted as the host's placeholder: a restore that is
 * skipped leaves our text on screen, and the next run would otherwise capture it as the baseline
 * and keep restoring that stale percentage forever.
 */
const PROGRESS_TEXT = /^(?:savechat|savemeta|save):\d{1,3}%$/;

/** Last placeholder seen that was the host's own, kept across runs for the case above. */
let lastHostBaseline = null;

/**
 * @typedef {{
 *   getTextarea: () => HTMLTextAreaElement | null;
 *   target?: EventTarget;
 *   now?: () => number;
 *   schedule?: (callback: () => void, ms: number) => any;
 *   cancel?: (timer: any) => void;
 * }} SaveProgressIndicatorOptions
 */

/**
 * @param {SaveProgressIndicatorOptions} options
 */
export function createSaveProgressIndicator({
    getTextarea,
    target = window,
    now = () => performance.now(),
    schedule = (callback, ms) => setTimeout(callback, ms),
    cancel = timer => clearTimeout(timer),
}) {
    /** @type {HTMLTextAreaElement | null} */
    let shownOn = null;
    /** @type {string | null} */
    let baseline = null;
    /** @type {string | null} */
    let written = null;
    let active = false;
    let shownAt = 0;
    /** @type {any} */
    let settleTimer = null;

    /** @param {HTMLTextAreaElement} textarea */
    const read = textarea => textarea.getAttribute('placeholder');

    /** The host's own placeholder, never our progress line. */
    function captureBaseline(textarea) {
        const value = read(textarea);
        if (value !== null && PROGRESS_TEXT.test(value)) return lastHostBaseline;
        lastHostBaseline = value;
        return value;
    }

    function cancelSettle() {
        if (settleTimer === null) return;
        cancel(settleTimer);
        settleTimer = null;
    }

    function restore() {
        cancelSettle();
        active = false;
        const textarea = shownOn;
        const previous = baseline;
        const mine = written;
        shownOn = null;
        baseline = null;
        written = null;
        // Only undo our own text: the host or another extension may own the placeholder by now.
        if (!textarea || read(textarea) !== mine) return;
        if (previous === null) {
            textarea.removeAttribute('placeholder');
        } else {
            textarea.setAttribute('placeholder', previous);
        }
    }

    /** @param {{ kind?: unknown, percent?: unknown }} primary */
    function present(primary) {
        const textarea = getTextarea();
        if (!textarea) return;
        if (!active) {
            baseline = captureBaseline(textarea);
            active = true;
            shownAt = now();
        } else if (read(textarea) !== written) {
            // Someone else replaced our text: adopt theirs as the baseline to return to.
            baseline = captureBaseline(textarea);
        }
        shownOn = textarea;
        const kind = typeof primary.kind === 'string' ? primary.kind : '';
        const percent = Number.isFinite(primary.percent) ? Math.round(Number(primary.percent)) : 0;
        const text = `${SHORT_LABELS[kind] ?? 'save'}:${percent}%`;
        if (read(textarea) === text) {
            written = text;
            return;
        }
        written = text;
        textarea.setAttribute('placeholder', text);
    }

    function hide() {
        settleTimer = null;
        if (!active) return;
        const remaining = SAVE_PROGRESS_MIN_VISIBLE_MS - (now() - shownAt);
        if (remaining > 0) {
            settleTimer = schedule(hide, remaining);
            return;
        }
        restore();
    }

    /** @param {Event} event */
    function onCommit(event) {
        const primary = /** @type {CustomEvent} */ (event).detail?.primary ?? null;
        if (primary) {
            cancelSettle();
            present(primary);
            return;
        }
        if (!active) return;
        cancelSettle();
        settleTimer = schedule(hide, SAVE_PROGRESS_SETTLE_MS);
    }

    target.addEventListener(SAVE_PROGRESS_EVENT, onCommit);

    return {
        dispose() {
            target.removeEventListener(SAVE_PROGRESS_EVENT, onCommit);
            restore();
        },
    };
}

/** The disconnected composer advertises "Not connected to API!"; do not cover that. */
function resolveComposerTextarea() {
    const textarea = document.querySelector('#send_textarea');
    if (!(textarea instanceof HTMLTextAreaElement)) return null;
    if (document.querySelector('#send_form')?.classList.contains('no-connection')) return null;
    return textarea;
}

export function installSaveProgressIndicator() {
    return createSaveProgressIndicator({ getTextarea: resolveComposerTextarea });
}
