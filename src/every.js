
// ./src/every.js
import { parseDuration } from './parseDuration.js';

import { EveryTimer } from './EveryTimer.js';

/**
 * Runs a function every N ms with optional execution limit.
 *
 * @param {string|number} duration - e.g. '500ms', 1000
 * @param {Function} fn - Function to execute
 * @param {number} [max=Infinity] - Max times to run
 * @param {boolean} [runImmediately=false] - Run immediately on first tick
 * @returns {{
 *   pause(): void,
 *   resume(): void,
 *   cancel(): void,
 *   reset(restart?: boolean): void,
 *   readonly isRunning: boolean,
 *   readonly count: number
 * }}
 */
export function every(duration, fn, max = Infinity, runImmediately = false) {
  return new EveryTimer(duration, fn, max, runImmediately);
}



/**
 * Runs a function every N milliseconds with optional execution limit.
 * Returns control methods: pause, resume, cancel, reset, and status flags.
 * 
 * @param {string|number} duration - e.g. "1s", "500ms", "2m" or raw ms
 * @param {Function} fn - function to execute
 * @param {number} [maxTimes] - optional number of times to run
 * @returns {{
*   pause(): void,
*   resume(): void,
*   cancel(): void,
*   reset(restart?: boolean): void,
*   readonly isRunning: boolean,
*   readonly count: number
* }}
*/
export function _every(duration, fn, maxTimes = Infinity, runImmediately = false) {
    const ms = parseDuration(duration);
    let startTime = null;
    let remaining = ms;
    let running = false;
    let timer = null;

    let count = 0;

    const tick = () => {
        if (count >= maxTimes) {
            cancel();
            return;
        }
        fn?.(); // Main Func to exec after delay.
        count++
        scheduleNext(); // keep going
    };

    const scheduleNext = () => {
        timer = setTimeout(tick, ms);
        startTime = Date.now();
        remaining = ms;
        running = true;
    };

    const pause = () => {
        if (running) {
            clearTimeout(timer);
            remaining -= Date.now() - startTime;
            running = false;
        }
    };

    const resume = () => {
        if (!running && count < maxTimes && remaining > 0) {
            timer = setTimeout(tick, remaining);
            startTime = Date.now();
            running = true;
        }
    };

    const cancel = () => {
        clearTimeout(timer);
        running = false;
        timer = null;
    };

    const reset = (restart = false) => {
        cancel();
        count = 0;
        remaining = ms;
        if (restart) start();
    };

    const start = () => {
        if (runImmediately) {
            tick();
        } else {
            scheduleNext();
        }
    };


    // Initial launch
    start();

    return {
        pause,
        resume,
        cancel,
        reset,
        get isRunning() { return running; },
        get count() { return count; }
    };

}