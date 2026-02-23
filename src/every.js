// ./src/every.js
import { EveryTimer } from './EveryTimer.js';
import { resolveDelayFnOptions } from './resolveDelayAndFn.js';

/**
 * Runs a function every N ms with optional execution limit.
 *
 * Preferred:
 * - every(fn, duration, [options])
 *
 * Also supported (legacy/alt):
 * - every(duration, fn, [options])
 *
 * @param {Function|string|number} a - Function or duration (see overloads)
 * @param {Function|string|number|Object} b - Duration, function, or options
 * @param {Object} [c] - Options
 * @param {number} [c.max=Infinity] - Max times to run
 * @param {boolean} [c.runImmediately=false] - Run immediately on first tick
 * @param {AbortSignal} [c.signal] - Optional AbortSignal to auto-cancel
 * @returns {{
*   pause(): void,
*   resume(): void,
*   cancel(): void,
*   reset(restart?: boolean): void,
*   readonly isRunning: boolean,
*   readonly isPaused: boolean,
*   readonly isFinished: boolean,
*   readonly count: number
* }}
*/
export function every(a, b, c) {
    // require explicit duration: defaultDelay = undefined
    const { fn, delay, options } = resolveDelayFnOptions(a, b, c, undefined);
    return new EveryTimer(delay, fn, options);
}