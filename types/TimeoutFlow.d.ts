/**
 * Creates a fluent scheduler.
 * Returns a chainable timeline.
 *
 * @param {Object} [options]
 * @param {AbortSignal} [options.signal] - Optional AbortSignal to auto-cancel the flow
 */
export function flow({ signal }?: {
    signal?: AbortSignal | undefined;
}): any;
