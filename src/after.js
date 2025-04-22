// ./src/after.js
import { parseDuration } from './parseDuration.js';


/**
 * Schedules a one-time delayed function.
 * @param {string} duration - e.g. "5s", "500ms", "2m"
 * @param {Function} fn - callback to run
 * @returns {{ cancel(): void }}
 */
export function after(duration, fn, onFinish) {
    const ms = parseDuration(duration);
    let timer = null;
    let startTime = Date.now();
    let remaining = ms;
    let running = true;
  
    const schedule = () => {
      timer = setTimeout(() => {
        running = false;
        fn?.(); // Main Func to exec after delay.
        onFinish?.(); // Callback after running if passed.
      }, remaining);
    };
  
    schedule();
  
    return {
      pause() {
        if (running) {
          clearTimeout(timer);
          remaining -= Date.now() - startTime;
          running = false;
        }
      },
      resume() {
        if (!running && remaining > 0) {
          startTime = Date.now();
          running = true;
          schedule();
        }
      },
      cancel() {
        clearTimeout(timer);
        running = false;
      },
      get isRunning() {
        return running;
      }
    };
  }