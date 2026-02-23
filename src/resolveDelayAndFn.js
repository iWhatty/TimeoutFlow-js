// ./src/resolveDelayAndFn.js
import { parseDuration } from './parseDuration.js';

const isPlainOptions = (v) => v != null && typeof v === 'object' && !Array.isArray(v);

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
export function resolveDelayAndFn(a, b) {
  // Keep legacy semantics but delegate parsing/validation.
  const { fn, delay } = resolveDelayFnOptions(a, b, undefined, undefined);

  // If someone called resolveDelayAndFn(fn) by mistake, throw a clearer error.
  // (parseDuration(undefined) would be a confusing failure mode.)
  if (b == null && typeof a === 'function') {
    throw new TypeError('Expected a delay as the second argument (e.g. debounce(fn, "250ms"))');
  }

  return { fn, delay };
}

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
export function resolveDelayFnOptions(a, b, c, defaultDelay = 0) {
  /** @type {Function} */
  let fn;

  /** @type {string|number|undefined} */
  let delayRaw;

  /** @type {any} */
  let options;

  if (typeof a === 'function') {
    fn = a;

    if (isPlainOptions(b)) {
      // (fn, options)
      delayRaw = defaultDelay;
      options = b;
    } else {
      // (fn, delay, options?)
      delayRaw = /** @type {any} */ (b);
      options = isPlainOptions(c) ? c : {};
    }
  } else {
    // (delay, fn, options?)
    delayRaw = /** @type {any} */ (a);
    fn = /** @type {any} */ (b);
    options = isPlainOptions(c) ? c : {};
  }

  if (typeof fn !== 'function') {
    throw new TypeError(`Expected a function as one argument, got: ${typeof fn}`);
  }

  const raw = delayRaw ?? defaultDelay;

  // If someone passes `(fn, options)` but defaultDelay was undefined, surface a clear error.
  if (raw == null) {
    throw new TypeError('Expected a duration (string/number) for delay');
  }

  const delay = parseDuration(raw);
  return { fn, delay, options };
}