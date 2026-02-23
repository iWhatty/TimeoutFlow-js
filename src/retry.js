// ./src/retry.js
import { parseDuration } from './parseDuration.js';
import { attachAbort, createAbortError } from './abort.js';

/**
 * Retries a promise-returning function with delays.
 *
 * @param {(attemptIndex: number) => Promise<any>} fn - async function
 * @param {Object} [options]
 * @param {number} [options.attempts=3] - total attempts (including the first)
 * @param {string|number} [options.delay='500ms'] - base delay between retries
 * @param {boolean} [options.backoff=false] - exponential backoff if true
 * @param {number} [options.factor=2] - backoff multiplier (only if backoff=true)
 * @param {string|number} [options.maxDelay] - clamp delay to this max
 * @param {boolean|'full'|'equal'|'decorrelated'} [options.jitter=false] - jitter strategy
 * @param {AbortSignal} [options.signal] - optional AbortSignal to cancel retries
 * @param {() => number} [options.random=Math.random] - injectable RNG for tests
 * @param {(err: any, attempt: number) => boolean | Promise<boolean>} [options.shouldRetry]
 *        Predicate deciding whether to retry after a failure.
 * @param {(err: any, attempt: number, delayMs: number) => void | Promise<void>} [options.onRetry]
 *        Hook invoked after deciding to retry and before waiting.
 * @returns {Promise<any>}
 */
export async function retry(
  fn,
  {
    attempts = 3,
    delay = '500ms',
    backoff = false,
    factor = 2,
    maxDelay,
    jitter = false,
    signal,
    random = Math.random,
    shouldRetry,
    onRetry,
  } = {}
) {
  if (typeof fn !== 'function') throw new TypeError('retry: fn must be a function');

  const totalAttempts = Math.max(1, attempts | 0);

  if (signal?.aborted) throw createAbortError();

  const baseDelay = parseDuration(delay);
  const maxDelayMs = maxDelay != null ? parseDuration(maxDelay) : Infinity;

  // decorrelated jitter needs to remember prior sleep
  let prevSleep = Math.min(baseDelay, maxDelayMs);

  for (let attempt = 0; attempt < totalAttempts; attempt++) {
    if (signal?.aborted) throw createAbortError();

    try {
      return await fn(attempt);
    } catch (err) {
      const lastAttempt = attempt === totalAttempts - 1;
      if (lastAttempt) throw err;

      // Decide if we should retry
      if (shouldRetry) {
        const ok = await shouldRetry(err, attempt);
        if (!ok) throw err;
      }

      const expDelay = backoff ? baseDelay * Math.pow(factor, attempt) : baseDelay;

      const sleep = computeSleep({
        expDelay,
        baseDelay,
        maxDelayMs,
        jitter,
        random,
        prevSleep,
      });

      prevSleep = sleep;

      // Notify caller we're retrying (before waiting)
      if (onRetry) {
        await onRetry(err, attempt, sleep);
      }

      await waitWithAbort(sleep, signal);
    }
  }

  // Unreachable, but keeps type checkers happy.
  // eslint-disable-next-line no-throw-literal
  throw new Error('retry: exhausted attempts unexpectedly');
}

/**
 * Compute retry sleep with optional backoff clamp + jitter.
 *
 * Jitter strategies:
 * - false: no jitter
 * - 'full':     random(0, cap)
 * - 'equal':    cap/2 + random(0, cap/2)
 * - 'decorrelated': random(baseDelay, prevSleep*3) (clamped)
 */
function computeSleep({ expDelay, baseDelay, maxDelayMs, jitter, random, prevSleep }) {
  const cap = Math.min(expDelay, maxDelayMs);

  if (!jitter) return cap;

  const mode = jitter === true ? 'full' : jitter;

  if (mode === 'full') {
    return Math.min(maxDelayMs, randBetween(0, cap, random));
  }

  if (mode === 'equal') {
    const half = cap / 2;
    return Math.min(maxDelayMs, half + randBetween(0, half, random));
  }

  if (mode === 'decorrelated') {
    const next = randBetween(baseDelay, prevSleep * 3, random);
    return Math.min(maxDelayMs, next);
  }

  // Unknown mode -> treat as no jitter (safe fallback)
  return cap;
}

function randBetween(min, max, random) {
  const r = random();
  const t = Number.isFinite(r) ? Math.min(1, Math.max(0, r)) : 0;
  return min + (max - min) * t;
}

/**
 * Wait helper that supports AbortSignal.
 * Rejects with AbortError if aborted during delay.
 */
function waitWithAbort(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(createAbortError());
      return;
    }

    let timeoutId = 0;

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = 0;
      cleanupAbort();
    };

    const onAbort = () => {
      cleanup();
      reject(createAbortError());
    };

    const cleanupAbort = attachAbort(signal, onAbort);

    timeoutId = setTimeout(() => {
      cleanup();
      resolve();
    }, ms);
  });
}