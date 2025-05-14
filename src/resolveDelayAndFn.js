import { parseDuration } from './parseDuration.js';

/**
 * Resolves flexible (fn, delay) or (delay, fn) inputs.
 *
 * @param {Function|string|number} a - function or duration
 * @param {Function|string|number} b - function or duration
 * @returns {{ fn: Function, delay: number }}
 */
export function resolveDelayAndFn(a, b) {
  let fn, delayRaw;

  if (typeof a === 'function') {
    fn = a;
    delayRaw = b;
  } else {
    fn = b;
    delayRaw = a;
  }

  if (typeof fn !== 'function') {
    throw new TypeError(`Expected a function as one argument, got: ${typeof fn}`);
  }

  const delay = parseDuration(delayRaw);

  return { fn, delay };
}
