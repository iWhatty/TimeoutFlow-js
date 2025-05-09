
// ./raf/throttleRaf.js

/**
 * Throttles a function using requestAnimationFrame with optional frame skipping.
 * Ensures the function runs at most once per N-frames.
 * - frameSkip = 0 → run every frame
 * - frameSkip = 1 → run every 2nd frame
 * - frameSkip = 2 → run every 3rd frame, etc.
 *
 * @param {Function} fn - Function to throttle
 * @param {number} [frameSkip=0] - Number of frames to skip between calls
 * @returns {Function} throttled function
 */
export function throttleRaf(fn, frameSkip = 0) {
    let scheduled = false;
    let lastArgs = null;
    let frameCount = 0;
  
    return (...args) => {
      lastArgs = args;
  
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(function tick() {
          if (frameCount >= frameSkip) {
            fn(...lastArgs);
            frameCount = 0;
            scheduled = false;
          } else {
            frameCount++;
            requestAnimationFrame(tick);
          }
        });
      }
    };
  }
  