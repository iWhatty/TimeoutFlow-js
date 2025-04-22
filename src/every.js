
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
export function every(duration, fn, max = Infinity, runImmediately = false) {
    const ms = parseDuration(duration);
    let timer = null;
    let startTime = null;
    let remaining = ms;
    let running = false;
    let count = 0;

    const tick = () => {
        if (count >= max) {
            cancel();
            return;
        }
        fn();
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
        if (!running && count < max && remaining > 0) {
            startTime = Date.now();
            timer = setTimeout(tick, remaining);
            running = true;
        }
    };

    const cancel = () => {
        clearTimeout(timer);
        timer = null;
        running = false;
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