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
export function afterRaf(a: Function | string | number, b: Function | string | number | Object, c?: Function | Object, d?: Object): {
    pause(): void;
    resume(): void;
    cancel(): void;
    reset(): void;
    readonly isRunning: boolean;
    readonly isPaused: boolean;
    readonly isFinished: boolean;
};
