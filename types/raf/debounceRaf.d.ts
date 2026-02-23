/**
 * Debounces a function using requestAnimationFrame.
 *
 * Preferred:
 * - debounceRaf(fn, [duration], [options])     // duration defaults to 0 (next frame)
 *
 * Also supported:
 * - debounceRaf(duration, fn, [options])
 * - debounceRaf(fn, [options])
 *
 * Timing model:
 * - Waits until `ms` of inactivity have passed (measured using frame timestamps).
 * - `ms = 0` means "run on the next animation frame" (still debounced).
 *
 * Supports:
 * - `.cancel()` clears any pending invocation.
 * - `.flush()` immediately invokes if pending.
 * - Optional AbortSignal: abort cancels any pending invocation.
 *
 * @param {Function|string|number} a - function or duration
 * @param {Function|string|number|Object} [b] - duration, fn, or options
 * @param {Object} [c] - options (3-arg form)
 * @param {AbortSignal} [c.signal] - AbortSignal to auto-cancel pending work
 * @returns {((...args: any[]) => void) & { cancel: () => void, flush: () => void }}
 */
export function debounceRaf(a: Function | string | number, b?: Function | string | number | Object, c?: {
    signal?: AbortSignal | undefined;
}): ((...args: any[]) => void) & {
    cancel: () => void;
    flush: () => void;
};
