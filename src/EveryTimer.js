// ./src/EveryTimer.js
import { TimerBase } from './TimerBase.js';
import { parseDuration } from './parseDuration.js';
import { attachAbort } from './abort.js';

/**
 * Repeatedly runs a function every N ms, with optional max count.
 */
export class EveryTimer {
  #interval;
  #fn;
  #max;

  #count = 0;
  #finished = false;

  /** @type {TimerBase | null} */
  #controller = null;

  /** @type {AbortSignal | null} */
  #signal = null;

  /** @type {() => void} */
  #cleanupAbort = () => { };

  /**
   * @param {string|number} duration - Delay between calls (e.g., '1s', 200)
   * @param {Function} fn - Function to call each tick
   * @param {number} [max=Infinity] - Max executions
   * @param {boolean} [runImmediately=false] - Run `fn` once before first delay
   * @param {Object} [options]
   * @param {AbortSignal} [options.signal] - Optional AbortSignal to auto-cancel
   */
  constructor(duration, fn, max = Infinity, runImmediately = false, { signal } = {}) {
    this.#interval = parseDuration(duration);
    this.#fn = fn;
    this.#max = max;

    this.#signal = signal ?? null;

    // If max is already satisfied, finish immediately.
    if (!(this.#max > 0) && this.#max !== Infinity) {
      this.#finished = true;
      this.#cleanupAbort();
      return;
    }

    // Abort semantics: if already aborted, immediately finish (terminal).
    if (this.#signal?.aborted) {
      this.#finished = true;
      this.#cleanupAbort();
      return;
    }

    // Attach abort listener for the lifetime of this timer.
    // (Cleanup happens in #finish().)
    this.#cleanupAbort = attachAbort(this.#signal, () => this.cancel());

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
   * Whether the timer is actively running (waiting for next tick).
   *
   * Note: during the brief moment between a tick firing and the next schedule,
   * this may be false — which reflects "no countdown currently pending".
   */
  get isRunning() {
    return !this.#finished && !!this.#controller && this.#controller.isRunning;
  }

  /**
   * Whether the timer is paused (resumable).
   */
  get isPaused() {
    return !this.#finished && !!this.#controller && this.#controller.isPaused;
  }

  /**
   * Whether the timer has finished (hit max) or been canceled (terminal).
   */
  get isFinished() {
    return this.#finished;
  }

  #finish = () => {
    this.#controller?.cancel();
    this.#controller = null;

    this.#finished = true;

    this.#cleanupAbort();
    this.#cleanupAbort = () => { };
    this.#signal = null;
  };

  #tick = () => {
    if (this.#finished) return;

    if (this.#signal?.aborted) {
      this.#finish();
      return;
    }

    if (this.#count >= this.#max) {
      this.#finish();
      return;
    }

    this.#fn?.(this.#count++);
    if (this.#count >= this.#max) {
      this.#finish();
      return;
    }

    this.#schedule();
  };

  #schedule() {
    if (this.#finished) return;

    if (this.#signal?.aborted) {
      this.#finish();
      return;
    }

    // Fresh controller per interval window
    this.#controller = new TimerBase(this.#interval);
    this.#controller.resume(this.#tick);
  }

  pause() {
    if (this.#finished) return;
    this.#controller?.pause();
  }

  resume() {
    if (this.#finished) return;

    if (this.#signal?.aborted) {
      this.#finish();
      return;
    }

    if (this.#count >= this.#max) {
      this.#finish();
      return;
    }

    // Resume existing countdown if paused, otherwise schedule fresh.
    if (this.#controller) {
      if (this.#controller.isPaused) {
        this.#controller.resume(this.#tick);
      } else if (!this.#controller.isRunning) {
        // Controller exists but isn't active (edge); schedule next window
        this.#schedule();
      }
      return;
    }

    this.#schedule();
  }

  cancel() {
    if (this.#finished) return;
    this.#finish();
  }

  reset(restart = false) {
    // Reset is not terminal; keep signal semantics:
    // - If signal exists and is aborted, reset should leave the timer finished.
    this.#controller?.cancel();
    this.#controller = null;

    this.#count = 0;
    this.#finished = false;

    if (this.#signal?.aborted) {
      this.#finished = true;
      this.#cleanupAbort();
      this.#cleanupAbort = () => { };
      this.#signal = null;
      return;
    }

    if (restart) {
      // If max is zero-ish, immediately finish (consistent with constructor)
      if (!(this.#max > 0) && this.#max !== Infinity) {
        this.#finished = true;
        this.#cleanupAbort();
        this.#cleanupAbort = () => { };
        this.#signal = null;
        return;
      }
      this.#schedule();
    }
  }
}