import { parseDuration } from './parseDuration.js';

/**
 * Debounces a function, waiting until silence before firing.
 * @param {string} duration - e.g. '300ms', '1s'
 * @param {Function} fn - function to debounce
 * @returns {Function} debounced function
 */
export function debounce(duration, fn) {
  const ms = parseDuration(duration);
  let timer = null;

  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
