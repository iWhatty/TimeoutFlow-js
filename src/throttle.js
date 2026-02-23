// ./src/throttle.js

import { resolveDelayFnOptions } from './resolveDelayAndFn.js';
import { pendingAbort } from './abort.js';

/**
 * @typedef {((...args: any[]) => void) & {
 *   cancel: () => void,
 *   flush: () => void
 * }} ThrottledFunction
 */

/**
 * Creates a throttled version of a function.
 * Executes immediately, throttles further calls, optional trailing execution.
 *
 * Notes:
 * - Uses performance.now() for elapsed timing.
 * - If trailing is enabled, uses the latest arguments/context seen during the wait.
 * - `.cancel()` clears any pending trailing invocation.
 * - `.flush()` immediately invokes a pending trailing call (if scheduled).
 * - Optional AbortSignal: abort cancels any pending trailing invocation.
 *
 * Supported forms:
 * - throttle(fn, delay, [options])
 * - throttle(delay, fn, [options])
 *
 * @param {Function|string|number} a - Function or delay
 * @param {Function|string|number|Object} b - Delay, function, or options (only when delay defaults are used)
 * @param {Object} [c] - options
 * @param {boolean} [c.trailing=true] - If true, fire once at trailing edge
 * @param {AbortSignal} [c.signal] - Optional AbortSignal to auto-cancel
 * @returns {ThrottledFunction}
 */
export function throttle(a, b, c) {
  // Require an explicit delay by passing `undefined` as defaultDelay.
  const { fn, delay, options } = resolveDelayFnOptions(a, b, c, undefined);

  const signal = options?.signal;
  const trailing = options?.trailing ?? true;

  const waitWindow = Math.max(0, delay);

  let lastCallTime = -Infinity;
  let timeoutId = 0;

  /** @type {any[] | null} */
  let lastArgs = null;
  /** @type {any | null} */
  let lastThis = null;

  const abort = pendingAbort(signal, () => cancel());

  const invoke = () => {
    if (!lastArgs) return;

    const args = lastArgs;
    const ctx = lastThis;

    // clear first (re-entrancy safe + GC friendly)
    lastArgs = null;
    lastThis = null;

    abort.remove();
    fn.apply(ctx, args);
  };

  const cancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = 0;

    lastArgs = null;
    lastThis = null;

    abort.remove();
  };

  const scheduleTrailing = (wait) => {
    abort.add();

    timeoutId = setTimeout(() => {
      timeoutId = 0;
      lastCallTime = performance.now();
      invoke();
    }, wait);
  };

  /** @type {any} */
  const throttled = function (...args) {
    if (signal?.aborted) return;

    const now = performance.now();
    const timeSinceLast = now - lastCallTime;

    lastArgs = args;
    lastThis = this;

    if (timeSinceLast >= waitWindow) {
      // Leading edge: run now
      lastCallTime = now;

      // Clear any pending trailing call (and listener)
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = 0;
        abort.remove();
      }

      invoke();
      return;
    }

    if (!trailing) return;

    // Trailing edge: schedule once, keep latest args
    if (!timeoutId) {
      const wait = Math.max(0, waitWindow - timeSinceLast);
      scheduleTrailing(wait);
    }
  };

  throttled.cancel = cancel;

  throttled.flush = () => {
    if (!timeoutId) return;
    clearTimeout(timeoutId);
    timeoutId = 0;

    lastCallTime = performance.now();
    invoke();
  };

  // If already aborted at creation time, ensure clean slate.
  if (signal?.aborted) cancel();

  return throttled;
}