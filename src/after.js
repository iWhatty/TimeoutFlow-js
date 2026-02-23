// ./src/after.js
import { AfterTimer } from './AfterTimer.js';


/**
 * Schedules a one-time delayed function.
 *
 * @param {string|number} duration - e.g. '1s', 500, '2m'
 * @param {Function} fn - Main function to run
 * @param {Object} [options]
 * @param {Function} [options.onFinish] - Optional post-run callback
 * @param {AbortSignal} [options.signal] - Optional AbortSignal to auto-cancel
 * @returns {{
 *   pause(): void,
 *   resume(): void,
 *   cancel(): void,
 *   reset(): void,
 *   readonly isRunning: boolean,
 *   readonly isPaused: boolean,
 *   readonly isFinished: boolean
 * }}
 */
export function after(duration, fn, options) {
  return new AfterTimer(duration, fn, options);
}