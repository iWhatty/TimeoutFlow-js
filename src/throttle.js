// ./src/throttle.js

import { resolveDelayAndFn } from './resolveDelayAndFn.js';


/**
 * Creates a throttled version of a function.
 * Executes immediately, throttles further calls, optional trailing execution.
 *
 * @param {Function|string|number} a - Function or delay
 * @param {Function|string|number} b - The other parameter
 * @param {boolean} [trailing=true] - If true, fire once at trailing edge
 * @returns {Function} Throttled function with a .cancel() method
 */
export function throttle(a, b, trailing = true) {
  const { fn, delay } = resolveDelayAndFn(a, b);
  let lastCall = 0;
  let timeoutId = null;

  const throttled = function (...args) {
    const context = this;
    const now = Date.now();
    const timeSinceLast = now - lastCall;

    if (timeSinceLast >= delay) {
      lastCall = now;
      fn.apply(context, args);
    } else if (trailing && !timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        fn.apply(context, args);
      }, delay - timeSinceLast);
    }
  };

  throttled.cancel = () => {
    clearTimeout(timeoutId);
    timeoutId = null;
  };

  return throttled;
}