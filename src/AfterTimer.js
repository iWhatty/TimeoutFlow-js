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

