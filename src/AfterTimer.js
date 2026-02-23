// ./src/AfterTimer.js
import { TimerBase } from './TimerBase.js';
import { attachAbort } from './abort.js';

/**
 * Executes a function once after a delay.
 */
export class AfterTimer extends TimerBase {
  /** @type {AbortSignal | null} */
  #signal = null;

  /** @type {(() => void) | null} */
  #onAbort = null;

  /** @type {() => void} */
  #cleanupAbort = () => { };

  /**
   * @param {string|number} duration - Delay before firing (e.g., '1s', 300)
   * @param {Function} fn - Main function to execute
   * @param {Object} [options]
   * @param {Function} [options.onFinish] - Optional callback when done
   * @param {AbortSignal} [options.signal] - Optional AbortSignal to auto-cancel
   */
  constructor(duration, fn, { onFinish, signal } = {}) {
    super(duration);

    this.#signal = signal ?? null;
    this.#onAbort = () => this.cancel();

    this.#attachAbort();

    // If already aborted, #attachAbort() will have canceled us.
    if (this.isFinished) return;

    this.resume(() => {
      this.#cleanupAbortListener();
      fn?.();
      onFinish?.();
    });
  }

  #attachAbort() {
    if (!this.#signal || !this.#onAbort) return;

    // If already aborted, terminate immediately.
    if (this.#signal.aborted) {
      super.cancel();
      this.#cleanupAbortListener();
      return;
    }

    this.#cleanupAbort = attachAbort(this.#signal, this.#onAbort);
  }

  #cleanupAbortListener() {
    this.#cleanupAbort();
    this.#cleanupAbort = () => { };

    // Keep signal reference so reset() can reattach.
    this.#onAbort = null;
  }

  cancel() {
    if (this.isFinished) return;

    // Remove listener first to avoid keeping instance alive.
    this.#cleanupAbortListener();

    super.cancel();
  }

  reset() {
    // Preserve AbortSignal semantics.
    this.#cleanupAbort();
    this.#cleanupAbort = () => { };
    this.#onAbort = () => this.cancel();

    super.reset();
    this.#attachAbort();
  }
}