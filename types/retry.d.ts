/**
 * Retries a promise-returning function with delays.
 * @param {Function} fn - async function
 * @param {Object} options
 * @param {number} [options.attempts=3]
 * @param {string} [options.delay='500ms']
 * @param {boolean} [options.backoff=false] - use exponential backoff
 * @returns {Promise}
 */
export function retry(fn: Function, { attempts, delay, backoff }?: {
    attempts?: number | undefined;
    delay?: string | undefined;
    backoff?: boolean | undefined;
}): Promise<any>;
