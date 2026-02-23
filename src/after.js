// ./src/after.js
import { parseDuration } from './parseDuration.js';
import { AfterTimer } from './AfterTimer.js';
import { attachAbort } from './abort.js';

/**
 * Schedules a one-time delayed function.
 *
 * @param {string|number} duration - e.g. '1s', 500, '2m'
 * @param {Function} fn - Main function to run
 * @param {Function} [onFinish] - Optional post-run callback
 * @param {Object} [options]
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
export function after(duration, fn, onFinish, options) {
  return new AfterTimer(duration, fn, onFinish, options);
}

/**
 * @deprecated Prefer `after()` (TimerBase-backed, pause-safe, perf.now-based).
 * Legacy reference implementation using setTimeout directly.
 *
 * @param {string|number} duration - e.g. "5s", "500ms", "2m"
 * @param {Function} fn - callback to run
 * @param {Function} [onFinish] - Optional callback after running
 * @param {Object} [options]
 * @param {AbortSignal} [options.signal] - Optional AbortSignal to auto-cancel
 * @returns {{
 *   pause(): void,
 *   resume(): void,
 *   cancel(): void,
 *   readonly isRunning: boolean,
 *   readonly isPaused: boolean,
 *   readonly isFinished: boolean
 * }}
 */
export function _after(duration, fn, onFinish, { signal } = {}) {
  const ms = parseDuration(duration);

  let timeoutId = null;

  let startTime = null; // perf.now
  let remaining = ms;

  let running = false;
  let paused = false;
  let finished = false;

  const cancelTimeout = () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = null;
  };

  // attachAbort() cleanup (no-op if no signal / not attached)
  let cleanupAbort = () => { };

  const cancel = () => {
    if (finished) return;

    cancelTimeout();
    running = false;
    paused = false;
    finished = true;
    remaining = 0;
    cleanupAbort();
  };

  // Abort wiring (preserve existing semantics: if already aborted, just finish)
  if (signal?.aborted) {
    finished = true;
  } else {
    cleanupAbort = attachAbort(signal, cancel);
  }

  const schedule = () => {
    startTime = performance.now();
    running = true;
    paused = false;

    timeoutId = setTimeout(() => {
      cancelTimeout();
      running = false;
      paused = false;
      finished = true;
      remaining = 0;
      cleanupAbort();
      fn?.();
      onFinish?.();
    }, remaining);
  };

  const pause = () => {
    if (!running || finished) return;

    cancelTimeout();

    const elapsed = performance.now() - startTime;
    remaining = Math.max(0, remaining - elapsed);

    running = false;
    paused = true;
  };

  const resume = () => {
    if (finished || running || !paused) return;
    if (signal?.aborted) return;
    if (!(remaining > 0)) return;
    schedule();
  };

  // start immediately unless aborted
  if (!finished) schedule();
  else cleanupAbort();

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