// ./src/after.js
import { AfterTimer } from './AfterTimer.js';
import { resolveDelayFnOptions } from './resolveDelayAndFn.js';

/**
 * Schedules a one-time delayed function.
 *
 * Preferred:
 * - after(fn, duration, [options])
 *
 * Also supported (legacy/alt):
 * - after(duration, fn, [options])
 *
 * @param {Function|string|number} a - Function or duration (see overloads)
 * @param {Function|string|number|Object} b - Duration, function, or options
 * @param {Object} [c] - Options
 * @param {Function} [c.onFinish] - Optional callback after `fn` runs
 * @param {AbortSignal} [c.signal] - Optional AbortSignal to auto-cancel
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
export function after(a, b, c) {
  // require explicit duration: defaultDelay = undefined
  const { fn, delay, options } = resolveDelayFnOptions(a, b, c, undefined);
  return new AfterTimer(delay, fn, options);
}