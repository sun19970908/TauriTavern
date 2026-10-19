// @ts-check

/**
 * Renders `tt-chat-commit` in the composer placeholder as `savechat:53%` / `savemeta:53%`.
 *
 * It does not own the placeholder any more: `composer-placeholder.js` does, and this module is one
 * source among others (reply stages outrank it). Ownership in one place is what keeps a skipped
 * restore from leaving an orphan line for the next run to adopt as the host's text.
 *
 * The placeholder is the least invasive surface: no new DOM, no layout height, which is what makes
 * it acceptable on a phone. The trade-off is that it is only visible while the composer is empty.
 * It deliberately leaves `#chat_generation_status` alone: that element is the screen-reader
 * projection of the generation stage, and per-frame percentages would be noise there.
 *
 * Labels are ASCII and short because a localized label does not fit this line on a phone. They are
 * derived from the commit `kind`, so the transport layer stays free of UI copy.
 */

import { composerPlaceholder, COMPOSER_PLACEHOLDER_PRIORITY } from './composer-placeholder.js';

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

const SOURCE_KEY = 'save';

/**
 * @typedef {{
 *   lease?: import('./composer-placeholder.js').ComposerPlaceholderApi | null;
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
    lease,
    target = window,
    now = () => performance.now(),
    schedule = (callback, ms) => setTimeout(callback, ms),
    cancel = timer => clearTimeout(timer),
} = {}) {
    // An explicitly null lease disables the indicator (tests); an omitted one resolves the
    // installed lease on first use, so this module does not depend on bootstrap's import order.
    const hasInjectedLease = lease !== undefined;
    let resolved = lease ?? null;
    let active = false;
    let shownAt = 0;
    /** @type {any} */
    let settleTimer = null;

    function cancelSettle() {
        if (settleTimer === null) return;
        cancel(settleTimer);
        settleTimer = null;
    }

    function present(primary) {
        if (!hasInjectedLease && !resolved) resolved = composerPlaceholder();
        if (!resolved) return;
        if (!active) {
            active = true;
            shownAt = now();
        }
        const kind = typeof primary.kind === 'string' ? primary.kind : '';
        const percent = Number.isFinite(primary.percent) ? Math.round(Number(primary.percent)) : 0;
        resolved.set(SOURCE_KEY, `${SHORT_LABELS[kind] ?? 'save'}:${percent}%`, COMPOSER_PLACEHOLDER_PRIORITY.save);
    }

    function release() {
        if (!active) return;
        active = false;
        resolved?.clear(SOURCE_KEY);
    }

    function hide() {
        settleTimer = null;
        if (!active) return;
        const remaining = SAVE_PROGRESS_MIN_VISIBLE_MS - (now() - shownAt);
        if (remaining > 0) {
            settleTimer = schedule(hide, remaining);
            return;
        }
        release();
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
            release();
        },
    };
}

export function installSaveProgressIndicator() {
    return createSaveProgressIndicator();
}
