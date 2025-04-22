// ./src/after.js
import { parseDuration } from './parseDuration.js';


/**
 * Schedules a one-time delayed function.
 * @param {string} duration - e.g. "5s", "500ms", "2m"
 * @param {Function} fn - callback to run
 * @returns {{ cancel(): void }}
 */
export function after(duration, fn) {
    const ms = parseDuration(duration);
    const id = setTimeout(fn, ms);
    return {
      cancel() {
        clearTimeout(id);
      }
    };
  }
  
