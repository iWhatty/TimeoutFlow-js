// ./src/AfterTimer.js
import { TimerBase } from './TimerBase.js';

/**
 * Executes a function once after a delay.
 */
export class AfterTimer extends TimerBase {
  /**
   * @param {string|number} duration - Delay before firing (e.g., '1s', 300)
   * @param {Function} fn - Main function to execute
   * @param {Function} [onFinish] - Optional callback when done
   */
  constructor(duration, fn, onFinish) {
    super(duration);
    this.resume(() => {
      fn?.();
      onFinish?.();
    });
  }
}

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
export function after(duration, fn, onFinish) {
 return new AfterTimer(duration, fn, onFinish);
}
