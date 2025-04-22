


import { parseDuration } from './parseDuration.js';
import { after } from './after.js';
import { every } from './every.js';

/**
 * Creates a fluent scheduler.
 * Returns a chainable timeline.
 */
export function chrono() {
    const steps = [];
    let currentIndex = 0;
    let isPaused = false;
    let isCancelled = false;
    let loopEnabled = false;
    let loopLimit = Infinity;
    let loopCount = 0;
  
    const runner = {
      after(duration, fn) {
        steps.push({ type: 'after', duration, fn });
        return runner;
      },
      every(duration, fn, times = Infinity) {
        steps.push({ type: 'every', duration, fn, times });
        return runner;
      },
      loop(n = true) {
        loopEnabled = true;
        loopLimit = n === true ? Infinity : n;
        return runner;
      },
      start() {
        isCancelled = false;
        isPaused = false;
        loopCount = 0;
        currentIndex = 0;
        executeNext();
        return runner;
      },
      pause() {
        if (!isPaused) {
          isPaused = true;
          steps[currentIndex]?.controller?.pause?.();
          const step = steps[currentIndex];
          if (step.type === 'after' && step.startedAt) {
            step.remaining = step.delay - (Date.now() - step.startedAt);
            step.controller?.cancel?.();
          }
        }
      },
      resume() {
        if (isPaused && !isCancelled) {
          isPaused = false;
          const step = steps[currentIndex];
          if (step.type === 'after') {
            step.startedAt = Date.now();
            step.controller = after(step.remaining + 'ms', () => {
              currentIndex++;
              executeNext();
            });
          } else {
            step?.controller?.resume?.();
          }
        }
      },
      cancel() {
        isCancelled = true;
        steps[currentIndex]?.controller?.cancel?.();
      },
      get isPaused() {
        return isPaused;
      }
    };
  
    function executeNext() {
      if (isCancelled || isPaused) return;
      if (currentIndex >= steps.length) {
        if (loopEnabled && ++loopCount < loopLimit) {
          currentIndex = 0;
          executeNext();
        }
        return;
      }
  
      const step = steps[currentIndex];
  
      if (step.type === 'after') {
        step.delay = parseDuration(step.duration);
        step.startedAt = Date.now();
        step.controller = after(step.duration, () => {
          currentIndex++;
          executeNext();
        });
      }
  
      if (step.type === 'every') {
        let count = 0;
        const ctrl = every(step.duration, () => {
          if (!isPaused && !isCancelled) {
            step.fn(count++);
            if (count >= step.times) {
              ctrl.cancel();
              currentIndex++;
              executeNext();
            }
          }
        }, step.times);
        step.controller = ctrl;
      }
    }
  
    return runner;
  }