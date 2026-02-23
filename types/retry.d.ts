/**
 * Retries a promise-returning function with delays.
 *
 * @param {(attemptIndex: number) => Promise<any>} fn - async function
 * @param {Object} [options]
 * @param {number} [options.attempts=3] - total attempts (including the first)
 * @param {string|number} [options.delay='500ms'] - base delay between retries
 * @param {boolean} [options.backoff=false] - exponential backoff if true
 * @param {number} [options.factor=2] - backoff multiplier (only if backoff=true)
 * @param {string|number} [options.maxDelay] - clamp delay to this max
 * @param {boolean|'full'|'equal'|'decorrelated'} [options.jitter=false] - jitter strategy
 * @param {AbortSignal} [options.signal] - optional AbortSignal to cancel retries
 * @param {() => number} [options.random=Math.random] - injectable RNG for tests
 * @param {(err: any, attempt: number) => boolean | Promise<boolean>} [options.shouldRetry]
 *        Predicate deciding whether to retry after a failure.
 * @param {(err: any, attempt: number, delayMs: number) => void | Promise<void>} [options.onRetry]
 *        Hook invoked after deciding to retry and before waiting.
 * @returns {Promise<any>}
 */
export function retry(fn: (attemptIndex: number) => Promise<any>, { attempts, delay, backoff, factor, maxDelay, jitter, signal, random, shouldRetry, onRetry, }?: {
    attempts?: number | undefined;
    delay?: string | number | undefined;
    backoff?: boolean | undefined;
    factor?: number | undefined;
    maxDelay?: string | number | undefined;
    jitter?: boolean | "full" | "equal" | "decorrelated" | undefined;
    signal?: AbortSignal | undefined;
    random?: (() => number) | undefined;
    shouldRetry?: ((err: any, attempt: number) => boolean | Promise<boolean>) | undefined;
    onRetry?: ((err: any, attempt: number, delayMs: number) => void | Promise<void>) | undefined;
}): Promise<any>;
