// ./raf/afterRaf.js

import { parseDuration } from '../parseDuration.js';

/**
 * Schedules a one-time delayed function using requestAnimationFrame.
 *
 * @param {string|number} duration - e.g. "5s", "500ms", 2000
 * @param {Function} fn - callback to run
 * @param {Function} [onFinish] - optional callback after finishing
 * @param {Object} [options]
 * @param {AbortSignal} [options.signal] - optional AbortSignal to auto-cancel
 * @returns {{
 *   pause(): void,
 *   resume(): void,
 *   cancel(): void,
 *   readonly isRunning: boolean,
 *   readonly isPaused: boolean,
 *   readonly isFinished: boolean
 * }}
 */
export function afterRaf(duration, fn, onFinish, { signal } = {}) {
  const ms = typeof duration === 'string' ? parseDuration(duration) : duration;

  let handle = 0;

  let startTime = null;
  let pausedAt = null;
  let elapsedPaused = 0;

  let running = false;
  let paused = false;
  let finished = false;

  const cancelFrame = () => {
    if (handle) cancelAnimationFrame(handle);
    handle = 0;
  };

  const removeAbortListener = () => {
    signal?.removeEventListener('abort', onAbort);
  };

  const stop = () => {
    cancelFrame();
    running = false;
    paused = false;
    finished = true;
    pausedAt = null;
    removeAbortListener();
  };

  const onAbort = () => {
    cancel();
  };

  if (signal) {
    if (signal.aborted) {
      finished = true;
    } else {
      signal.addEventListener('abort', onAbort, { once: true });
    }
  }

  const tick = (timestamp) => {
    if (!running || finished) return;

    if (startTime == null) startTime = timestamp;

    const elapsed = timestamp - startTime + elapsedPaused;

    if (elapsed >= ms) {
      stop();
      fn?.();
      onFinish?.();
      return;
    }

    handle = requestAnimationFrame(tick);
  };

  const pause = () => {
    if (!running || finished) return;
    cancelFrame();
    pausedAt = performance.now();
    running = false;
    paused = true;
  };

  const resume = () => {
    if (finished || running || !paused) return;
    if (signal?.aborted) return;

    elapsedPaused += performance.now() - pausedAt;
    pausedAt = null;

    paused = false;
    running = true;
    handle = requestAnimationFrame(tick);
  };

  const cancel = () => {
    if (finished) return;
    stop();
  };

  // Start immediately unless already aborted
  if (!finished) {
    running = true;
    handle = requestAnimationFrame(tick);
  } else {
    removeAbortListener();
  }

  return {
    pause,
    resume,
    cancel,
    get isRunning() {
      return running;
    },
    get isPaused() {
      return paused;
    },
    get isFinished() {
      return finished;
    },
  };
}