/**
 * Executes a function once after a delay.
 */
export class AfterTimer extends TimerBase {
    /**
     * @param {string|number} duration - Delay before firing (e.g., '1s', 300)
     * @param {Function} fn - Main function to execute
     * @param {Object} [options]
     * @param {Function} [options.onFinish] - Optional callback when done
     * @param {AbortSignal} [options.signal] - Optional AbortSignal to auto-cancel
     */
    constructor(duration: string | number, fn: Function, { onFinish, signal }?: {
        onFinish?: Function | undefined;
        signal?: AbortSignal | undefined;
    });
    #private;
}
import { TimerBase } from './TimerBase.js';
