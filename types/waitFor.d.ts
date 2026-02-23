/**
 * Waits for a condition to become true, polling at intervals.
 *
 * @param {Function} condition - returns truthy when satisfied
 * @param {Object} [options] - optional polling control
 * @param {string|number} [options.interval='250ms'] - poll frequency
 * @param {string|number} [options.timeout] - max wait time
 * @param {boolean} [options.immediate=false] - If true, evaluate condition immediately
 * @param {AbortSignal} [options.signal] - Optional AbortSignal to cancel waiting
 * @returns {Promise<void>}
 */
export function waitFor(condition: Function, { interval, timeout, immediate, signal }?: {
    interval?: string | number | undefined;
    timeout?: string | number | undefined;
    immediate?: boolean | undefined;
    signal?: AbortSignal | undefined;
}): Promise<void>;
