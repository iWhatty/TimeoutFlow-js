/**
 * Creates a throttled version of a function.
 * Executes immediately, throttles further calls, optional trailing execution.
 *
 * @param {Function|string|number} a - Function or delay
 * @param {Function|string|number} b - The other parameter
 * @param {boolean} [trailing=true] - If true, fire once at trailing edge
 * @returns {Function} Throttled function with a .cancel() method
 */
export function throttle(a: Function | string | number, b: Function | string | number, trailing?: boolean): Function;
