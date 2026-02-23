// ./src/debounce.js

import { resolveDelayFnOptions } from './resolveDelayAndFn.js';
import { pendingAbort } from './abort.js';

/**
 * @typedef {((...args: any[]) => void) & {
 *   cancel: () => void,
 *   flush: () => void
 * }} DebouncedFunction
 */

/**
 * Creates a debounced function that delays invoking `fn`
 * until after `delay` ms of inactivity.
 *
 * Preferred:
 * - debounce(fn, [delay], [options])          // delay defaults to 0
 *
 * Also supported:
 * - debounce(delay, fn, [options])            // legacy/alt ordering
 * - debounce(fn, [options])
 *
 * Notes:
 * - Always invokes with the latest arguments/context.
 * - `.cancel()` clears any pending invocation.
 * - `.flush()` immediately invokes if pending.
 * - Optional AbortSignal: abort cancels pending invocation.
 *
 * @param {Function|string|number} a - Function or delay (see overloads)
 * @param {Function|string|number|Object} [b] - Delay, function, or options
 * @param {Object} [c] - Options (3-arg form)
 * @param {AbortSignal} [c.signal] - Optional AbortSignal to cancel pending work
 * @returns {DebouncedFunction}
 */
export function debounce(a, b, c) {
  const { fn, delay, options } = resolveDelayFnOptions(a, b, c, 0);
  const signal = options?.signal;

  const wait = Math.max(0, delay);

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

  /** @type {any} */
  const debounced = function (...args) {
    if (signal?.aborted) return;

    lastArgs = args;
    lastThis = this;

    if (timeoutId) clearTimeout(timeoutId);

    // Listener should exist only while a call is pending
    abort.add();

    timeoutId = setTimeout(() => {
      timeoutId = 0;
      invoke();
    }, wait);
  };

  debounced.cancel = cancel;

  debounced.flush = () => {
    if (!timeoutId) return;
    clearTimeout(timeoutId);
    timeoutId = 0;
    invoke();
  };

  // If already aborted at creation time, ensure clean slate.
  if (signal?.aborted) cancel();

  return debounced;
}