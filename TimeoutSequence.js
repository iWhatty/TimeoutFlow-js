import { parseDuration, after, every } from './TimeoutFlow.js';


/**
 * Creates a fluent scheduler.
 * Returns a chainable timeline.
 */
export function chrono() {
  const steps = [];
  let currentIndex = 0;
  let cancelled = false;

  const runner = {
    after(duration, fn) {
      steps.push({ type: 'after', duration, fn });
      return runner;
    },
    every(duration, fn, times = Infinity) {
      steps.push({ type: 'every', duration, fn, times });
      return runner;
    },
    start() {
      currentIndex = 0;
      cancelled = false;
      runNext();
    },
    cancel() {
      cancelled = true;
      if (steps[currentIndex]?.controller?.cancel) {
        steps[currentIndex].controller.cancel();
      }
    }
  };

  function runNext() {
    if (cancelled || currentIndex >= steps.length) return;
    const step = steps[currentIndex];

    if (step.type === 'after') {
      const ctrl = after(step.duration, () => {
        currentIndex++;
        runNext();
      });
      step.controller = ctrl;
    }

    if (step.type === 'every') {
      let count = 0;
      const ctrl = every(step.duration, () => {
        step.fn(count++);
        if (count >= step.times) {
          ctrl.cancel();
          currentIndex++;
          runNext();
        }
      }, step.times);
      step.controller = ctrl;
    }
  }

  return runner;
}
