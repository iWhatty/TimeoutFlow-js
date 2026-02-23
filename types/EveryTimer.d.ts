/**
 * Repeatedly runs a function every N ms, with optional max count.
 */
export class EveryTimer {
    /**
     * @param {string|number} duration - Delay between calls (e.g., '1s', 200)
     * @param {Function} fn - Function to call each tick
     * @param {Object} [options]
     * @param {number} [options.max=Infinity] - Max executions
     * @param {boolean} [options.runImmediately=false] - Run `fn` once before first delay
     * @param {AbortSignal} [options.signal] - Optional AbortSignal to auto-cancel
     */
    constructor(duration: string | number, fn: Function, { max, runImmediately, signal }?: {
        max?: number | undefined;
        runImmediately?: boolean | undefined;
        signal?: AbortSignal | undefined;
    });
    /**
     * Number of times `fn` has been executed.
     */
    get count(): number;
    /**
     * Whether the timer is actively running (waiting for next tick).
     *
     * Note: during the brief moment between a tick firing and the next schedule,
     * this may be false — which reflects "no countdown currently pending".
     */
    get isRunning(): boolean;
    /**
     * Whether the timer is paused (resumable).
     */
    get isPaused(): boolean;
    /**
     * Whether the timer has finished (hit max) or been canceled (terminal).
     */
    get isFinished(): boolean;
    pause(): void;
    resume(): void;
    cancel(): void;
    reset(restart?: boolean): void;
    #private;
}
