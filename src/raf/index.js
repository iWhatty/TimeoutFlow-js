
// ./raf/index.js

import { afterRaf as _afterRaf } from './afterRaf.js';
import { everyRaf as _everyRaf } from './everyRaf.js';
import { debounceRaf as _debounceRaf } from './debounceRaf.js';
import { throttleRaf as _throttleRaf } from './throttleRaf.js';
import { waitForRaf as _waitForRaf } from './waitForRaf.js';

export function afterRaf(...args) {
    assertRafAvailable();
    return _afterRaf(...args);
}

export function everyRaf(...args) {
    assertRafAvailable();
    return _everyRaf(...args);
}

export function debounceRaf(...args) {
    assertRafAvailable();
    return _debounceRaf(...args);
}

export function throttleRaf(...args) {
    assertRafAvailable();
    return _throttleRaf(...args);
}

export function waitForRaf(...args) {
    assertRafAvailable();
    return _waitForRaf(...args);
}

export function assertRafAvailable() {
    if (typeof requestAnimationFrame !== 'function') {
        throw new Error(
            'requestAnimationFrame is not available in this environment. ' +
            'Use the non-RAF timers (after/every/waitFor) in Node, or provide a RAF polyfill.'
        );
    }
}