// ./raf/afterRaf.js
import { parseDuration } from '../parseDuration.js';
import { attachAbort } from '../abort.js';

/**
 * Schedules a one-time delayed function using requestAnimationFrame.
 *
 * Timing model:
 * - Uses frame timestamps for progression.
 * - Paused time does NOT count toward elapsed time (pause freezes remaining).
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
 *   reset(): void,
 *   readonly isRunning: boolean,
 *   readonly isPaused: boolean,
 *   readonly isFinished: boolean
 * }}
 */
export function afterRaf(duration, fn, onFinish, { signal } = {}) {
  const totalMs = parseDuration(duration);

  let rafId = 0;

  // remaining time until fire (pause-safe)
  let remaining = totalMs;

  // start timestamp for the current running segment
  let segmentStart = null; // number | null

  let running = false;
  let paused = false;
  let finished = false;

  const cancelFrame = () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  };

  // Will be replaced by attachAbort() if signal is provided.
  let cleanupAbort = () => { };

  function finish() {
    cancelFrame();
    running = false;
    paused = false;
    finished = true;
    segmentStart = null;
    remaining = 0;
    cleanupAbort();
  }

  function cancel() {
    if (finished) return;
    finish();
  }

  // Attach abort once for this run.
  // (Matches existing behavior: reset() does not reattach.)
  cleanupAbort = attachAbort(signal, cancel);

  const tick = (ts) => {
    if (!running || finished) return;

    if (segmentStart == null) segmentStart = ts;

    const elapsed = ts - segmentStart;

    if (elapsed >= remaining) {
      finish();
      fn?.();
      onFinish?.();
      return;
    }

    rafId = requestAnimationFrame(tick);
  };

  const pause = () => {
    if (!running || finished) return;

    cancelFrame();

    // Freeze remaining based on how long we ran in this segment
    const now = performance.now();
    if (segmentStart != null) {
      const elapsed = now - segmentStart;
      remaining = Math.max(0, remaining - elapsed);
    }

    segmentStart = null;
    running = false;
    paused = true;
  };

  const resume = () => {
    if (finished || running || !paused) return;
    if (signal?.aborted) return;

    // If nothing remains, finish synchronously
    if (!(remaining > 0)) {
      finish();
      fn?.();
      onFinish?.();
      return;
    }

    paused = false;
    running = true;
    segmentStart = null; // will be set on first tick
    rafId = requestAnimationFrame(tick);
  };

  const reset = () => {
    cancelFrame();

    segmentStart = null;
    remaining = totalMs;

    running = false;
    paused = false;
    finished = false;

    // Keep the same AbortSignal semantics:
    // if the signal is already aborted, remain terminal.
    if (signal?.aborted) {
      finished = true;
      remaining = 0;
      cleanupAbort(); // no-op if nothing attached
    }
  };

  // Start immediately unless already aborted/finished
  if (!finished) {
    // Support 0ms: fire on next frame (consistent with RAF timing)
    if (!(remaining > 0)) {
      finish();
      fn?.();
      onFinish?.();
    } else {
      running = true;
      rafId = requestAnimationFrame(tick);
    }
  } else {
    cleanupAbort();
  }

  return {
    pause,
    resume,
    cancel,
    reset,
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