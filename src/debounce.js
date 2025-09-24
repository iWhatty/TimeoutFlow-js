
// ./src/debounce.js

import { resolveDelayAndFn } from './resolveDelayAndFn.js';


/**
 * @typedef {((...args: any[]) => void) & { cancel: () => void }} DebouncedFunction
 */


/**
 * Creates a debounced function that delays invoking `fn` until after `delay` ms.
 * 
 * @param {string|number|Function} a - Delay in ms or the function to debounce.
 * @param {string|number|Function} [b] - The function to debounce, if delay is first
 * @returns {DebouncedFunction} A debounced function with `.cancel()`
 */
export function debounce(a, b) {
  const { fn, delay } = resolveDelayAndFn(a, b);
  let timeoutId = null;

  /**
   * @param {...any[]} args
   */
  const debounced = function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };

  /**
   * Cancel any pending invocation
   */
  debounced.cancel = () => {
    clearTimeout(timeoutId);
    timeoutId = null;
  };

  return debounced;
}
