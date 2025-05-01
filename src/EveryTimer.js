// ./src/EveryTimer.js
import { TimerBase } from './TimerBase.js';
import { parseDuration } from './parseDuration.js';

/**
 * Repeatedly runs a function every N ms, with optional max count.
 */
export class EveryTimer {
  #interval;
  #fn;
  #max;
  #count = 0;
  #running = false;
  #controller = null;

  /**
   * @param {string|number} duration - Delay between calls (e.g., '1s', 200)
   * @param {Function} fn - Function to call each tick
   * @param {number} [max=Infinity] - Max executions
   * @param {boolean} [runImmediately=false] - Run `fn` once before first delay
   */
  constructor(duration, fn, max = Infinity, runImmediately = false) {
    this.#interval = parseDuration(duration);
    this.#fn = fn;
    this.#max = max;

    if (runImmediately) {
      this.#tick();
    } else {
      this.#schedule();
    }
  }

  /**
   * Number of times `fn` has been executed.
   */
  get count() {
    return this.#count;
  }

  /**
   * Whether the timer is actively running.
   */
  get isRunning() {
    return this.#running;
  }

  #tick = () => {
    if (this.#count >= this.#max) {
      this.cancel();
      return;
    }

    this.#fn?.(this.#count++);
    this.#schedule();
  };

  #schedule() {
    this.#controller = new TimerBase(this.#interval);
    this.#running = true;
    this.#controller.resume(this.#tick);
  }

  pause() {
    this.#controller?.pause();
    this.#running = false;
  }

  resume() {
    if (!this.#running && this.#count < this.#max) {
      this.#controller?.resume(this.#tick);
      this.#running = true;
    }
  }

  cancel() {
    this.#controller?.cancel();
    this.#running = false;
  }

  reset(restart = false) {
    this.cancel();
    this.#count = 0;
    if (restart) this.#schedule();
  }
}


