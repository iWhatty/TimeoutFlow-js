// ./src/debounce.js

import { resolveDelayAndFn } from './resolveDelayAndFn.js';

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
 * Notes:
 * - Uses performance.now() for internal consistency.
 * - Always invokes with the latest arguments/context.
 * - `.cancel()` clears any pending invocation.
 * - `.flush()` immediately invokes if pending.
 *
 * @param {string|number|Function} a - Delay in ms or the function to debounce.
 * @param {string|number|Function} [b] - The function to debounce, if delay is first.
 * @returns {DebouncedFunction}
 */
export function debounce(a, b) {
  const { fn, delay } = resolveDelayAndFn(a, b);

  let timeoutId = null;
  let lastArgs = null;
  let lastThis = null;

  const invoke = () => {
    if (!lastArgs) return;
    fn.apply(lastThis, lastArgs);
    lastArgs = null;
    lastThis = null;
  };

  const cancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = null;
    lastArgs = null;
    lastThis = null;
  };

  const debounced = function (...args) {
    lastArgs = args;
    lastThis = this;

    if (timeoutId) clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      timeoutId = null;
      invoke();
    }, delay);
  };

  debounced.cancel = cancel;

  debounced.flush = () => {
    if (!timeoutId) return;
    clearTimeout(timeoutId);
    timeoutId = null;
    invoke();
  };

  return debounced;
}