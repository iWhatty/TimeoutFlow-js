
// ./src/every.js
import { parseDuration } from './parseDuration.js';


/**
 * Runs a function every N milliseconds with optional execution limit.
 * Returns control methods: pause, resume, cancel.
 * 
 * @param {string} duration - e.g. "1s", "500ms", "2m"
 * @param {Function} fn - function to execute
 * @param {number} [maxTimes] - optional number of times to run
 * @returns {{ pause(): void, resume(): void, cancel(): void, isRunning: boolean }}
 */
export function every(duration, fn, max = Infinity) {
    const ms = parseDuration(duration);
    let intervalId = null;
    let active = false;
    let count = 0;

    const run = () => {
        if (count >= max) {
            clearInterval(intervalId);
            active = false;
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

    start();


    return {
        pause() {
            if (active) {
                clearInterval(intervalId);
                active = false;
            }
        },
        resume() {

            start();

        },
        cancel() {
            clearInterval(intervalId);
            active = false;
        },
        get isRunning() {
            return active;
        }
    };
}