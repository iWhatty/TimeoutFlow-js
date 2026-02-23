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
  #cleanupAbort = () => {};

  /**
   * @param {string|number} duration - Delay before firing (e.g., '1s', 300)
   * @param {Function} fn - Main function to execute
   * @param {Function} [onFinish] - Optional callback when done
   * @param {Object} [options]
   * @param {AbortSignal} [options.signal] - Optional AbortSignal to auto-cancel
   */
  constructor(duration, fn, onFinish, { signal } = {}) {
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

    // Avoid re-entrancy hazards: if already aborted, do terminal cancel here.
    if (this.#signal.aborted) {
      super.cancel(); // terminal (TimerBase sets isFinished)
      this.#cleanupAbortListener();
      return;
    }

    this.#cleanupAbort = attachAbort(this.#signal, this.#onAbort);
  }

  #cleanupAbortListener() {
    // Always safe to call (defaults to no-op)
    this.#cleanupAbort();
    this.#cleanupAbort = () => {};

    // Keep #signal reference so reset() can reattach; only drop handler.
    this.#onAbort = null;
  }

  cancel() {
    if (this.isFinished) return;

    // remove listener first to avoid keeping instance alive
    this.#cleanupAbortListener();

    super.cancel();
  }

  reset() {
    // Reset should preserve the AbortSignal contract if one was provided.
    this.#cleanupAbort();
    this.#cleanupAbort = () => {};
    this.#onAbort = () => this.cancel();

    super.reset();
    this.#attachAbort();

    // If signal was already aborted, remain terminal (super.cancel in attach)
  }
}