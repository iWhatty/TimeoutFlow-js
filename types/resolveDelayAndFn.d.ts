/**
 * Resolves flexible (fn, delay) or (delay, fn) inputs.
 *
 * @param {Function|string|number} a - function or duration
 * @param {Function|string|number} b - function or duration
 * @returns {{ fn: Function, delay: number }}
 */
export function resolveDelayAndFn(a: Function | string | number, b: Function | string | number): {
    fn: Function;
    delay: number;
};
