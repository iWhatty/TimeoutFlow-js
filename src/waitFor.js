// ./src/waitFor.js

import { parseDuration } from './parseDuration.js';

/**
 * Waits for a condition to become true, polling at intervals.
 *
 * @param {Function} condition - returns truthy when satisfied
 * @param {Object} [options] - optional polling control
 * @param {string|number} [options.interval='250ms'] - poll frequency
 * @param {string|number} [options.timeout] - max wait time
 * @param {boolean} [options.immediate=false] - If true, evaluate condition immediately
 * @returns {Promise<void>}
 */
export function waitFor(
  condition,
  { interval = '250ms', timeout, immediate = false } = {}
) {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    const intervalMs =
      typeof interval === 'string' ? parseDuration(interval) : interval;
    const timeoutMs = timeout != null ? parseDuration(timeout) : null;

    let poller = null;

    const cleanup = () => {
      if (poller != null) {
        clearInterval(poller);
        poller = null;
      }
    };

    const check = () => {
      let ok = false;

      try {
        ok = !!condition();
      } catch (err) {
        cleanup();
        reject(err);
        return;
      }

      if (ok) {
        cleanup();
        resolve();
        return;
      }

      if (timeoutMs != null && performance.now() - start >= timeoutMs) {
        cleanup();
        reject(new Error('waitFor timed out'));
      }
    };

    poller = setInterval(check, intervalMs);

    // Only evaluate immediately if explicitly requested
    if (immediate) {
      check();
    }
  });
}