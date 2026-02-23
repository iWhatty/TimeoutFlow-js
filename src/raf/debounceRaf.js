// ./raf/debounceRaf.js
import { resolveDelayFnOptions } from '../resolveDelayAndFn.js';
import { pendingAbort } from '../abort.js';
import { now } from '../now.js';

/**
 * Debounces a function using requestAnimationFrame.
 *
 * Preferred:
 * - debounceRaf(fn, [duration], [options])     // duration defaults to 0 (next frame)
 *
 * Also supported:
 * - debounceRaf(duration, fn, [options])
 * - debounceRaf(fn, [options])
 *
 * Timing model:
 * - Waits until `ms` of inactivity have passed (measured using frame timestamps).
 * - `ms = 0` means "run on the next animation frame" (still debounced).
 *
 * Supports:
 * - `.cancel()` clears any pending invocation.
 * - `.flush()` immediately invokes if pending.
 * - Optional AbortSignal: abort cancels any pending invocation.
 *
 * @param {Function|string|number} a - function or duration
 * @param {Function|string|number|Object} [b] - duration, fn, or options
 * @param {Object} [c] - options (3-arg form)
 * @param {AbortSignal} [c.signal] - AbortSignal to auto-cancel pending work
 * @returns {((...args: any[]) => void) & { cancel: () => void, flush: () => void }}
 */
export function debounceRaf(a, b, c) {
    // duration is optional for debounceRaf (defaults to 0)
    const { fn, delay, options } = resolveDelayFnOptions(a, b, c, 0);

    const ms = Math.max(0, delay);
    const signal = options?.signal;

    let rafId = 0;

    /** @type {any[] | null} */
    let lastArgs = null;
    /** @type {any | null} */
    let lastThis = null;

    // last time the debounced function was called (used for inactivity measurement)
    let lastCallTime = 0;

    const clearRaf = () => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = 0;
    };

    const abort = pendingAbort(signal, () => cancel());

    const cancel = () => {
        clearRaf();
        lastArgs = null;
        lastThis = null;
        lastCallTime = 0;
        abort.remove();
    };

    const invoke = () => {
        if (!lastArgs) return;

        const args = lastArgs;
        const ctx = lastThis;

        // Clear first (re-entrancy safe + GC friendly)
        lastArgs = null;
        lastThis = null;

        abort.remove();
        fn.apply(ctx, args);
    };

    const tick = (ts) => {
        if (!rafId) return; // canceled

        if (!lastArgs) {
            // Nothing pending; clean slate
            cancel();
            return;
        }

        const elapsed = ts - lastCallTime;

        if (elapsed >= ms) {
            // Stop scheduling first, then invoke
            clearRaf();
            invoke();
            return;
        }

        rafId = requestAnimationFrame(tick);
    };

    /** @type {any} */
    const debounced = function (...args) {
        if (signal?.aborted) return;

        lastArgs = args;
        lastThis = this;

        // Use monotonic clock for call timestamp; RAF tick uses its own timestamp.
        lastCallTime = now();

        // Ensure abort listener exists only while pending work exists
        abort.add();

        clearRaf();
        rafId = requestAnimationFrame(tick);
    };

    debounced.cancel = cancel;

    debounced.flush = () => {
        if (!rafId || !lastArgs) return;
        clearRaf();
        invoke();
    };

    // If already aborted at creation time, ensure clean slate.
    if (signal?.aborted) cancel();

    return debounced;
}