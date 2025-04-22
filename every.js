
// ./src/every.js
import { parseDuration } from './parseDuration.js';


/**
 * Runs a function every N milliseconds with optional execution limit.
 * Returns control methods: pause, resume, cancel.
 * 
 * @param {string} duration - e.g. "1s", "500ms", "2m"
 * @param {Function} fn - function to execute
 * @param {number} [maxTimes] - optional number of times to run
 * @returns {{ pause(): void, resume(): void, cancel(): void, isRunning: boolean }}
 */
export function every(duration, fn, maxTimes = Infinity) {
    const ms = parseDuration(duration);
    let intervalId = null;
    let count = 0;
    let running = false;
  
    const run = () => {
      if (count >= maxTimes) {
        clearInterval(intervalId);
        running = false;
        return;
      }
      fn(count);
      count++;
    };
  
    const start = () => {
      if (!running) {
        intervalId = setInterval(run, ms);
        running = true;
      }
    };
  
    start();
  
    return {
  
      pause() {
        if (running) {
          clearInterval(intervalId);
          running = false;
        }
      },
  
      resume() {
        if (!running && count < maxTimes) {
          start();
        }
      },
  
      cancel() {
        clearInterval(intervalId);
        count = maxTimes; // force end
        running = false;
      },
  
      get isRunning() {
        return running;
      }
  
    };
  }
  