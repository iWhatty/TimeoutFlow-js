// ./raf/debounceRaf.js

import { parseDuration } from '../parseDuration.js';

/**
 * Debounces a function using requestAnimationFrame.
 * - If no duration is passed, triggers after the next frame (or next N ms inactivity).
 * - If duration is passed, waits until N ms of inactivity using frame-based timing.
 *
 * Supports `.cancel()` and optional AbortSignal auto-cancel.
 *
 * Overloads:
 * - debounceRaf(fn, [options])
 * - debounceRaf(duration, fn, [options])
 *
 * @param {string|number|Function} durationOrFn - Duration (e.g., "300ms") or fn directly
 * @param {Function|Object} [callbackFnOrOptions] - Callback (if duration first) OR options (if fn first)
 * @param {Object} [options]
 * @param {AbortSignal} [options.signal] - AbortSignal to auto-cancel pending work
 * @returns {((...args: any[]) => void) & { cancel: () => void }}
 */
export function debounceRaf(durationOrFn, callbackFnOrOptions, options) {
    const durationFirst = typeof durationOrFn !== 'function';

    const ms = durationFirst ? parseDuration(durationOrFn) : 0;
    const fn = durationFirst ? callbackFnOrOptions : durationOrFn;

    const opts = durationFirst ? (options ?? {}) : (callbackFnOrOptions ?? {});
    const signal = opts?.signal;

    if (typeof fn !== 'function') {
        throw new TypeError(`Expected a function, got: ${typeof fn}`);
    }

    let rafId = 0;
    let lastArgs = null;
    let lastThis = null;
    let lastCallTime = 0;

    const onAbort = () => {
        cancel();
    };

    const removeAbortListener = () => {
        signal?.removeEventListener('abort', onAbort);
    };

    const cancel = () => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = 0;
        lastArgs = null;
        lastThis = null;
        lastCallTime = 0;

        // Important: avoid keeping this closure alive via a long-lived signal
        removeAbortListener();
    };

    const tick = (timestamp) => {
        if (!rafId) return; // was canceled

        const elapsed = timestamp - lastCallTime;
        if (elapsed >= ms) {
            const args = lastArgs;
            const ctx = lastThis;

            // clear first to prevent re-entrancy weirdness if fn schedules again
            // (also removes abort listener)
            cancel();

            fn.apply(ctx, args);
            return;
        }

        rafId = requestAnimationFrame(tick);
    };

    const debounced = function (...args) {
        if (signal?.aborted) return;

        lastArgs = args;
        lastThis = this;
        lastCallTime = performance.now();

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(tick);
    };

    debounced.cancel = cancel;

    if (signal) {
        if (signal.aborted) {
            cancel();
        } else {
            signal.addEventListener('abort', onAbort, { once: true });
        }
    }

    return debounced;
}