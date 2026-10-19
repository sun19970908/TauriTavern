// @ts-check

/**
 * Renders chat-write progress in the startup status pill (bottom-left) as `savechat 53%`.
 *
 * That pill is the right surface for this: startup removes it at APP_READY, so it is free afterwards,
 * and it belongs to no one else — the composer placeholder is shared with reply stages and any
 * extension that writes a stage line, and two owners of one line cannot restore correctly.
 *
 * The pill markup lives here rather than in a shared module on purpose: on this branch save progress
 * is its only consumer, and every file shared with startup is a merge conflict when upstream touches
 * it. The style mirrors `startup/startup-status-overlay.js`; if upstream restyles that pill, this
 * copy drifts and should be resynced by hand.
 *
 * It deliberately does not write `#chat_generation_status`: that element is the screen-reader
 * projection of the generation stage, and per-frame percentages would be noise there.
 */

export const SAVE_PROGRESS_EVENT = 'tt-chat-commit';

/** A single-frame metadata write finishes in milliseconds; without a floor the line only flashes. */
export const SAVE_PROGRESS_MIN_VISIBLE_MS = 400;

/**
 * Consecutive writes drain the queue momentarily between them. A merged or cancelled commit
 * releases before the next one registers, so this has to outlast the merge machinery, not just the
 * queue hand-off; a shorter delay let the line disappear mid-save.
 */
export const SAVE_PROGRESS_SETTLE_MS = 300;

/** Same element id startup uses; an existing pill means startup still owns the line. */
const PILL_ID = 'tt-startup-status-overlay';

const SHORT_LABELS = Object.freeze({
    payload: 'savechat',
    metadata: 'savemeta',
    metadataExtension: 'savemeta',
});

/**
 * Owns the shared pill, but only while it is free.
 * @returns {{ show: (text: string) => void, hide: () => void }}
 */
export function createSaveStatusPill() {
    /** @type {HTMLDivElement | null} */
    let owned = null;

    function ensure() {
        const existing = document.getElementById(PILL_ID);
        if (existing instanceof HTMLDivElement) return existing;

        const element = document.createElement('div');
        element.id = PILL_ID;
        element.style.position = 'fixed';
        element.style.left = '12px';
        element.style.bottom = '12px';
        element.style.zIndex = '999999';
        element.style.maxWidth = 'min(92vw, 560px)';
        element.style.padding = '6px 10px';
        element.style.borderRadius = '10px';
        element.style.background = 'rgba(0, 0, 0, 0.55)';
        element.style.color = '#fff';
        element.style.font = '12px/1.4 system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
        element.style.pointerEvents = 'none';
        element.style.whiteSpace = 'pre-wrap';
        element.textContent = '';
        document.body.appendChild(element);
        return element;
    }

    return {
        show(text) {
            if (owned) {
                owned.textContent = text;
                return;
            }
            if (document.getElementById(PILL_ID)) return; // Startup owns it.
            owned = ensure();
            owned.textContent = text;
        },
        hide() {
            if (!owned) return;
            owned.remove();
            owned = null;
        },
    };
}

/**
 * @typedef {{
 *   pill: { show: (text: string) => void, hide: () => void };
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
    pill,
    target = window,
    now = () => performance.now(),
    schedule = (callback, ms) => setTimeout(callback, ms),
    cancel = timer => clearTimeout(timer),
}) {
    let active = false;
    let shownAt = 0;
    /** @type {any} */
    let settleTimer = null;

    function cancelSettle() {
        if (settleTimer === null) return;
        cancel(settleTimer);
        settleTimer = null;
    }

    /** @param {{ kind?: unknown, percent?: unknown }} primary */
    function present(primary) {
        if (!active) {
            active = true;
            shownAt = now();
        }
        const kind = typeof primary.kind === 'string' ? primary.kind : '';
        const percent = Number.isFinite(primary.percent) ? Math.round(Number(primary.percent)) : 0;
        pill.show(`${SHORT_LABELS[kind] ?? 'save'} ${percent}%`);
    }

    function hide() {
        settleTimer = null;
        if (!active) return;
        const remaining = SAVE_PROGRESS_MIN_VISIBLE_MS - (now() - shownAt);
        if (remaining > 0) {
            settleTimer = schedule(hide, remaining);
            return;
        }
        active = false;
        pill.hide();
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
            cancelSettle();
            active = false;
            pill.hide();
        },
    };
}

export function installSaveProgressIndicator() {
    return createSaveProgressIndicator({ pill: createSaveStatusPill() });
}
