
// ./src/debounce.js

import { resolveDelayAndFn } from './resolveDelayAndFn.js';

/**
 * Creates a debounced function.
 * @param {Function|string|number} a
 * @param {Function|string|number} b
 * @returns {Function}
 */
export function debounce(a, b) {
  const { fn, delay } = resolveDelayAndFn(a, b);
  let timeoutId = null;

  const debounced = function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };

  debounced.cancel = () => {
    clearTimeout(timeoutId);
    timeoutId = null;
  };

  return debounced;
}

