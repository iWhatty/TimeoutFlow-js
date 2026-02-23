// ./raf/index.js

import { afterRaf as _afterRaf } from './afterRaf.js';
import { everyRaf as _everyRaf } from './everyRaf.js';
import { debounceRaf as _debounceRaf } from './debounceRaf.js';
import { throttleRaf as _throttleRaf } from './throttleRaf.js';
import { waitForRaf as _waitForRaf } from './waitForRaf.js';

export function assertRafAvailable() {
    if (typeof requestAnimationFrame !== 'function') {
        throw new Error(
            'requestAnimationFrame is not available in this environment. ' +
            'Use the non-RAF timers (after/every/waitFor) in Node, or provide a RAF polyfill.'
        );
    }
}

const guard = (fn) =>
    (...args) => {
        assertRafAvailable();
        return fn(...args);
    };

export const afterRaf = guard(_afterRaf);
export const everyRaf = guard(_everyRaf);
export const debounceRaf = guard(_debounceRaf);
export const throttleRaf = guard(_throttleRaf);
export const waitForRaf = guard(_waitForRaf);