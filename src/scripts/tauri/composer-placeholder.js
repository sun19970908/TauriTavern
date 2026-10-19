// @ts-check

/**
 * Single owner of the composer placeholder.
 *
 * Several features want the one line above the composer, and they overlap by nature: a reply
 * finishes and its save starts immediately after. Independent implementations of
 * "capture baseline → write → restore" cannot coexist: each restore refuses to run when it finds
 * a foreign text, so it leaves its own line behind, and the next run adopts that orphan as the
 * baseline and restores it forever (that is how the composer ends up stuck on a stale line until
 * a reload).
 *
 * This lease replaces those implementations: sources register by key with a priority, only the
 * winning text is ever rendered, and the host's own placeholder is the only baseline. When a
 * writer outside this lease takes the line over, the lease adopts the new text and drops its
 * sources instead of fighting or orphaning anything.
 *
 * First-party consumers: the save-progress indicator. Extensions may use it through
 * `window.__TAURITAVERN_COMPOSER_PLACEHOLDER__`; it is Project-level coordination, not a stable
 * Public Contract, so it stays a dedicated global rather than growing the platform ABI.
 */

export const COMPOSER_PLACEHOLDER_GLOBAL = '__TAURITAVERN_COMPOSER_PLACEHOLDER__';

/** Reply stages outrank save progress: the user asked what the model is doing. */
export const COMPOSER_PLACEHOLDER_PRIORITY = Object.freeze({ save: 0, run: 1 });

/** @typedef {{ set: (key: string, text: string, priority?: number) => void, clear: (key: string) => void }} ComposerPlaceholderApi */

/**
 * @param {HTMLTextAreaElement} textarea
 * @returns {ComposerPlaceholderApi}
 */
export function createComposerPlaceholderLease(textarea) {
    /** @type {Map<string, { text: string, priority: number }>} */
    const sources = new Map();
    let baseline = textarea.getAttribute('placeholder');
    let rendered = null;
    // Set when a writer outside this lease took the line over. The lease then stays silent while
    // the placeholder still shows that writer's text, so it can neither hide it nor fight it.
    let yielded = false;
    let yieldTo = null;

    function winner() {
        let best = null;
        for (const entry of sources.values()) {
            if (!best || entry.priority > best.priority) best = entry;
        }
        return best;
    }

    function render() {
        // While the line still shows the foreign text that made us yield, stay silent.
        if (yielded && textarea.getAttribute('placeholder') === yieldTo) return;
        const next = winner()?.text ?? baseline;
        if (textarea.getAttribute('placeholder') === next) {
            rendered = next;
            return;
        }
        rendered = next;
        if (next === null) {
            textarea.removeAttribute('placeholder');
        } else {
            textarea.setAttribute('placeholder', next);
        }
    }

    const observer = new textarea.ownerDocument.defaultView.MutationObserver(() => {
        const current = textarea.getAttribute('placeholder');
        if (yielded) {
            if (current === yieldTo) return; // Foreign writer still owns the line.
            // It let go: adopt whatever owns the line now, then render what is registered.
            yielded = false;
            yieldTo = null;
            baseline = current;
            rendered = current;
            if (sources.size > 0) render();
            return;
        }
        if (current === rendered) return;
        if (sources.size > 0) {
            // A writer outside the lease owns the line now. Adopt its text as the baseline, drop
            // every source and stay out: rendering on top of it would hide that writer, and
            // restoring over it later would leave an orphan nobody owns.
            baseline = current;
            rendered = current;
            sources.clear();
            yielded = true;
            yieldTo = current;
            return;
        }
        // Idle: the host changed its own placeholder (connection state, for example).
        baseline = current;
        rendered = current;
    });
    observer.observe(textarea, { attributes: true, attributeFilter: ['placeholder'] });

    return {
        set(key, text, priority = 0) {
            const previous = sources.get(key);
            if (previous && previous.text === text && previous.priority === priority) return;
            sources.set(key, { text, priority });
            render();
        },
        clear(key) {
            if (!sources.delete(key)) return;
            render();
        },
        dispose() {
            observer.disconnect();
            sources.clear();
            render();
        },
    };
}

/**
 * Install the lease on composer start-up, before anything can write the placeholder, so the host
 * baseline is captured while it still owns the line.
 */
export function installComposerPlaceholder() {
    const textarea = document.querySelector('#send_textarea');
    if (!(textarea instanceof HTMLTextAreaElement)) return null;
    if (globalThis[COMPOSER_PLACEHOLDER_GLOBAL]) return /** @type {ComposerPlaceholderApi} */ (globalThis[COMPOSER_PLACEHOLDER_GLOBAL]);

    const lease = createComposerPlaceholderLease(textarea);
    globalThis[COMPOSER_PLACEHOLDER_GLOBAL] = lease;
    return lease;
}

/** @returns {ComposerPlaceholderApi | null} */
export function composerPlaceholder() {
    return /** @type {ComposerPlaceholderApi | null} */ (globalThis[COMPOSER_PLACEHOLDER_GLOBAL] ?? null);
}
