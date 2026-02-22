// ./raf/waitForRaf.js
import { parseDuration } from '../parseDuration.js';

/**
 * Waits for a condition to return truthy, polling each frame.
 * - Ideal for visual state: DOM settling, visibility, layout changes.
 * - Respects tab inactivity (pause-safe).
 *
 * @param {Function} condition - Function returning truthy when complete
 * @param {Object} [options]
 * @param {string|number} [options.timeout] - Optional max time to wait
 * @param {AbortSignal} [options.signal] - Optional AbortSignal to cancel waiting
 * @param {boolean} [options.immediate=false] - If true, evaluate condition immediately before first frame
 * @returns {Promise<void>} Resolves when condition is met, rejects on timeout/abort
 */
export function waitForRaf(
  condition,
  { timeout, signal, immediate = false } = {}
) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const start = performance.now();
    const timeoutMs = timeout != null ? parseDuration(timeout) : null;

    let rafId = 0;

    const onAbort = () => {
      cleanup();
      reject(new DOMException('Aborted', 'AbortError'));
    };

    const removeAbortListener = () => {
      signal?.removeEventListener('abort', onAbort);
    };

    const cleanup = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      removeAbortListener();
    };

    if (signal) signal.addEventListener('abort', onAbort, { once: true });

    const evaluateCondition = () => {
      try {
        return !!condition();
      } catch (err) {
        cleanup();
        reject(err);
        return null;
      }
    };

    // Optional immediate evaluation
    if (immediate) {
      const ok = evaluateCondition();
      if (ok === null) return;
      if (ok) {
        cleanup();
        resolve();
        return;
      }
    }

    const tick = (timestamp) => {
      const ok = evaluateCondition();
      if (ok === null) return;

      if (ok) {
        cleanup();
        resolve();
        return;
      }

      if (timeoutMs != null && timestamp - start >= timeoutMs) {
        cleanup();
        reject(new Error('waitForRaf timed out'));
        return;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
  });
}