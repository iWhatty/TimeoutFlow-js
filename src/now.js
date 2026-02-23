// ./src/now.js

// We resolve the best available clock implementation *once* at module load time.
// This avoids doing feature detection on every call to `now()`,
// keeping the hot path branch-free and fast.

let now;

// Prefer high-resolution, monotonic clock when available.
// - Browsers: performance.now()
// - Modern Node: performance.now()
// This is ideal for measuring elapsed time.
if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    now = () => performance.now();
} else {
    // Fallback for older Node or minimal runtimes.
    // Date.now() is not monotonic, but ensures compatibility.
    now = () => Date.now();
}

// Export the resolved implementation.
// Consumers simply call `now()` without worrying about environment differences.
export { now };