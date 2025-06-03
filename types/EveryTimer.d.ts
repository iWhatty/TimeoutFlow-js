/**
 * Repeatedly runs a function every N ms, with optional max count.
 */
export class EveryTimer {
    /**
     * @param {string|number} duration - Delay between calls (e.g., '1s', 200)
     * @param {Function} fn - Function to call each tick
     * @param {number} [max=Infinity] - Max executions
     * @param {boolean} [runImmediately=false] - Run `fn` once before first delay
     */
    constructor(duration: string | number, fn: Function, max?: number, runImmediately?: boolean);
    /**
     * Number of times `fn` has been executed.
     */
    get count(): number;
    /**
     * Whether the timer is actively running.
     */
    get isRunning(): boolean;
    pause(): void;
    resume(): void;
    cancel(): void;
    reset(restart?: boolean): void;
    #private;
}
