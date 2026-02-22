// ./src/throttle.js

import { resolveDelayAndFn } from './resolveDelayAndFn.js';

/**
 * @typedef {((...args: any[]) => void) & { cancel: () => void }} ThrottledFunction
 */

/**
 * Creates a throttled version of a function.
 * Executes immediately, throttles further calls, optional trailing execution.
 *
 * Notes:
 * - Uses performance.now() for elapsed timing (robust to system clock changes).
 * - If trailing is enabled, uses the latest arguments/context seen during the wait.
 *
 * @param {Function|string|number} a - Function or delay
 * @param {Function|string|number} b - The other parameter
 * @param {boolean} [trailing=true] - If true, fire once at trailing edge
 * @returns {ThrottledFunction} Throttled function with a `.cancel()` method
 */
export function throttle(a, b, trailing = true) {
  const { fn, delay } = resolveDelayAndFn(a, b);

  let lastCallTime = -Infinity;
  let timeoutId = null;

  /** @type {any[] | null} */
  let lastArgs = null;
  /** @type {any | null} */
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

  const throttled = function (...args) {
    const now = performance.now();
    const timeSinceLast = now - lastCallTime;

    lastArgs = args;
    lastThis = this;

    if (timeSinceLast >= delay) {
      // Leading edge: run now
      lastCallTime = now;

      // Clear any pending trailing call
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      invoke();
      return;
    }

    if (!trailing) return;

    // Trailing edge: schedule (or keep scheduled) using latest args
    if (!timeoutId) {
      const wait = Math.max(0, delay - timeSinceLast);
      timeoutId = setTimeout(() => {
        timeoutId = null;
        lastCallTime = performance.now();
        invoke();
      }, wait);
    }
  };

  throttled.cancel = cancel;

  return throttled;
}