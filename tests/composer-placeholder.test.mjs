import assert from 'node:assert/strict';
import test from 'node:test';

import {
    COMPOSER_PLACEHOLDER_GLOBAL,
    COMPOSER_PLACEHOLDER_PRIORITY,
    createComposerPlaceholderLease,
} from '../src/scripts/tauri/composer-placeholder.js';

const BASELINE = 'Type a message, or /? for help';

function fakeTextarea() {
    let placeholder = BASELINE;
    const observers = [];
    return {
        getAttribute: () => placeholder,
        setAttribute: (_name, value) => { placeholder = value; },
        removeAttribute: () => { placeholder = null; },
        read: () => placeholder,
        overwrite: value => { placeholder = value; },
        ownerDocument: {
            defaultView: {
                MutationObserver: class {
                    constructor(callback) { observers.push(callback); }
                    observe() {}
                    disconnect() {}
                },
            },
        },
        /** Simulate the browser delivering the placeholder mutation. */
        flush: () => { for (const callback of observers) callback(); },
    };
}

test('the highest priority source owns the line, and the baseline returns when it clears', () => {
    const textarea = fakeTextarea();
    const lease = createComposerPlaceholderLease(textarea);

    lease.set('save', 'savechat:40%', COMPOSER_PLACEHOLDER_PRIORITY.save);
    assert.equal(textarea.read(), 'savechat:40%');

    lease.set('run', '等待回复·4秒', COMPOSER_PLACEHOLDER_PRIORITY.run);
    assert.equal(textarea.read(), '等待回复·4秒');

    // Both sources are live: clearing the winner must reveal the loser, not the host baseline.
    lease.clear('run');
    assert.equal(textarea.read(), 'savechat:40%');

    lease.clear('save');
    assert.equal(textarea.read(), BASELINE);
});

test('a writer outside the lease takes the line over without leaving an orphan', () => {
    const textarea = fakeTextarea();
    const lease = createComposerPlaceholderLease(textarea);

    lease.set('save', 'savechat:100%', COMPOSER_PLACEHOLDER_PRIORITY.save);
    assert.equal(textarea.read(), 'savechat:100%');

    // A second implementation of the same line, or an extension, wins the race.
    textarea.overwrite('等待回复·2秒');
    textarea.flush();

    assert.equal(textarea.read(), '等待回复·2秒', 'the foreign text is left untouched');
    // The lease steps aside, so it neither fights the writer nor restores over it later.
    lease.set('save', 'savechat:10%', COMPOSER_PLACEHOLDER_PRIORITY.save);
    assert.equal(textarea.read(), '等待回复·2秒');
});

test('the lease resumes once the foreign writer restores the host text', () => {
    const textarea = fakeTextarea();
    const lease = createComposerPlaceholderLease(textarea);

    lease.set('save', 'savechat:100%', COMPOSER_PLACEHOLDER_PRIORITY.save);
    textarea.overwrite('等待回复·2秒');
    textarea.flush();
    lease.set('save', 'savechat:10%', COMPOSER_PLACEHOLDER_PRIORITY.save);
    assert.equal(textarea.read(), '等待回复·2秒', 'stays silent while the foreign text is up');

    // The foreign writer restores the host placeholder; the lease owns the line again.
    textarea.overwrite(BASELINE);
    textarea.flush();
    lease.set('save', 'savechat:20%', COMPOSER_PLACEHOLDER_PRIORITY.save);
    assert.equal(textarea.read(), 'savechat:20%');

    lease.clear('save');
    assert.equal(textarea.read(), BASELINE);
});

test('a host placeholder change while idle becomes the new baseline', () => {
    const textarea = fakeTextarea();
    const lease = createComposerPlaceholderLease(textarea);

    // SillyTavern rewrites the placeholder when the connection state changes.
    textarea.overwrite('Not connected to API!');
    textarea.flush();

    lease.set('save', 'savemeta:100%', COMPOSER_PLACEHOLDER_PRIORITY.save);
    assert.equal(textarea.read(), 'savemeta:100%');

    lease.clear('save');
    assert.equal(textarea.read(), 'Not connected to API!');
});

test('the lease is exported for extensions and stays idempotent', () => {
    assert.equal(COMPOSER_PLACEHOLDER_GLOBAL, '__TAURITAVERN_COMPOSER_PLACEHOLDER__');
});
