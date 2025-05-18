// ./src/TimerBase.js
import { parseDuration } from './parseDuration.js';

/**
 * Base timer class to manage pause/resume/cancel behavior.
 * Not meant to be used directly—subclass for concrete behavior.
 */
export class TimerBase {
  #ms;
  #startTime = null;
  #remaining;
  #timer = null;
  #running = false;

  /**
   * @param {string|number} duration - The duration to wait in ms or shorthand format
   */
  constructor(duration) {
    this.#ms = parseDuration(duration);
    this.#remaining = this.#ms;
  }

  /**
   * Whether the timer is currently running.
   * @returns {boolean}
   */
  get isRunning() {
    return this.#running;
  }

  /**
   * Pause the active timer, storing remaining time.
   */
  pause() {
    if (this.#running) {
      clearTimeout(this.#timer);
      this.#remaining -= Date.now() - this.#startTime;
      this.#running = false;
    }
  }

  /**
   * Resume the timer using the remaining time.
   * @param {Function} callback - Called when time completes
   * @param {number|null} [overrideDelay] - Optional custom delay in ms
   */
  resume(callback, overrideDelay = null) {
    if (!this.#running && this.#remaining > 0) {
      this.#startTime = Date.now();
      this.#running = true;
      this.#timer = setTimeout(() => {
        this.#running = false;
        callback?.();
      }, overrideDelay ?? this.#remaining);
    }
  }

  /**
   * Cancel the timer immediately.
   */
  cancel() {
    clearTimeout(this.#timer);
    this.#running = false;
    this.#timer = null;
  }

  /**
   * Reset the timer to its original delay, cancelling if needed.
   */
  reset() {
    this.cancel();
    this.#remaining = this.#ms;
  }
}

