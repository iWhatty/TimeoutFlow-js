import { parseDuration, after, every } from './TimeoutFlow.js';


/**
 * Creates a fluent scheduler.
 * Returns a chainable timeline.
 */
export function chrono() {
    const steps = [];
    let currentIndex = 0;
    let cancelled = false;
    let paused = false;
    let shouldLoop = false;
    let loopCountMax = Infinity;
    let loopCountCurrent = 0;

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
            paused = false;
            runNext();
            return runner;
        },

        loop(count = true) {
            shouldLoop = true;
            loopCountMax = count === true ? Infinity : count;
            return runner;
        },

        pause() {
            if (paused || cancelled) return;
            paused = true;
            const current_step = steps[currentIndex];
            current_step?.controller?.pause?.();
            if (current_step.type === 'after' && current_step.startedAt) {
                current_step.remaining = current_step.delay - (Date.now() - current_step.startedAt);
                current_step.controller.cancel();
            }
        },

        resume() {
            if (!paused || cancelled) return;
            paused = false;
            const current_step = steps[currentIndex];
            if (current_step.type === 'after') {
                current_step.startedAt = Date.now();
                current_step.controller = after(current_step.remaining + 'ms', () => {
                    currentIndex++;
                    runNext();
                });
            } else {
                current_step?.controller?.resume?.();
            }
        },
        
        cancel() {
            cancelled = true;
            steps[currentIndex]?.controller?.cancel?.();
        },

        get isPaused() {
            return paused;
        }
    };

    function runNext() {
        if (cancelled || paused || currentIndex >= steps.length) {
            if (shouldLoop && !cancelled && loopCountCurrent < loopCountMax) {
                loopCountCurrent++;
                currentIndex = 0;
                runNext();
            }
            return;
        }

        const step = steps[currentIndex];
        if (step.type === 'after') {
            step.delay = parseDuration(step.duration);
            step.startedAt = Date.now();
            step.controller = after(step.duration, () => {
                currentIndex++;
                runNext();
            });
        }

        if (step.type === 'every') {
            let count = 0;
            const ctrl = every(step.duration, () => {
                if (paused || cancelled) return;
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
