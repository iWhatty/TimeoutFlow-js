/**
 * Resolves flexible (fn, delay) or (delay, fn) inputs.
 *
 * NOTE: This helper is intentionally strict:
 * - It requires an explicit delay (2-arg form).
 * - Use `resolveDelayFnOptions()` for overloads that allow `(fn, options)` or default delays.
 *
 * @param {Function|string|number} a - function or duration
 * @param {Function|string|number} b - function or duration
 * @returns {{ fn: Function, delay: number }}
 */
export function resolveDelayAndFn(a: Function | string | number, b: Function | string | number): {
    fn: Function;
    delay: number;
};
/**
 * Resolves flexible overloads and returns `{ fn, delay, options }`.
 *
 * Supported forms:
 * - (fn, delay, [options])
 * - (delay, fn, [options])
 * - (fn, [options])               // delay defaults
 *
 * This is intentionally strict about what counts as "options" to avoid
 * treating random values as configuration.
 *
 * @template {Record<string, any>} O
 * @param {Function|string|number} a
 * @param {Function|string|number|O} b
 * @param {O} [c]
 * @param {string|number} [defaultDelay=0]
 * @returns {{ fn: Function, delay: number, options: O }}
 */
export function resolveDelayFnOptions<O extends Record<string, any>>(a: Function | string | number, b: Function | string | number | O, c?: O, defaultDelay?: string | number): {
    fn: Function;
    delay: number;
    options: O;
};
