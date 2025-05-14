
// ./src/waitFor.js

import { parseDuration } from './parseDuration.js';

/**
 * Waits for a condition to become true, polling at intervals.
 * @param {Function} condition - returns truthy when satisfied
 * @param {Object} options - optional polling control
 * @param {string} [options.interval='250ms']
 * @param {string} [options.timeout] - max wait time
 * @returns {Promise<void>}
 */
export function waitFor(condition, { interval = '250ms', timeout } = {}) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const intervalMs = typeof interval === 'string' ? parseDuration(interval) : interval;
      const timeoutMs = timeout ? parseDuration(timeout) : null;
  
      const check = () => {
        if (condition()) {
          clearInterval(poller);
          resolve();
        } else if (timeoutMs && Date.now() - start >= timeoutMs) {
          clearInterval(poller);
          reject(new Error('waitFor timed out'));
        }
      };
  
      const poller = setInterval(check, intervalMs);
    });
  }
  