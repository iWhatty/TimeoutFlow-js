// ./raf/everyRaf.js

import { parseDuration } from '../parseDuration.js';

/**
 * Repeats a function every N milliseconds using requestAnimationFrame.
 *
 * @param {string|number} duration - Interval duration ("1s", "500ms", 500, etc.)
 * @param {Function} fn - Function to run
 * @param {number} [maxTimes=Infinity] - Max number of executions
 * @param {boolean} [runImmediately=false] - Whether to run immediately
 * @param {Object} [options]
 * @param {AbortSignal} [options.signal] - optional AbortSignal to auto-cancel
 * @returns {Object} - Control methods and flags
 */
export function everyRaf(duration, fn, maxTimes = Infinity, runImmediately = false, { signal } = {}) {
    const ms = typeof duration === 'string' ? parseDuration(duration) : duration;

    let handle = 0;
    let startTimestamp = null;
    let lastTimestamp = null;

    let running = false;
    let paused = false;

    let elapsedWhilePaused = 0;
    let count = 0;

    const cancelFrame = () => {
        if (handle) cancelAnimationFrame(handle);
        handle = 0;
    };

    const removeAbortListener = () => {
        signal?.removeEventListener('abort', onAbort);
    };

    const onAbort = () => {
        cancel();
    };

    if (signal) {
        if (!signal.aborted) {
            signal.addEventListener('abort', onAbort, { once: true });
        }
    }

    const tick = (timestamp) => {
        if (!running || paused) return;

        if (startTimestamp == null) {
            startTimestamp = timestamp;
            lastTimestamp = timestamp;
        }

        const elapsed = timestamp - lastTimestamp + elapsedWhilePaused;

        if (elapsed >= ms) {
            if (count >= maxTimes) {
                cancel();
                return;
            }

            fn?.();
            count += 1;

            lastTimestamp = timestamp;
            elapsedWhilePaused = 0;

            // If this call hit the max, stop immediately (prevents one extra RAF)
            if (count >= maxTimes) {
                cancel();
                return;
            }
        }

        handle = requestAnimationFrame(tick);
    };

    const pause = () => {
        if (!running || paused) return;

        paused = true;

        // If we haven't established timestamps yet, treat elapsed as 0
        const now = performance.now();
        if (typeof lastTimestamp === 'number') {
            elapsedWhilePaused += now - lastTimestamp;
        }

        cancelFrame();
    };

    const resume = () => {
        if (!running || !paused) return;
        if (signal?.aborted) return;

        paused = false;
        lastTimestamp = performance.now();
        handle = requestAnimationFrame(tick);
    };

    const cancel = () => {
        cancelFrame();

        running = false;
        paused = false;

        startTimestamp = null;
        lastTimestamp = null;
        elapsedWhilePaused = 0;

        removeAbortListener();
    };

    const reset = (restart = false) => {
        cancel();
        count = 0;
        if (restart) start();
    };

    const start = () => {
        if (running) return;
        if (signal?.aborted) return;

        // Respect maxTimes even when runImmediately is true
        if (runImmediately && count < maxTimes) {
            fn?.();
            count += 1;
        }

        if (count >= maxTimes) {
            // Nothing to do; ensure we're not "running"
            cancel();
            return;
        }

        running = true;
        paused = false;

        startTimestamp = null;
        lastTimestamp = performance.now();
        elapsedWhilePaused = 0;

        handle = requestAnimationFrame(tick);
    };

    // Initial launch
    start();

    return {
        pause,
        resume,
        cancel,
        reset,
        get isRunning() {
            return running && !paused;
        },
        get count() {
            return count;
        },
    };
}