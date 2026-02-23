// ./raf/afterRaf.js
import { resolveDelayFnOptions } from '../resolveDelayAndFn.js';
import { attachAbort } from '../abort.js';
import { now } from '../now.js';

/**
 * Schedules a one-time delayed function using requestAnimationFrame.
 *
 * Preferred:
 * - afterRaf(fn, duration, [options])
 *
 * Also supported (legacy):
 * - afterRaf(duration, fn, [onFinish], [options])
 *
 * Timing model:
 * - Uses frame timestamps for progression.
 * - Paused time does NOT count toward elapsed time (pause freezes remaining).
 *
 * @param {Function|string|number} a
 * @param {Function|string|number|Object} b
 * @param {Function|Object} [c] - legacy onFinish OR options
 * @param {Object} [d] - legacy options (when using 4 args)
 * @param {Function} [c.onFinish] - optional callback after finishing (preferred: in options)
 * @param {AbortSignal} [c.signal] - optional AbortSignal to auto-cancel
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
export function afterRaf(a, b, c, d) {
  const legacyOnFinish = typeof c === 'function' ? c : undefined;
  const maybeOptions = legacyOnFinish ? d : c;

  // Require explicit duration: defaultDelay = undefined
  const { fn, delay, options } = resolveDelayFnOptions(a, b, maybeOptions, undefined);

  const { signal, onFinish } = legacyOnFinish
    ? { ...options, onFinish: legacyOnFinish }
    : options;

  const totalMs = Math.max(0, delay);

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

  let cleanupAbort = () => { };

  const cleanupAbortListener = () => {
    cleanupAbort();
    cleanupAbort = () => { };
  };

  const finish = () => {
    cancelFrame();
    running = false;
    paused = false;
    finished = true;
    segmentStart = null;
    remaining = 0;
    cleanupAbortListener();
  };

  const execFinish = () => {
    finish();
    fn?.();
    onFinish?.();
  };

  const cancel = () => {
    if (finished) return;
    finish();
  };

  const attachAbortListener = () => {
    cleanupAbortListener();

    // Preserve semantics: if already aborted, become terminal.
    if (signal?.aborted) {
      finished = true;
      remaining = 0;
      return;
    }

    cleanupAbort = attachAbort(signal, cancel);
  };

  // Attach abort for the lifetime of this timer instance
  attachAbortListener();

  const tick = (ts) => {
    if (!running || finished) return;

    if (segmentStart == null) segmentStart = ts;

    const elapsed = ts - segmentStart;

    if (elapsed >= remaining) {
      execFinish();
      return;
    }

    rafId = requestAnimationFrame(tick);
  };

  const pause = () => {
    if (!running || finished) return;

    cancelFrame();

    // Freeze remaining based on how long we ran in this segment
    const currentTime = now();
    if (segmentStart != null) {
      const elapsed = currentTime - segmentStart;
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
      execFinish();
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

    // Re-attach abort on reset (more consistent with non-RAF timers)
    attachAbortListener();

    if (finished) {
      // signal was aborted during attachAbortListener()
      return;
    }
  };

  // Start immediately unless already aborted/finished
  if (!finished) {
    // Support 0ms: fire on next frame (consistent with RAF timing)
    if (!(remaining > 0)) {
      execFinish();
    } else {
      running = true;
      rafId = requestAnimationFrame(tick);
    }
  } else {
    cleanupAbortListener();
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