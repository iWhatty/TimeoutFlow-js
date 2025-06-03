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
export function waitForRaf(condition: Function, { timeout }?: {
    timeout?: string | number | undefined;
}): Promise<void>;
