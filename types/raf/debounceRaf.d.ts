/**
 * Debounces a function using requestAnimationFrame.
 * - If no duration is passed, triggers on the next frame.
 * - If duration is passed, waits until N ms of inactivity using frame-based timing.
 *
 * @param {string|number|Function} durationOrFn - Duration (e.g., "300ms") or fn directly
 * @param {Function} [callbackFn] - Callback (if duration is passed as first arg)
 * @returns {Function} debounced function
 */
export function debounceRaf(durationOrFn: string | number | Function, callbackFn?: Function): Function;
