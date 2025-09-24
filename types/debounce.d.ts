/**
 * @typedef {((...args: any[]) => void) & { cancel: () => void }} DebouncedFunction
 */
/**
 * Creates a debounced function that delays invoking `fn` until after `delay` ms.
 *
 * @param {string|number|Function} a - Delay in ms or the function to debounce.
 * @param {string|number|Function} [b] - The function to debounce, if delay is first
 * @returns {DebouncedFunction} A debounced function with `.cancel()`
 */
export function debounce(a: string | number | Function, b?: string | number | Function): DebouncedFunction;
export type DebouncedFunction = ((...args: any[]) => void) & {
    cancel: () => void;
};
