// ./raf/throttleRaf.js

import { pendingAbort } from '../abort.js';

/**
 * Throttles a function using `requestAnimationFrame`, with optional frame skipping.
 *
 * Executes at most once every `(frameSkip + 1)` frames.
 *
 * Argument behavior while throttled:
 * - trailing=true  (default): uses the latest args/this seen while waiting
 * - trailing=false: keeps the first args/this and ignores later calls until it fires
 *
 * AbortSignal:
 * - If `signal` is provided, abort will cancel any pending scheduled execution.
 * - Listener is attached only while a call is pending.
 *
 * @template {(...args: any[]) => any} T
 * @param {T} fn - Function to throttle.
 * @param {number|{signal?: AbortSignal, trailing?: boolean}} [frameSkipOrOptions=0]
 * @param {{signal?: AbortSignal, trailing?: boolean}} [maybeOptions]
 * @returns {T & {
 *   cancel: () => void,
 *   flush: () => void
 * }}
 */
export function throttleRaf(fn, frameSkipOrOptions = 0, maybeOptions) {
  if (typeof fn !== 'function') {
    throw new TypeError(`Expected a function, got: ${typeof fn}`);
  }

  const frameSkip = typeof frameSkipOrOptions === 'number' ? frameSkipOrOptions : 0;

  const options =
    typeof frameSkipOrOptions === 'object' && frameSkipOrOptions != null
      ? frameSkipOrOptions
      : maybeOptions ?? {};

  const signal = options?.signal;
  const trailing = options?.trailing ?? true;

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

    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;

    remaining = skip;

    lastArgs = null;
    lastThis = null;

    abort.remove();
  };

  const cancel = () => {
    clearState();
  };

  const abort = pendingAbort(signal, () => cancel());

  const invoke = () => {
    // if canceled, lastArgs is null
    if (!lastArgs) return;

    const args = lastArgs;
    const ctx = lastThis;

    // Clear first to aid GC + prevent re-entrancy oddities
    lastArgs = null;
    lastThis = null;

    abort.remove();
    fn.apply(ctx, args);
  };

  const fire = () => {
    scheduled = false;
    rafId = 0;
    remaining = skip;
    invoke();
  };

  const tickSkip = () => {
    // scheduled might have been canceled since RAF was queued
    if (!scheduled) return;

    if (signal?.aborted) {
      cancel();
      return;
    }

    if (remaining === 0) {
      fire();
      return;
    }

    remaining -= 1;
    rafId = requestAnimationFrame(tickSkip);
  };

  // Fast path for skip === 0
  const tick0 = () => {
    if (!scheduled) return;

    if (signal?.aborted) {
      cancel();
      return;
    }

    fire();
  };

  const schedule =
    skip === 0
      ? () => {
        scheduled = true;
        abort.add();
        rafId = requestAnimationFrame(tick0);
      }
      : () => {
        scheduled = true;
        remaining = skip;
        abort.add();
        rafId = requestAnimationFrame(tickSkip);
      };

  /** @type {any} */
  const throttled = function (...args) {
    if (signal?.aborted) return;

    // While waiting, keep latest args only if trailing=true
    if (!scheduled || trailing) {
      lastArgs = args;
      lastThis = this;
    }

    if (scheduled) return;
    schedule();
  };

  throttled.cancel = cancel;

  throttled.flush = () => {
    if (!scheduled) return;
    if (signal?.aborted) {
      cancel();
      return;
    }

    // Cancel RAF and invoke immediately
    scheduled = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    remaining = skip;

    invoke();
  };

  // If already aborted at creation time, ensure clean slate.
  if (signal?.aborted) cancel();

  return throttled;
}