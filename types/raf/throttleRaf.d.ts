/**
 * Throttles a function using `requestAnimationFrame`, with optional frame skipping.
 *
 * Preferred:
 * - throttleRaf(fn, [frameSkip], [options])
 *
 * Also supported:
 * - throttleRaf(fn, [options])               // frameSkip defaults to 0
 *
 * Executes at most once every `(frameSkip + 1)` frames.
 *
 * Argument behavior while throttled:
 * - trailing=true  (default): uses the latest args/this seen while waiting
 * - trailing=false: keeps the first args/this and ignores later calls until it fires
 *
 * AbortSignal:
 * - If `signal` is provided, abort will cancel any pending scheduled execution.
 * - Listener is attached only while a call is pending.
 *
 * @template {(...args: any[]) => any} T
 * @param {T} fn
 * @param {number|{signal?: AbortSignal, trailing?: boolean}} [frameSkipOrOptions=0]
 * @param {{signal?: AbortSignal, trailing?: boolean}} [maybeOptions]
 * @returns {T & { cancel: () => void, flush: () => void }}
 */
export function throttleRaf<T extends (...args: any[]) => any>(fn: T, frameSkipOrOptions?: number | {
    signal?: AbortSignal;
    trailing?: boolean;
}, maybeOptions?: {
    signal?: AbortSignal;
    trailing?: boolean;
}): T & {
    cancel: () => void;
    flush: () => void;
};
