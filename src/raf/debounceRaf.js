// ./raf/debounceRaf.js
import { parseDuration } from '../parseDuration.js';
import { pendingAbort } from '../abort.js';

/**
 * Debounces a function using requestAnimationFrame.
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
 * Overloads:
 * - debounceRaf(fn, [options])                  // ms defaults to 0 (next frame)
 * - debounceRaf(duration, fn, [options])
 *
 * @param {string|number|Function} durationOrFn - Duration (e.g., "300ms") or fn directly
 * @param {Function|Object} [callbackFnOrOptions] - Callback (if duration first) OR options (if fn first)
 * @param {Object} [options]
 * @param {AbortSignal} [options.signal] - AbortSignal to auto-cancel pending work
 * @returns {((...args: any[]) => void) & { cancel: () => void, flush: () => void }}
 */
export function debounceRaf(durationOrFn, callbackFnOrOptions, options) {
  const durationFirst = typeof durationOrFn !== 'function';

  const msRaw = durationFirst ? parseDuration(durationOrFn) : 0;
  const ms = Math.max(0, msRaw);

  const fn = durationFirst ? callbackFnOrOptions : durationOrFn;

  const opts = durationFirst ? (options ?? {}) : (callbackFnOrOptions ?? {});
  const signal = opts?.signal;

  if (typeof fn !== 'function') {
    throw new TypeError(`Expected a function, got: ${typeof fn}`);
  }

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

  const cancel = () => {
    clearRaf();
    lastArgs = null;
    lastThis = null;
    lastCallTime = 0;
    abort.remove();
  };

  const abort = pendingAbort(signal, () => cancel());

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

    // Use perf.now for call timestamp; RAF tick uses its own timestamp,
    // both are monotonic in modern browsers.
    lastCallTime = performance.now();

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