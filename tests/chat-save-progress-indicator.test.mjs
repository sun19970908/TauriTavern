import assert from 'node:assert/strict';
import test from 'node:test';

import { createComposerPlaceholderLease } from '../src/scripts/tauri/composer-placeholder.js';
import {
    createSaveProgressIndicator,
    SAVE_PROGRESS_MIN_VISIBLE_MS,
    SAVE_PROGRESS_SETTLE_MS,
} from '../src/scripts/tauri/save-progress-indicator.js';

const BASELINE = 'Type a message, or /? for help';

function fakeTextarea() {
    let placeholder = BASELINE;
    return {
        getAttribute: () => placeholder,
        setAttribute: (_name, value) => { placeholder = value; },
        removeAttribute: () => { placeholder = null; },
        read: () => placeholder,
        ownerDocument: {
            defaultView: { MutationObserver: class { observe() {} disconnect() {} } },
        },
    };
}

function fakeClock() {
    const clock = { t: 0, timers: [], nextId: 1 };
    clock.now = () => clock.t;
    clock.schedule = (fn, ms) => {
        const id = clock.nextId++;
        clock.timers.push({ id, fn, at: clock.t + ms });
        return id;
    };
    clock.cancel = id => { clock.timers = clock.timers.filter(timer => timer.id !== id); };
    clock.advance = ms => {
        const target = clock.t + ms;
        for (;;) {
            clock.timers.sort((a, b) => a.at - b.at);
            const next = clock.timers[0];
            if (!next || next.at > target) break;
            clock.timers.shift();
            clock.t = next.at;
            next.fn();
        }
        clock.t = target;
    };
    return clock;
}

function fakeTarget() {
    const listeners = new Map();
    return {
        addEventListener: (name, fn) => listeners.set(name, fn),
        removeEventListener: name => listeners.delete(name),
        emit: detail => listeners.get('tt-chat-commit')?.({ detail }),
        size: () => listeners.size,
    };
}

function setup() {
    const textarea = fakeTextarea();
    const clock = fakeClock();
    const target = fakeTarget();
    const lease = createComposerPlaceholderLease(textarea);
    const indicator = createSaveProgressIndicator({
        lease,
        target,
        now: clock.now,
        schedule: clock.schedule,
        cancel: clock.cancel,
    });
    return { textarea, clock, target, lease, indicator };
}

test('each commit kind renders its short label with the current percent', () => {
    const { textarea, target } = setup();

    target.emit({ pending: 1, primary: { kind: 'payload', percent: 12 } });
    assert.equal(textarea.read(), 'savechat:12%');

    target.emit({ pending: 1, primary: { kind: 'payload', percent: 100 } });
    assert.equal(textarea.read(), 'savechat:100%');

    target.emit({ pending: 1, primary: { kind: 'metadata', percent: 100 } });
    assert.equal(textarea.read(), 'savemeta:100%');

    target.emit({ pending: 1, primary: { kind: 'metadataExtension', percent: 40 } });
    assert.equal(textarea.read(), 'savemeta:40%');
});

test('the line outlives the queue by the settle delay and a minimum visible time', () => {
    const { textarea, clock, target } = setup();

    target.emit({ pending: 1, primary: { kind: 'payload', percent: 100 } });
    clock.advance(50);
    target.emit({ pending: 0, primary: null });
    assert.equal(textarea.read(), 'savechat:100%', 'settle delay keeps the line up');

    clock.advance(SAVE_PROGRESS_SETTLE_MS);
    assert.equal(textarea.read(), 'savechat:100%', 'minimum visible time still holds it');

    clock.advance(SAVE_PROGRESS_MIN_VISIBLE_MS);
    assert.equal(textarea.read(), BASELINE, 'the host placeholder returns');
});

test('consecutive writes bridge instead of restoring twice', () => {
    const { textarea, clock, target } = setup();

    target.emit({ pending: 1, primary: { kind: 'payload', percent: 100 } });
    clock.advance(200);
    target.emit({ pending: 0, primary: null });
    clock.advance(SAVE_PROGRESS_SETTLE_MS / 2);
    target.emit({ pending: 1, primary: { kind: 'metadata', percent: 0 } });
    assert.equal(textarea.read(), 'savemeta:0%');

    clock.advance(10);
    target.emit({ pending: 1, primary: { kind: 'metadata', percent: 100 } });
    clock.advance(SAVE_PROGRESS_SETTLE_MS + SAVE_PROGRESS_MIN_VISIBLE_MS);
    target.emit({ pending: 0, primary: null });
    clock.advance(SAVE_PROGRESS_SETTLE_MS + SAVE_PROGRESS_MIN_VISIBLE_MS);
    assert.equal(textarea.read(), BASELINE);
});

test('a reply stage outranks the save line and hands the line back afterwards', () => {
    const { textarea, lease } = setup();
    lease.set('run', '等待回复·4秒', 1);

    lease.set('save', 'savechat:55%', 0);
    assert.equal(textarea.read(), '等待回复·4秒', 'the reply stage stays on top');

    lease.clear('run');
    assert.equal(textarea.read(), 'savechat:55%', 'the save line resumes when the reply ends');
});

test('a missing lease never breaks the write path and dispose releases later text', () => {
    const clock = fakeClock();
    const target = fakeTarget();
    const withoutLease = createSaveProgressIndicator({
        lease: null, target, now: clock.now, schedule: clock.schedule, cancel: clock.cancel,
    });

    assert.doesNotThrow(() => target.emit({ pending: 1, primary: { kind: 'payload', percent: 10 } }));
    assert.doesNotThrow(() => target.emit({ pending: 0, primary: null }));
    clock.advance(SAVE_PROGRESS_SETTLE_MS + SAVE_PROGRESS_MIN_VISIBLE_MS);
    withoutLease.dispose();

    const textarea = fakeTextarea();
    const lease = createComposerPlaceholderLease(textarea);
    const indicator = createSaveProgressIndicator({
        lease, target, now: clock.now, schedule: clock.schedule, cancel: clock.cancel,
    });

    target.emit({ pending: 1, primary: { kind: 'payload', percent: 80 } });
    assert.equal(textarea.read(), 'savechat:80%');

    indicator.dispose();
    assert.equal(textarea.read(), BASELINE);
    assert.equal(target.size(), 0);
});
