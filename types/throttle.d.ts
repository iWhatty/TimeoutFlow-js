/**
 * @typedef {((...args: any[]) => void) & {
 *   cancel: () => void,
 *   flush: () => void
 * }} ThrottledFunction
 */
/**
 * Creates a throttled version of a function.
 * Executes immediately, throttles further calls, optional trailing execution.
 *
 * Preferred:
 * - throttle(fn, delay, [options])
 *
 * Also supported:
 * - throttle(delay, fn, [options])            // legacy/alt ordering
 *
 * Notes:
 * - Uses performance.now() (via `now()`) for elapsed timing.
 * - If trailing is enabled, uses the latest arguments/context seen during the wait.
 * - `.cancel()` clears any pending trailing invocation.
 * - `.flush()` immediately invokes a pending trailing call (if scheduled).
 * - Optional AbortSignal: abort cancels any pending trailing invocation.
 *
 * @param {Function|string|number} a
 * @param {Function|string|number|Object} b
 * @param {Object} [c]
 * @param {boolean} [c.trailing=true]
 * @param {AbortSignal} [c.signal]
 * @returns {ThrottledFunction}
 */
export function throttle(a: Function | string | number, b: Function | string | number | Object, c?: {
    trailing?: boolean | undefined;
    signal?: AbortSignal | undefined;
}): ThrottledFunction;
export type ThrottledFunction = ((...args: any[]) => void) & {
    cancel: () => void;
    flush: () => void;
};
