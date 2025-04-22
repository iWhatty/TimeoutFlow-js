// ./src/after.js
import { parseDuration } from './parseDuration.js';


/**
 * Schedules a one-time delayed function.
 * @param {string} duration - e.g. "5s", "500ms", "2m"
 * @param {Function} fn - callback to run
 * @returns {{
*   pause(): void,
*   resume(): void,
*   cancel(): void,
*   readonly isRunning: boolean,
* }}
 */
export function after(duration, fn, onFinish) {
  const ms = parseDuration(duration);
  let startTime = Date.now();
  let remaining = ms;
  let running = true;
  let timer = null;

  const schedule = () => {
    startTime = Date.now();
    timer = setTimeout(() => {
      running = false;
      fn?.(); // Main Func to exec after delay.
      onFinish?.(); // Callback after running, if passed.
    }, remaining);
  };


  const pause = () => {
    if (running) {
      clearTimeout(timer);
      remaining -= Date.now() - startTime;
      running = false;
    }
  };

  const resume = () => {
    if (!running && remaining > 0) {
      startTime = Date.now();
      running = true;
      schedule();
    }
  };

  const cancel = () => {
    clearTimeout(timer);
    running = false;
    timer = null;
  };

  // Scedule Timer for execution. 
  schedule();

  return {
    pause,
    resume,
    cancel,
    get isRunning() { return running; }
  };

}