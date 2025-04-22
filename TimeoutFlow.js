


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
    let onFinishCallback = null;
    const labelMap = new Map();
    let jumpTarget = null;

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
        onFinish(cb) {
            onFinishCallback = cb;
            return runner;
        },
        start() {
            isCancelled = false;
            isPaused = false;
            currentIndex = 0;
            loopCount = 0;
            executeNext();
            return runner;
        },
        pause() {
            if (isPaused || isCancelled) return;
            isPaused = true;
            const step = steps[currentIndex];
            step?.controller?.pause?.();
            if (step.type === 'after' && step.startedAt) {
                step.remaining = step.delay - (Date.now() - step.startedAt);
                step.controller?.cancel?.();
            }
        },
        resume() {
            if (!isPaused || isCancelled) return;
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
        },
        cancel() {
            isCancelled = true;
            const step = steps[currentIndex];
            step?.controller?.cancel?.();
            step.controller = null;
        },
        reset() {
            runner.cancel();
            steps.length = 0;
            currentIndex = 0;
            loopCount = 0;
            onFinishCallback = null;
            return runner;
        },
        get isPaused() {
            return isPaused;
        }
    };

    function executeNext() {
        if (isCancelled || isPaused) return;

        // End of timeline
        if (currentIndex >= steps.length) {
            if (loopEnabled && ++loopCount < loopLimit) {
                currentIndex = 0;
                executeNext();
            } else {
                onFinishCallback?.();
            }
            return;
        }

        const step = steps[currentIndex];

        if (step.type === 'after') {
            step.delay = parseDuration(step.duration);
            step.startedAt = Date.now();
            step.controller = after(step.duration, () => {
                step.controller = null;
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
                        step.controller = null;
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