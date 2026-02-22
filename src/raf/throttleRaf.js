// ./raf/throttleRaf.js

/**
 * Throttles a function using `requestAnimationFrame`, with optional frame skipping.
 *
 * Ensures the wrapped function executes at most once every `(frameSkip + 1)` frames.
 * Only the most recent arguments are used when the function finally runs.
 *
 * Frame behavior:
 * - `frameSkip = 0` → runs on the next animation frame
 * - `frameSkip = 1` → runs every 2nd frame
 * - `frameSkip = 2` → runs every 3rd frame
 * - etc.
 *
 * The returned function includes lifecycle controls:
 * - `.cancel()` → Cancels any pending scheduled execution and clears internal state.
 * - `.flush()` → Immediately executes the pending call (if scheduled) and resets state.
 *
 * Important characteristics:
 * - Preserves `this` context.
 * - Only the latest call’s arguments are applied.
 * - Safe to call `cancel()` multiple times.
 * - After `cancel()`, no trailing invocation will occur.
 *
 * @template {(...args: any[]) => any} T
 * @param {T} fn - Function to throttle.
 * @param {number} [frameSkip=0] - Number of animation frames to skip between executions.
 *
 * @returns {T & {
*   cancel: () => void,
*   flush: () => void
* }} A throttled function augmented with `.cancel()` and `.flush()` methods.
*/
export function throttleRaf(fn, frameSkip = 0) {
  // Normalize once: int >= 0
  const skip = Math.max(0, frameSkip | 0);

  let scheduled = false;
  let rafId = 0;

  /** @type {any[] | null} */
  let lastArgs = null;
  /** @type {any | null} */
  let lastThis = null;

  // countdown for skip-path only
  let remaining = skip;

  const clearState = () => {
    scheduled = false;
    rafId = 0;
    remaining = skip;
    lastArgs = null;
    lastThis = null;
  };

  const cancel = () => {
    if (rafId) cancelAnimationFrame(rafId);
    clearState();
  };

  const invoke = () => {
    // if canceled, lastArgs is null
    if (!lastArgs) return;
    fn.apply(lastThis, lastArgs);

    // Clear references to prevent stale invocations and aid GC.
    lastArgs = null;
    lastThis = null;
  };

  const tickSkip = () => {
    // scheduled might have been canceled since RAF was queued
    if (!scheduled) return;

    if (remaining === 0) {
      scheduled = false;
      rafId = 0;
      remaining = skip;

      invoke();
      return;
    }

    remaining -= 1;
    rafId = requestAnimationFrame(tickSkip);
  };

  // Fast path for skip === 0
  const tick0 = () => {
    // scheduled might have been canceled since RAF was queued
    if (!scheduled) return;

    scheduled = false;
    rafId = 0;
    remaining = skip; // keep consistent state (skip is 0 here)

    invoke();
  };

  const schedule =
    skip === 0
      ? () => {
        scheduled = true;
        rafId = requestAnimationFrame(tick0);
      }
      : () => {
        scheduled = true;
        remaining = skip;
        rafId = requestAnimationFrame(tickSkip);
      };

  /** @type {any} */
  const throttled = function (...args) {
    lastArgs = args;
    lastThis = this;

    if (scheduled) return;
    schedule();
  };

  throttled.cancel = cancel;

  throttled.flush = () => {
    if (!scheduled) return;

    scheduled = false;

    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    remaining = skip;

    invoke();
  };

  return throttled;
}