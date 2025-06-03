/**
 * Schedules a one-time delayed function.
 *
 * @param {string|number} duration - e.g. '1s', 500, '2m'
 * @param {Function} fn - Main function to run
 * @param {Function} [onFinish] - Optional post-run callback
 * @returns {{
*   pause(): void,
*   resume(): void,
*   cancel(): void,
*   isRunning: boolean
* }}
*/
export function after(duration: string | number, fn: Function, onFinish?: Function): {
    pause(): void;
    resume(): void;
    cancel(): void;
    isRunning: boolean;
};
/**
 * Schedules a one-time delayed function.
 * @param {string} duration - e.g. "5s", "500ms", "2m"
 * @param {Function} fn - callback to run
 * @returns {{
*   pause(): void,
*   resume(): void,
*   cancel(): void,
*   readonly isRunning: boolean,
* }}
 */
export function _after(duration: string, fn: Function, onFinish: any): {
    pause(): void;
    resume(): void;
    cancel(): void;
    readonly isRunning: boolean;
};
