import { parseDuration } from './parseDuration.js';

/**
 * Throttles a function to run at most once per given duration.
 * @param {string} duration - e.g. '1s', '500ms'
 * @param {Function} fn - the function to throttle
 * @returns {Function} throttled function
 */
export function throttle(duration, fn) {
  const limit = parseDuration(duration);
  let lastTime = 0;

  return (...args) => {
    const now = Date.now();
    if (now - lastTime >= limit) {
      lastTime = now;
      fn(...args);
    }
  };
}
