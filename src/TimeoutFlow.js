


import { parseDuration } from './parseDuration.js';
import { after } from './after.js';
import { every } from './every.js';

/**
 * Creates a fluent scheduler.
 * Returns a chainable timeline.
 */
export function flow() {
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
    let conditionStack = [];
    let skipMode = false;
    let whileCondition = null;
    let doWhileCondition = null;

    const runner = {
        after(duration, fn) {
            steps.push({ type: 'after', duration, fn });
            return runner;
        },
        every(duration, fn, times = Infinity) {
            steps.push({
                type: 'every',
                duration,
                fn,
                times,
                whileCondition,
                doWhileCondition
            });
            whileCondition = null;
            doWhileCondition = null;
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
        },

        label(name) {
            labelMap.set(name, steps.length); // point to next step index
            return runner;
        },

        jumpTo(name) {
            jumpTarget = name;
            return runner;
        },

        if(predicate) {
            conditionStack.push(() => (typeof predicate === 'function' ? predicate() : !!predicate));
            return runner;
        },

        unless(predicate) {
            conditionStack.push(() => !(typeof predicate === 'function' ? predicate() : !!predicate));
            return runner;
        },

        while(predicate) {
            whileCondition = () => (typeof predicate === 'function' ? predicate() : !!predicate);
            return runner;
        },

        doWhile(predicate) {
            doWhileCondition = () => (typeof predicate === 'function' ? predicate() : !!predicate);
            return runner;
        }

    };

    function executeNext() {
        if (isCancelled || isPaused) return;

        if (jumpTarget) {
            const targetIndex = labelMap.get(jumpTarget);
            if (typeof targetIndex === 'number') {
                currentIndex = targetIndex;
            } else {
                throw new Error(`Label "${jumpTarget}" not found`);
            }
            jumpTarget = null; // reset after jump
        }

        // Handle if conditions
        if (conditionStack.length > 0) {
            const shouldRun = conditionStack.shift()(); // run & remove
            if (!shouldRun) {
                skipMode = true;
            }
        }

        // Skip logic
        if (skipMode) {
            const next = steps[currentIndex];
            if (!next || next.type === 'label') {
                skipMode = false; // stop skipping at label
            } else {
                currentIndex++;
                return executeNext();
            }
        }

        // End of timeline
        const step = steps[currentIndex];

        if (!step || currentIndex >= steps.length) {
            if (loopEnabled && ++loopCount < loopLimit) {
                currentIndex = 0;
                executeNext();
            } else {
                onFinishCallback?.();
            }
            return;
        }


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
            let firstRun = true;

            const ctrl = every(step.duration, () => {
                if (isPaused || isCancelled) return;

                // Handle .while (skip when fails before run)
                if (step.whileCondition && !step.whileCondition()) {
                    ctrl.cancel();
                    step.controller = null;
                    currentIndex++;
                    return executeNext();
                }

                // Run fn first
                step.fn(count++);
                firstRun = false;

                // Check doWhile after first execution
                if (!firstRun && step.doWhileCondition && !step.doWhileCondition()) {
                    ctrl.cancel();
                    step.controller = null;
                    currentIndex++;
                    return executeNext();
                }

                if (count >= step.times) {
                    ctrl.cancel();
                    step.controller = null;
                    currentIndex++;
                    executeNext();
                }
            }, step.times);

            step.controller = ctrl;
        }

        if (step.type === 'label') {
            currentIndex++;
            executeNext();
        }


    }

    return runner;
}