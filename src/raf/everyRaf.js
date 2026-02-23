// ./raf/everyRaf.js
import { parseDuration } from '../parseDuration.js';
import { attachAbort } from '../abort.js';

/**
 * Repeats a function every N milliseconds using requestAnimationFrame.
 *
 * Timing model:
 * - Counts down using frame deltas.
 * - Paused time does NOT count (pause freezes remaining-to-next-tick).
 * - On large frame gaps, may "catch up" by running multiple ticks in one frame,
 *   but will never exceed maxTimes.
 *
 * @param {string|number} duration - Interval duration ("1s", "500ms", 500, etc.)
 * @param {Function} fn - Function to run (receives count index)
 * @param {number} [maxTimes=Infinity] - Max number of executions
 * @param {boolean} [runImmediately=false] - Whether to run immediately once
 * @param {Object} [options]
 * @param {AbortSignal} [options.signal] - optional AbortSignal to auto-cancel
 * @returns {{
 *   pause(): void,
 *   resume(): void,
 *   cancel(): void,
 *   reset(restart?: boolean): void,
 *   readonly isRunning: boolean,
 *   readonly isPaused: boolean,
 *   readonly isFinished: boolean,
 *   readonly count: number
 * }}
 */
export function everyRaf(
    duration,
    fn,
    maxTimes = Infinity,
    runImmediately = false,
    { signal } = {}
) {
    const intervalMs = parseDuration(duration);

    let rafId = 0;

    let count = 0;

    // remaining time until next tick (pause-safe)
    let remainingToNext = intervalMs;

    // last frame timestamp (used for delta while running)
    let lastTs = null; // number | null

    let running = false;
    let paused = false;
    let finished = false;

    const cancelFrame = () => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = 0;
    };

    // Abort listener cleanup (attached once per construction run)
    let cleanupAbort = () => { };

    const finish = () => {
        cancelFrame();
        running = false;
        paused = false;
        finished = true;

        lastTs = null;
        remainingToNext = 0;

        cleanupAbort();
    };

    const cancel = () => {
        if (finished) return;
        finish();
    };

    // Preserve existing semantics:
    // - If already aborted at creation, just mark finished/zero remaining (do not attach).
    // - Otherwise attach abort listener once; removed on finish().
    if (signal?.aborted) {
        finished = true;
        remainingToNext = 0;
    } else {
        cleanupAbort = attachAbort(signal, cancel);
    }

    const canRunMore = () => count < maxTimes;

    const fire = () => {
        fn?.(count++);
        if (!canRunMore()) {
            finish();
            return false;
        }
        return true;
    };

    const tick = (ts) => {
        if (!running || finished) return;

        if (signal?.aborted) {
            finish();
            return;
        }

        if (!canRunMore()) {
            finish();
            return;
        }

        if (lastTs == null) lastTs = ts;

        const delta = ts - lastTs;
        lastTs = ts;

        // Decrement remaining time based on frame delta
        remainingToNext -= delta;

        // Catch-up loop: if we missed multiple intervals, fire multiple times.
        // Protect against infinite loops: intervalMs could be 0.
        const step = Math.max(0, intervalMs);
        if (step === 0) {
            // If interval is 0ms, treat as "once per frame"
            remainingToNext = 0;
            fire();
            rafId = requestAnimationFrame(tick);
            return;
        }

        while (remainingToNext <= 0 && !finished) {
            // We reached the next tick boundary
            const ok = fire();
            if (!ok) return;

            // Schedule next boundary: carry over overshoot
            remainingToNext += step;
        }

        rafId = requestAnimationFrame(tick);
    };

    const startLoop = () => {
        if (finished) return;
        if (signal?.aborted) {
            finish();
            return;
        }
        if (!canRunMore()) {
            finish();
            return;
        }

        running = true;
        paused = false;
        lastTs = null;
        rafId = requestAnimationFrame(tick);
    };

    const pause = () => {
        if (!running || finished) return;

        cancelFrame();

        // Freeze remainingToNext based on time since lastTs
        const now = performance.now();
        if (lastTs != null) {
            const delta = now - lastTs;
            remainingToNext = Math.max(0, remainingToNext - delta);
        }

        lastTs = null;
        running = false;
        paused = true;
    };

    const resume = () => {
        if (finished || running || !paused) return;
        if (signal?.aborted) return;

        if (!canRunMore()) {
            finish();
            return;
        }

        startLoop();
    };

    const reset = (restart = false) => {
        cancelFrame();

        count = 0;
        remainingToNext = intervalMs;
        lastTs = null;

        running = false;
        paused = false;
        finished = false;

        if (signal?.aborted) {
            finished = true;
            remainingToNext = 0;
            cleanupAbort(); // no-op if nothing attached; mirrors prior removeAbortListener path
            return;
        }

        // If maxTimes is already satisfied by definition (<=0 but not Infinity), finish.
        if (!(maxTimes > 0) && maxTimes !== Infinity) {
            finished = true;
            remainingToNext = 0;
            cleanupAbort();
            return;
        }

        if (restart) {
            // Optionally honor runImmediately on restart (matching constructor semantics)
            if (runImmediately && canRunMore()) {
                fire();
                if (finished) return;
            }
            startLoop();
        }
    };

    // Initial launch
    if (!finished) {
        // If maxTimes is "zero-ish", finish immediately.
        if (!(maxTimes > 0) && maxTimes !== Infinity) {
            finish();
        } else {
            if (runImmediately && canRunMore()) {
                fire();
            }
            if (!finished) {
                // If interval is 0, treat as "once per frame"
                remainingToNext = Math.max(0, intervalMs);
                startLoop();
            }
        }
    } else {
        cleanupAbort();
    }

    return {
        pause,
        resume,
        cancel,
        reset,
        get isRunning() {
            return running;
        },
        get isPaused() {
            return paused;
        },
        get isFinished() {
            return finished;
        },
        get count() {
            return count;
        },
    };
}