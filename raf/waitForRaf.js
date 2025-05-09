// ./raf/waitForRaf.js
import { parseDuration } from '../src/parseDuration.js';

/**
 * Waits for a condition to return truthy, polling each frame.
 * - Ideal for visual state: DOM settling, visibility, layout changes.
 * - Respects tab inactivity (pause-safe).
 *
 * @param {Function} condition - Function returning truthy when complete
 * @param {Object} [options]
 * @param {string|number} [options.timeout] - Optional max time to wait
 * @returns {Promise<void>} Resolves when condition is met, rejects on timeout
 */
export function waitForRaf(condition, { timeout } = {}) {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    const timeoutMs = timeout ? parseDuration(timeout) : null;

    const tick = (timestamp) => {
      if (condition()) {
        return resolve();
      }

      if (timeoutMs && timestamp - start >= timeoutMs) {
        return reject(new Error('waitForRaf timed out'));
      }

      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  });
}
