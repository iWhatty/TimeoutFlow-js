/**
 * Repeats a function every N milliseconds using requestAnimationFrame
 * (instead of setTimeout/setInterval).
 *
 * @param {string|number} duration - Interval duration ("1s", "500ms", 500, etc.)
 * @param {Function} fn - Function to run
 * @param {number} [maxTimes=Infinity] - Max number of executions
 * @param {boolean} [runImmediately=false] - Whether to run immediately
 * @returns {Object} - Control methods and flags
 */
export function everyRaf(duration: string | number, fn: Function, maxTimes?: number, runImmediately?: boolean): Object;
