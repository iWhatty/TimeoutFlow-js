/**
 * Schedules a one-time delayed function using requestAnimationFrame.
 * @param {string|number} duration - e.g. "5s", "500ms", 2000
 * @param {Function} fn - callback to run
 * @param {Function} [onFinish] - optional callback after finishing
 * @returns {Object} - Control methods and status flags
 */
export function afterRaf(duration, fn, onFinish) {
    const ms = typeof duration === 'string' ? parseDuration(duration) : duration;
    let handle = null;
    let startTime = null;
    let pausedAt = null;
    let elapsedPaused = 0;
    let running = true;
  
    const tick = (timestamp) => {
      if (!running) return;
  
      if (startTime == null) {
        startTime = timestamp;
      }
  
      const elapsed = timestamp - startTime + elapsedPaused;
  
      if (elapsed >= ms) {
        running = false;
        fn?.();
        onFinish?.();
      } else {
        handle = requestAnimationFrame(tick);
      }
    };
  
    const pause = () => {
      if (running && handle !== null) {
        cancelAnimationFrame(handle);
        pausedAt = performance.now();
        running = false;
      }
    };
  
    const resume = () => {
      if (!running && pausedAt !== null) {
        elapsedPaused += performance.now() - pausedAt;
        running = true;
        handle = requestAnimationFrame(tick);
      }
    };
  
    const cancel = () => {
      if (handle !== null) {
        cancelAnimationFrame(handle);
        handle = null;
      }
      running = false;
    };
  
    // Start immediately
    handle = requestAnimationFrame(tick);
  
    return {
      pause,
      resume,
      cancel,
      get isRunning() { return running; }
    };
  }
  