/**
 * Schedules a one-time delayed function using requestAnimationFrame.
 * @param {string|number} duration - e.g. "5s", "500ms", 2000
 * @param {Function} fn - callback to run
 * @param {Function} [onFinish] - optional callback after finishing
 * @returns {Object} - Control methods and status flags
 */
export function afterRaf(duration: string | number, fn: Function, onFinish?: Function): Object;
