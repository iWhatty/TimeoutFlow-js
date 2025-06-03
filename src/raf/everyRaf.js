
// ./raf/everyRaf.js

import { parseDuration } from '../parseDuration.js';

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
export function everyRaf(duration, fn, maxTimes = Infinity, runImmediately = false) {
    const ms = typeof duration === 'string' ? parseDuration(duration) : duration;
    let handle = null;
    let startTimestamp = null;
    let lastTimestamp = null;
    let running = false;
    let paused = false;
    let elapsedWhilePaused = 0;
    let count = 0;

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
            count++;
            lastTimestamp = timestamp;
            elapsedWhilePaused = 0;
        }

        handle = requestAnimationFrame(tick);
    };

    const pause = () => {
        if (running && !paused) {
            paused = true;
            elapsedWhilePaused += performance.now() - lastTimestamp;
            cancelAnimationFrame(handle);
        }
    };

    const resume = () => {
        if (running && paused) {
            paused = false;
            lastTimestamp = performance.now();
            handle = requestAnimationFrame(tick);
        }
    };

    const cancel = () => {
        if (handle !== null) {
            cancelAnimationFrame(handle);
            handle = null;
        }
        running = false;
        paused = false;
        startTimestamp = null;
        lastTimestamp = null;
        elapsedWhilePaused = 0;
    };

    const reset = (restart = false) => {
        cancel();
        count = 0;
        if (restart) start();
    };

    const start = () => {
        if (runImmediately) {
            fn?.();
            count++;
        }
        running = true;
        paused = false;
        lastTimestamp = performance.now();
        handle = requestAnimationFrame(tick);
    };

    // Initial launch
    start();

    return {
        pause,
        resume,
        cancel,
        reset,
        get isRunning() { return running && !paused; },
        get count() { return count; }
    };
}
