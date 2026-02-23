# TimeoutFlow

[![npm](https://img.shields.io/npm/v/timeout-flow)](https://www.npmjs.com/package/timeout-flow)
[![gzip size](https://img.shields.io/bundlephobia/minzip/timeout-flow)](https://bundlephobia.com/package/timeout-flow)
[![downloads](https://img.shields.io/npm/dw/timeout-flow)](https://www.npmjs.com/package/timeout-flow)
[![GitHub stars](https://img.shields.io/github/stars/iWhatty/TimeoutFlow-js?style=social)](https://github.com/iWhatty/TimeoutFlow-js)

**Fluent, human-readable time control for JavaScript.**

TimeoutFlow makes working with time-based logic intuitive — think of it as a modern, composable upgrade to `setTimeout` and `setInterval`, with added powers like chaining, conditional logic, pause/resume control, retries, RAF utilities, and more.

* Minified: ~6–7 KB
* Gzipped: ~2–3 KB
* Zero dependencies
* ESM-first, tree-shakeable

---

## Philosophy

TimeoutFlow is not just a wrapper for `setTimeout`.
It’s a composable mini-framework for expressing time as fluent logic.

We believe temporal behavior in JavaScript should be:

* **Readable** — durations like `"1s"` and `"500ms"` beat magic numbers.
* **Composable** — sequencing should be declarative, not nested callbacks.
* **Controllable** — any timer should be pauseable, resumable, cancelable.
* **Branchable** — real flows need `if`, `while`, `label`, `jumpTo()`.
* **Tiny** — no reactivity engine, no bloat.

TimeoutFlow gives you atomic time primitives (`after`, `every`, `debounce`, `throttle`, `retry`) and a fluent builder (`flow()`) to script rich behavior over time — like a timeline you control.

> Think of TimeoutFlow as `setTimeout()` with superpowers.

---

## Timing Semantics

All pauseable timers in TimeoutFlow are **pause-safe**:

* **Paused time does not count** toward elapsed time.
* `pause()` freezes the remaining time.
* `resume()` continues from where it left off.

RAF utilities are frame-driven:

* `afterRaf('0ms')` runs on the **next animation frame**
* `everyRaf('0ms')` runs **at most once per frame**

---

## Installation

```bash
npm install timeout-flow
```

---

## Unified Control Surface

Most time-based primitives return a **controller object**:

```js
import { after } from 'timeout-flow';

const ctrl = after('1s', () => console.log('done'));

ctrl.pause();
ctrl.resume();
ctrl.cancel();
ctrl.reset?.(); // some controllers support reset

console.log(ctrl.isRunning);   // boolean
console.log(ctrl.isPaused);    // boolean
console.log(ctrl.isFinished);  // boolean
```

This controller shape is shared by:

* `after()` → `pause / resume / cancel / reset`
* `every()` → `pause / resume / cancel / reset` + `count`
* `afterRaf()` → `pause / resume / cancel / reset`
* `everyRaf()` → `pause / resume / cancel / reset` + `count`

All controllers are:

* Pause-safe (paused time does not count)
* Cancel-safe
* Monotonic-time based (`performance.now()` / RAF timestamps)
* AbortSignal-aware (where supported)

---

## Core Features

* `after("1s", fn)` — delay execution once
* `every("500ms", fn, count?)` — repeat execution with optional limit
* `flow()` — create fluent, chainable timelines
* `debounce()` / `throttle()` — time-based input control
* `retry()` — resilient async retries
* `waitFor()` — await condition changes

---

## Usage Examples

### Delayed Execution

```js
import { after } from 'timeout-flow';

after('2s', () => console.log('Waited 2 seconds...'));
```

### Repeating with Pause & Resume

```js
import { every, after as wait } from 'timeout-flow';

const ticker = every('1s', i => console.log(`Tick ${i}`), 5);
wait('2.5s', () => ticker.pause());
wait('4s', () => ticker.resume());
```

### Debounced Input

```js
import { debounce } from 'timeout-flow';

const search = debounce('300ms', (e) => {
  console.log('Searching for:', e.target.value);
});

search.cancel();
search.flush();
```

### Throttle

```js
import { throttle } from 'timeout-flow';

const onScroll = throttle('250ms', handleScroll);
onScroll.cancel();
onScroll.flush();
```

### Retry with Backoff + Jitter

```js
import { retry } from 'timeout-flow';

await retry(fetchData, {
  attempts: 5,
  delay: '500ms',
  backoff: true,
  factor: 2,
  maxDelay: '5s',

  // jitter: false | true | 'full' | 'equal' | 'decorrelated'
  jitter: 'decorrelated',

  onRetry: (err, attempt, delayMs) => {
    console.log(`Retry ${attempt} in ${delayMs}ms`);
  },
  shouldRetry: (err) => err.status !== 404,
});
```

### Wait for Condition

```js
import { waitFor } from 'timeout-flow';

await waitFor(() => document.querySelector('#loaded'), {
  interval: '250ms',
  timeout: '5s',
  immediate: true,
});
```

---

## Fluent Timeline

```js
import { flow } from 'timeout-flow';

flow()
  .after('1s', () => console.log('Step 1'))
  .every('500ms', i => console.log(`Tick ${i}`), 3)
  .after('1s', () => console.log('Final Step'))
  .start();
```

### Conditional & Labeled Logic

```js
flow()
  .after('1s', () => console.log('Boot sequence'))
  .if(() => true)
  .after('500ms', () => console.log('Conditional step'))
  .label('loop')
  .every('1s', i => console.log(`Frame ${i}`), 3)
  .jumpTo('loop')
  .start();
```

---

## AbortSignal Support

Many utilities accept `{ signal }` for automatic cancellation.

```js
import { afterRaf } from 'timeout-flow';

const ac = new AbortController();

const ctrl = afterRaf(
  '2s',
  () => {
    console.log('Will not run if aborted');
  },
  null,
  { signal: ac.signal }
);

ac.abort(); // cancels pending work
```

If the signal is already aborted when created, no work is scheduled.

---

# Frame-Based Timing (RAF Utilities)

RAF helpers use `requestAnimationFrame` for frame-driven logic.

Ideal for:

* Scroll / pointer handlers
* Layout checks
* Visual state polling
* Canvas / animation loops

RAF utilities are frame-driven and typically throttle heavily in background tabs.

## API Summary

| Function        | Purpose                                  |
| --------------- | ---------------------------------------- |
| `afterRaf()`    | Run once after N ms (frame-based)        |
| `everyRaf()`    | Repeat every N ms using frames           |
| `debounceRaf()` | Frame-aware debounce (ms inactivity)     |
| `throttleRaf()` | At most once per frame (or per N frames) |
| `waitForRaf()`  | Wait for truthy condition via frames     |

## Controls

* `afterRaf()` → `pause()` / `resume()` / `cancel()` / `reset()` + state flags
* `everyRaf()` → `pause()` / `resume()` / `cancel()` / `reset(restart?)` + state flags + `count`
* `debounceRaf()` → `.cancel()` + `.flush()`
* `throttleRaf()` → `.cancel()` + `.flush()`
* `waitForRaf()` → `{ timeout, signal, immediate }`

## Signatures

```js
afterRaf(duration, fn, onFinish?, { signal }?)
everyRaf(duration, fn, maxTimes?, runImmediately?, { signal }?)

debounceRaf(fn, { signal }?)
debounceRaf(duration, fn, { signal }?)

throttleRaf(fn, frameSkip?)
throttleRaf(fn, { signal, trailing }?)
throttleRaf(fn, frameSkip, { signal, trailing }?)

waitForRaf(condition, { timeout, signal, immediate }?)
```

## Timing Notes

* Paused time does **not** count for `afterRaf()` / `everyRaf()`.
* `afterRaf('0ms')` runs on the **next frame**.
* `everyRaf('0ms')` runs **once per frame** (max).
* `waitForRaf()` timeout is measured using **RAF timestamps** (monotonic).

### Example

```js
import { throttleRaf } from 'timeout-flow';

// Once per frame:
const onScroll = throttleRaf(drawFrame);

// Every 3rd frame (frameSkip = 2):
const onScrollLite = throttleRaf(drawFrame, 2);

// Keep first args during wait:
const onDrag = throttleRaf(handleDrag, { trailing: false });

onScroll.cancel();
onScroll.flush();
```

---

## Public API

```js
import {
  after,
  every,
  debounce,
  throttle,
  retry,
  waitFor,
  flow,

  // RAF
  afterRaf,
  everyRaf,
  debounceRaf,
  throttleRaf,
  waitForRaf,
} from 'timeout-flow';
```

---

## License

--{DR.WATT v3.0}--
