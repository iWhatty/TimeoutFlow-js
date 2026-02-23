/**
 * Repeats a function every N milliseconds using requestAnimationFrame.
 *
 * Preferred:
 * - everyRaf(fn, duration, [options])
 *
 * Also supported (legacy):
 * - everyRaf(duration, fn, [maxTimes], [runImmediately], [options])
 *
 * Timing model:
 * - Counts down using frame deltas.
 * - Paused time does NOT count (pause freezes remaining-to-next-tick).
 * - On large frame gaps, may "catch up" by running multiple ticks in one frame,
 *   but will never exceed max.
 *
 * @param {Function|string|number} a
 * @param {Function|string|number|Object} b
 * @param {number|boolean|Object} [c] - legacy maxTimes OR legacy runImmediately OR options
 * @param {boolean|Object} [d] - legacy runImmediately OR options
 * @param {Object} [e] - legacy options
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
export function everyRaf(a: Function | string | number, b: Function | string | number | Object, c?: number | boolean | Object, d?: boolean | Object, e?: Object): {
    pause(): void;
    resume(): void;
    cancel(): void;
    reset(restart?: boolean): void;
    readonly isRunning: boolean;
    readonly isPaused: boolean;
    readonly isFinished: boolean;
    readonly count: number;
};
