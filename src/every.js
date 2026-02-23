// ./src/every.js
import { parseDuration } from './parseDuration.js';
import { EveryTimer } from './EveryTimer.js';
import { attachAbort } from './abort.js';

/**
 * Runs a function every N ms with optional execution limit.
 *
 * @param {string|number} duration - e.g. '500ms', 1000
 * @param {Function} fn - Function to execute
 * @param {number} [max=Infinity] - Max times to run
 * @param {boolean} [runImmediately=false] - Run immediately on first tick
 * @param {Object} [options]
 * @param {AbortSignal} [options.signal] - Optional AbortSignal to auto-cancel
 * @returns {{
 *   pause(): void,
 *   resume(): void,
 *   cancel(): void,
 *   reset(restart?: boolean): void,
 *   readonly isRunning: boolean,
 *   readonly isPaused: boolean,
 *   readonly isFinished: boolean,
 *   readonly count: number
 * }}
 */
export function every(duration, fn, max = Infinity, runImmediately = false, options) {
    return new EveryTimer(duration, fn, max, runImmediately, options);
}

/**
 * @deprecated Prefer `every()` (TimerBase-backed, pause-safe, perf.now-based).
 * Legacy reference implementation using setTimeout directly.
 *
 * Runs a function every N milliseconds with optional execution limit.
 *
 * @param {string|number} duration - e.g. "1s", "500ms", "2m" or raw ms
 * @param {Function} fn - function to execute
 * @param {number} [maxTimes=Infinity] - optional number of times to run
 * @param {boolean} [runImmediately=false] - Run immediately on first tick
 * @param {Object} [options]
 * @param {AbortSignal} [options.signal] - Optional AbortSignal to auto-cancel
 * @returns {{
 *   pause(): void,
 *   resume(): void,
 *   cancel(): void,
 *   reset(restart?: boolean): void,
 *   readonly isRunning: boolean,
 *   readonly isPaused: boolean,
 *   readonly isFinished: boolean,
 *   readonly count: number
 * }}
 */
export function _every(duration, fn, maxTimes = Infinity, runImmediately = false, { signal } = {}) {
    const ms = parseDuration(duration);

    let timeoutId = null;

    let startTime = null; // perf.now
    let remaining = ms;

    let running = false;
    let paused = false;
    let finished = false;

    let count = 0;

    const cancelTimeout = () => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = null;
    };

    // attachAbort() cleanup (no-op if no signal / not attached)
    let cleanupAbort = () => { };

    const cancel = () => {
        if (finished) return;

        cancelTimeout();

        running = false;
        paused = false;
        finished = true;

        remaining = 0;

        cleanupAbort();
    };

    // Abort wiring (preserve existing semantics: if already aborted, just finish)
    if (signal?.aborted) {
        finished = true;
    } else {
        cleanupAbort = attachAbort(signal, cancel);
    }

    const scheduleNext = (delay = ms) => {
        startTime = performance.now();
        remaining = delay;

        running = true;
        paused = false;

        timeoutId = setTimeout(tick, delay);
    };

    const tick = () => {
        if (finished) return;

        // If we reached max, finish and stop
        if (count >= maxTimes) {
            cancel();
            return;
        }

        fn?.(count);
        count += 1;

        if (count >= maxTimes) {
            cancel();
            return;
        }

        scheduleNext(ms);
    };

    const pause = () => {
        if (!running || finished) return;

        cancelTimeout();

        const elapsed = performance.now() - startTime;
        remaining = Math.max(0, remaining - elapsed);

        running = false;
        paused = true;
    };

    const resume = () => {
        if (finished || running || !paused) return;
        if (signal?.aborted) return;

        if (count >= maxTimes) {
            cancel();
            return;
        }

        if (!(remaining > 0)) {
            // If nothing remains, just tick immediately
            tick();
            return;
        }

        scheduleNext(remaining);
    };

    const reset = (restart = false) => {
        cancelTimeout();

        running = false;
        paused = false;
        finished = false;

        count = 0;
        remaining = ms;
        startTime = null;

        if (restart) start();
    };

    const start = () => {
        if (signal?.aborted) {
            finished = true;
            cleanupAbort();
            return;
        }

        if (runImmediately && count < maxTimes) {
            fn?.(count);
            count += 1;
        }

        if (count >= maxTimes) {
            cancel();
            return;
        }

        scheduleNext(ms);
    };

    // Initial launch
    if (!finished) start();
    else cleanupAbort();

    return {
        pause,
        resume,
        cancel,
        reset,
        get isRunning() {
            return running;
        },
        get isPaused() {
            return paused;
        },
        get isFinished() {
            return finished;
        },
        get count() {
            return count;
        },
    };
}