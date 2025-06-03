/**
 * Base timer class to manage pause/resume/cancel behavior.
 * Not meant to be used directly—subclass for concrete behavior.
 */
export class TimerBase {
    /**
     * @param {string|number} duration - The duration to wait in ms or shorthand format
     */
    constructor(duration: string | number);
    /**
     * Whether the timer is currently running.
     * @returns {boolean}
     */
    get isRunning(): boolean;
    /**
     * Pause the active timer, storing remaining time.
     */
    pause(): void;
    /**
     * Resume the timer using the remaining time.
     * @param {Function} callback - Called when time completes
     * @param {number|null} [overrideDelay] - Optional custom delay in ms
     */
    resume(callback: Function, overrideDelay?: number | null): void;
    /**
     * Cancel the timer immediately.
     */
    cancel(): void;
    /**
     * Reset the timer to its original delay, cancelling if needed.
     */
    reset(): void;
    #private;
}
