
// ./src/every.js
import { parseDuration } from './parseDuration.js';


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
*   reset(hard?: boolean): void,
*   readonly isRunning: boolean,
*   readonly count: number
* }}
*/
export function every(duration, fn, max = Infinity) {
    const ms = parseDuration(duration); // assumed robust
    let intervalId = null;
    let active = false;
    let count = 0;

    const run = () => {
        if (count >= max) {
            cancel();
        } else {
            fn(count++);
        }
    };

    const start = () => {
        if (!active && count < max) {
            intervalId = setInterval(run, ms);
            active = true;
        }
    };

    const pause = () => {
        if (active) {
            cancel();
        }
    };

    const resume = () => {
        start();
    };

    const cancel = () => {
        if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
        }
        active = false;
    };

    const reset = (restart = false) => {
        cancel();
        count = 0;
        if (restart) start();
    };

    // kick off on creation
    start();

    return {
        pause,
        resume,
        cancel,
        reset,
        get isRunning() { return active; },
        get count() { return count; },
    };
}
