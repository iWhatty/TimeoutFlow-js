


const timeMultipliers = {
    ms: 1,
    s: 1000,
    m: 60_000,
    h: 3_600_000
  };
  
  /**
   * Parses a duration string like "2s", "1.5m", "500ms" into milliseconds.
   * @param {string} input
   * @returns {number}
   */
  export function parseDuration(input) {
    const match = /^(\d+(?:\.\d+)?)(ms|s|m|h)$/i.exec(input.trim());
    if (!match) {
      throw new Error(`Invalid duration format: "${input}"`);
    }
    const [, value, unit] = match;
    return parseFloat(value) * timeMultipliers[unit.toLowerCase()];
  }
  


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
  

  import { parseDuration } from './tempus.js';

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
