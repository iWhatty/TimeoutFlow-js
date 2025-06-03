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
export function every(duration: string | number, fn: Function, max?: number, runImmediately?: boolean): {
    pause(): void;
    resume(): void;
    cancel(): void;
    reset(restart?: boolean): void;
    readonly isRunning: boolean;
    readonly count: number;
};
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
export function _every(duration: string | number, fn: Function, maxTimes?: number, runImmediately?: boolean): {
    pause(): void;
    resume(): void;
    cancel(): void;
    reset(restart?: boolean): void;
    readonly isRunning: boolean;
    readonly count: number;
};
