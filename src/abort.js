// ./src/abort.js


/**
 * Standardized AbortError factory.
 * Keeps message/name consistent across environments.
 */
/**
 * Standardized AbortError factory.
 * Works in browsers and Node runtimes that may not have DOMException.
 */
export function createAbortError(message = 'Aborted') {
    // Prefer DOMException when available (browser + modern Node)
    if (typeof DOMException !== 'undefined') {
        return new DOMException(message, 'AbortError');
    }

    // Fallback: Error with AbortError name
    const err = new Error(message);
    err.name = 'AbortError';
    return err;
}


/**
 * Attach an AbortSignal listener and return a cleanup function.
 * - If `signal` is missing, returns a no-op cleanup.
 * - If already aborted, calls `onAbort()` immediately and returns a no-op cleanup.
 *
 * @param {AbortSignal | null | undefined} signal
 * @param {() => void} onAbort
 * @returns {() => void} cleanup
 */
export function attachAbort(signal, onAbort) {
    if (!signal) return () => { };
    if (signal.aborted) {
        onAbort();
        return () => { };
    }
    signal.addEventListener('abort', onAbort, { once: true });
    return () => signal.removeEventListener('abort', onAbort);
}

/**
 * Manage AbortSignal listener lifecycle for "pending work" cases.
 * Call `add()` when work becomes pending and `remove()` when it’s resolved/canceled.
 *
 * @param {AbortSignal | null | undefined} signal
 * @param {() => void} onAbort
 * @returns {{ add: () => void, remove: () => void, reset: () => void }}
 */
export function pendingAbort(signal, onAbort) {
    let cleanup = null;

    return {
        add() {
            if (cleanup) return;
            cleanup = attachAbort(signal, onAbort);
        },
        remove() {
            if (!cleanup) return;
            cleanup();
            cleanup = null;
        },
        reset() {
            if (cleanup) cleanup();
            cleanup = null;
        },
    };
}