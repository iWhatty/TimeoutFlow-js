// ./src/every.js
import { EveryTimer } from './EveryTimer.js';

/**
 * Runs a function every N ms with optional execution limit.
 *
 * @param {string|number} duration - e.g. '500ms', 1000
 * @param {Function} fn - Function to execute
 * @param {Object} [options]
 * @param {number} [options.max=Infinity] - Max times to run
 * @param {boolean} [options.runImmediately=false] - Run immediately on first tick
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
export function every(duration, fn, options) {
    return new EveryTimer(duration, fn, options);
}

