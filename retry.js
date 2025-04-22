import { parseDuration } from './parseDuration.js';

/**
 * Retries a promise-returning function with delays.
 * @param {Function} fn - async function
 * @param {Object} options
 * @param {number} [options.attempts=3]
 * @param {string} [options.delay='500ms']
 * @param {boolean} [options.backoff=false] - use exponential backoff
 * @returns {Promise}
 */
export async function retry(fn, { attempts = 3, delay = '500ms', backoff = false } = {}) {
  const baseDelay = parseDuration(delay);

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === attempts - 1) throw err;
      const wait = backoff ? baseDelay * Math.pow(2, i) : baseDelay;
      await new Promise(resolve => setTimeout(resolve, wait));
    }
  }
}
