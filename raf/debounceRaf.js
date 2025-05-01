// ./raf/debounceRaf.js

import { parseDuration } from '../parseDuration.js';

/**
 * Debounces a function using requestAnimationFrame.
 * - If no duration is passed, triggers on the next frame.
 * - If duration is passed, waits until N ms of inactivity using frame-based timing.
 *
 * @param {string|number|Function} durationOrFn - Duration (e.g., "300ms") or fn directly
 * @param {Function} [callbackFn] - Callback (if duration is passed as first arg)
 * @returns {Function} debounced function
 */
export function debounceRaf(durationOrFn, callbackFn) {
    const [ms, fn] =
        typeof durationOrFn === 'function'
            ? [0, durationOrFn] // ← next frame, no time threshold
            : [parseDuration(durationOrFn), callbackFn];

    let frame = null;
    let lastArgs = null;
    let lastCallTime = 0;

    const tick = (timestamp) => {
        const elapsed = timestamp - lastCallTime;

        if (elapsed >= ms) {
            fn(...lastArgs);
            frame = null;
        } else {
            frame = requestAnimationFrame(tick);
        }
    };

    return (...args) => {
        lastArgs = args;
        lastCallTime = performance.now();

        if (frame !== null) {
            cancelAnimationFrame(frame);
        }

        frame = requestAnimationFrame(tick);
    };
}
