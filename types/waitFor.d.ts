/**
 * Waits for a condition to become true, polling at intervals.
 * @param {Function} condition - returns truthy when satisfied
 * @param {Object} options - optional polling control
 * @param {string} [options.interval='250ms']
 * @param {string} [options.timeout] - max wait time
 * @returns {Promise<void>}
 */
export function waitFor(condition: Function, { interval, timeout }?: {
    interval?: string | undefined;
    timeout?: string | undefined;
}): Promise<void>;
