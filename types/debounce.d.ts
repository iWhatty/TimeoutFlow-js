/**
 * @typedef {((...args: any[]) => void) & {
 *   cancel: () => void,
 *   flush: () => void
 * }} DebouncedFunction
 */
/**
 * Creates a debounced function that delays invoking `fn`
 * until after `delay` ms of inactivity.
 *
 * Preferred:
 * - debounce(fn, [delay], [options])          // delay defaults to 0
 *
 * Also supported:
 * - debounce(delay, fn, [options])            // legacy/alt ordering
 * - debounce(fn, [options])
 *
 * Notes:
 * - Always invokes with the latest arguments/context.
 * - `.cancel()` clears any pending invocation.
 * - `.flush()` immediately invokes if pending.
 * - Optional AbortSignal: abort cancels pending invocation.
 *
 * @param {Function|string|number} a - Function or delay (see overloads)
 * @param {Function|string|number|Object} [b] - Delay, function, or options
 * @param {Object} [c] - Options (3-arg form)
 * @param {AbortSignal} [c.signal] - Optional AbortSignal to cancel pending work
 * @returns {DebouncedFunction}
 */
export function debounce(a: Function | string | number, b?: Function | string | number | Object, c?: {
    signal?: AbortSignal | undefined;
}): DebouncedFunction;
export type DebouncedFunction = ((...args: any[]) => void) & {
    cancel: () => void;
    flush: () => void;
};
