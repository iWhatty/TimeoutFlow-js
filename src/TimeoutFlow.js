// ./src/TimeoutFlow.js

import { after } from './after.js';
import { every } from './every.js';
import { pendingAbort } from './abort.js';

/**
 * Creates a fluent scheduler.
 * Returns a chainable timeline.
 *
 * @param {Object} [options]
 * @param {AbortSignal} [options.signal] - Optional AbortSignal to auto-cancel the flow
 */
export function flow({ signal } = {}) {
    const steps = [];
    const labelMap = new Map();

    let currentIndex = 0;

    let started = false;
    let isPaused = false;
    let isCancelled = false;
    let isFinished = false;

    let loopEnabled = false;
    let loopLimit = Infinity;
    let loopCount = 0;

    /** @type {Function | null} */
    let onFinishCallback = null;
    /** @type {Function | null} */
    let onErrorCallback = null;

    let jumpTarget = null;

    /** @type {Array<() => boolean>} */
    let conditionStack = [];

    let skipMode = false;

    let whileCondition = null;
    let doWhileCondition = null;

    /** @type {any} */
    let runner;

    // Abort wiring is per-run (so we don't retain references forever)
    const abort = pendingAbort(signal, () => runner.cancel());

    const clearController = (step) => {
        if (!step) return;
        if (step.controller) step.controller = null;
    };

    const cleanupCurrentController = () => {
        const step = steps[currentIndex];
        step?.controller?.cancel?.();
        if (step) step.controller = null;
    };

    const finishFlow = () => {
        if (isFinished || isCancelled) return;

        started = false;
        isPaused = false;
        isFinished = true;

        cleanupCurrentController();
        abort.remove();

        onFinishCallback?.();
    };

    const cancelFlow = () => {
        if (isCancelled) return;

        started = false;
        isPaused = false;
        isFinished = false;
        isCancelled = true;

        cleanupCurrentController();
        abort.remove();
    };

    const handleError = (err, step) => {
        // best hygiene: cancel current controller so nothing leaks
        cancelFlow();

        if (onErrorCallback) {
            try {
                onErrorCallback(err, {
                    step,
                    index: currentIndex,
                });
            } catch (_) {
                // If the error handler itself throws, fall through to rethrow original.
            }
            return;
        }

        // No handler: preserve existing behavior (throw)
        throw err;
    };

    const safeCall = (fn, stepForContext) => {
        try {
            return fn();
        } catch (err) {
            handleError(err, stepForContext);
            return undefined;
        }
    };

    const incrementStep = (step) => {
        clearController(step);
        currentIndex += 1;
        queueMicrotask(executeNext);
    };

    function executeNext() {
        if (isCancelled || isPaused || isFinished) return;
        if (signal?.aborted) {
            cancelFlow();
            return;
        }

        // Jump handling
        if (jumpTarget) {
            const targetIndex = labelMap.get(jumpTarget);
            if (typeof targetIndex === 'number') {
                currentIndex = targetIndex;
            } else {
                // treat as a flow error
                safeCall(() => {
                    throw new Error(`Label "${jumpTarget}" not found`);
                }, steps[currentIndex]);
                return;
            }
            jumpTarget = null;
        }

        // Handle if/unless conditions (applies to the next step only)
        if (conditionStack.length > 0) {
            const predicate = conditionStack.shift();
            const shouldRun = safeCall(predicate, steps[currentIndex]);
            if (!shouldRun) skipMode = true;
        }

        // Skip mode: keep skipping until we hit a label (or end)
        if (skipMode) {
            const next = steps[currentIndex];
            if (!next || next.type === 'label') {
                skipMode = false;
            } else {
                return incrementStep(next);
            }
        }

        const step = steps[currentIndex];

        // End of timeline
        if (!step || currentIndex >= steps.length) {
            if (loopEnabled && ++loopCount < loopLimit) {
                currentIndex = 0;
                executeNext();
            } else {
                finishFlow(); // ✅ only natural completion calls onFinish
            }
            return;
        }

        if (step.type === 'label') {
            return incrementStep(step);
        }

        if (step.type === 'after') {
            step.controller = after(
                step.duration,
                () => safeCall(step.fn, step),
                () => incrementStep(step)
            );
            return;
        }

        if (step.type === 'every') {
            let count = 0;

            const ctrl = every(
                step.duration,
                () => {
                    if (isPaused || isCancelled || isFinished) return;
                    if (signal?.aborted) {
                        cancelFlow();
                        return;
                    }

                    // Pre-run while guard
                    if (step.whileCondition && !safeCall(step.whileCondition, step)) {
                        ctrl.cancel();
                        return incrementStep(step);
                    }

                    safeCall(() => step.fn(count++), step);

                    // Post-run doWhile guard
                    if (step.doWhileCondition && !safeCall(step.doWhileCondition, step)) {
                        ctrl.cancel();
                        return incrementStep(step);
                    }

                    if (count >= step.times) {
                        ctrl.cancel();
                        return incrementStep(step);
                    }
                },
                step.times
            );

            step.controller = ctrl;
        }
    }

    runner = {
        after(duration, fn) {
            steps.push({ type: 'after', duration, fn, controller: null });
            return runner;
        },

        every(duration, fn, times = Infinity) {
            steps.push({
                type: 'every',
                duration,
                fn,
                times,
                whileCondition,
                doWhileCondition,
                controller: null,
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

        onError(cb) {
            onErrorCallback = cb;
            return runner;
        },

        start() {
            // restart hygiene: cancel any active controller from a previous run
            cleanupCurrentController();

            isCancelled = false;
            isFinished = false;
            isPaused = false;
            started = true;

            currentIndex = 0;
            loopCount = 0;

            // Abort wiring is per-run
            abort.reset();
            if (!signal?.aborted) abort.add();

            if (signal?.aborted) {
                cancelFlow(); // no-op start if already aborted
                return runner;
            }

            executeNext();
            return runner;
        },

        pause() {
            if (isPaused || isCancelled || isFinished) return;
            isPaused = true;
            steps[currentIndex]?.controller?.pause?.();
        },

        resume() {
            if (!isPaused || isCancelled || isFinished) return;
            if (signal?.aborted) {
                cancelFlow();
                return;
            }
            isPaused = false;
            steps[currentIndex]?.controller?.resume?.();
        },

        cancel() {
            cancelFlow(); // ✅ never calls onFinish
        },

        reset() {
            cancelFlow();

            steps.length = 0;
            labelMap.clear();

            currentIndex = 0;
            loopCount = 0;

            onFinishCallback = null;
            onErrorCallback = null;

            jumpTarget = null;
            conditionStack = [];
            skipMode = false;

            whileCondition = null;
            doWhileCondition = null;

            // allow reuse after reset (fresh state)
            started = false;
            isPaused = false;
            isCancelled = false;
            isFinished = false;

            return runner;
        },

        label(name) {
            labelMap.set(name, steps.length); // point to next step index
            steps.push({ type: 'label', name, controller: null });
            return runner;
        },

        jumpTo(name) {
            jumpTarget = name;
            return runner;
        },

        if(predicate) {
            conditionStack.push(() =>
                typeof predicate === 'function' ? !!predicate() : !!predicate
            );
            return runner;
        },

        unless(predicate) {
            conditionStack.push(() =>
                typeof predicate === 'function' ? !predicate() : !predicate
            );
            return runner;
        },

        while(predicate) {
            whileCondition = () =>
                typeof predicate === 'function' ? !!predicate() : !!predicate;
            return runner;
        },

        doWhile(predicate) {
            doWhileCondition = () =>
                typeof predicate === 'function' ? !!predicate() : !!predicate;
            return runner;
        },

        // unified lifecycle surface
        get isRunning() {
            return started && !isPaused && !isCancelled && !isFinished;
        },
        get isPaused() {
            return isPaused;
        },
        get isCancelled() {
            return isCancelled;
        },
        get isFinished() {
            return isFinished;
        },
    };

    return runner;
}