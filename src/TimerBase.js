import { parseDuration } from './parseDuration.js';

export class TimerBase {
  #ms;
  #startTime = null;
  #remaining = 0;
  #timer = null;
  #running = false;

  constructor(duration) {
    this.#ms = parseDuration(duration);
    this.#remaining = this.#ms;
  }

  get isRunning() {
    return this.#running;
  }

  pause() {
    if (this.#running) {
      clearTimeout(this.#timer);
      this.#remaining -= Date.now() - this.#startTime;
      this.#running = false;
    }
  }

  resume(callback, delayOverride = null) {
    if (!this.#running && this.#remaining > 0) {
      this.#startTime = Date.now();
      this.#running = true;
      this.#timer = setTimeout(() => {
        this.#running = false;
        callback?.();
      }, delayOverride ?? this.#remaining);
    }
  }

  cancel() {
    clearTimeout(this.#timer);
    this.#running = false;
    this.#timer = null;
  }

  reset() {
    this.cancel();
    this.#remaining = this.#ms;
  }
}
