# TimeoutFlow

[![npm](https://img.shields.io/npm/v/timeout-flow)](https://www.npmjs.com/package/timeout-flow)
[![gzip size](https://img.shields.io/bundlephobia/minzip/timeout-flow)](https://bundlephobia.com/package/timeout-flow)
[![downloads](https://img.shields.io/npm/dw/timeout-flow)](https://www.npmjs.com/package/timeout-flow)
[![GitHub stars](https://img.shields.io/github/stars/iWhatty/TimeoutFlow-js?style=social)](https://github.com/iWhatty/TimeoutFlow-js)

**Fluent, human-readable time control for JavaScript.**

TimeoutFlow makes working with time-based logic intuitive — think of it as a modern, composable upgrade to `setTimeout` and `setInterval`, with chaining, conditional logic, pause/resume control, retries, RAF utilities, and more.

* Minified: ~6–7 KB
* Gzipped: ~2–3 KB
* Zero dependencies
* ESM-first, tree-shakeable

---

# Philosophy

TimeoutFlow is not just a wrapper around timers.
It’s a composable toolkit for expressing time as readable logic.

Temporal behavior should be:

* **Readable** — durations like `"1s"` and `"500ms"` beat magic numbers.
* **Composable** — sequencing should be declarative.
* **Controllable** — timers should pause, resume, cancel.
* **Branchable** — real flows need `if`, `while`, `label`, `jumpTo()`.
* **Tiny** — no runtime bloat.

> Think of TimeoutFlow as `setTimeout()` with superpowers.

---

# Clean Signatures

TimeoutFlow supports **both** natural-language ordering and function-first ordering.

You can write:

```js
after('1s', done);
```

Or:

```js
after(done, '1s');
```

Both are valid.

This applies to:

* `after()`
* `every()`
* `debounce()`
* `throttle()`

Use whichever reads best in your codebase.

---

# Installation

```bash
npm install timeout-flow
```

---

# Unified Control Surface

Most time-based primitives return a **controller object**:

```js
import { after } from 'timeout-flow';

function done() {
  console.log('done');
}

const ctrl = after('1s', done);

ctrl.pause();
ctrl.resume();
ctrl.cancel();
ctrl.reset?.();

console.log(ctrl.isRunning);
console.log(ctrl.isPaused);
console.log(ctrl.isFinished);
```

Shared by:

* `after()`
* `every()`
* `afterRaf()`
* `everyRaf()`

All controllers are:

* Pause-safe (paused time does not count)
* Cancel-safe
* Monotonic-time based
* AbortSignal-aware (where supported)

---

# Core Primitives

## after()

Run once after a delay.

```js
import { after } from 'timeout-flow';

function greet() {
  console.log('Hello');
}

after('2s', greet);
```

---

## every()

Repeat execution with optional limit.

```js
import { every } from 'timeout-flow';

function tick(i) {
  console.log('Tick', i);
}

const ticker = every('1s', tick, { max: 5 });
```

---

## debounce()

Delay execution until inactivity.

```js
import { debounce } from 'timeout-flow';

function search(event) {
  console.log('Searching for:', event.target.value);
}

const debouncedSearch = debounce('300ms', search);

debouncedSearch.cancel();
debouncedSearch.flush();
```

---

## throttle()

Limit execution frequency.

```js
import { throttle } from 'timeout-flow';

function handleScroll() {
  console.log('scroll');
}

const onScroll = throttle('250ms', handleScroll);

onScroll.cancel();
onScroll.flush();
```

---

## retry()

Retry async operations with backoff + jitter.

```js
import { retry } from 'timeout-flow';

async function fetchData() {
  return fetch('/api/data');
}

await retry(fetchData, {
  attempts: 5,
  delay: '500ms',
  backoff: true,
  factor: 2,
  maxDelay: '5s',
  jitter: 'decorrelated'
});
```

---

## waitFor()

Wait until a condition becomes true.

```js
import { waitFor } from 'timeout-flow';

await waitFor(function checkLoaded() {
  return document.querySelector('#loaded');
}, {
  interval: '250ms',
  timeout: '5s',
  immediate: true
});
```

---

# Fluent Timeline

Build declarative time flows.

```js
import { flow } from 'timeout-flow';

function stepOne() {
  console.log('Step 1');
}

function tick(i) {
  console.log('Tick', i);
}

function finalStep() {
  console.log('Final Step');
}

flow()
  .after('1s', stepOne)
  .every('500ms', tick, { max: 3 })
  .after('1s', finalStep)
  .start();
```

Flow reads like a timeline and keeps duration-first ordering for readability.

---

# AbortSignal Support

Many utilities accept `{ signal }` for automatic cancellation.

```js
import { after } from 'timeout-flow';

const ac = new AbortController();

function doWork() {
  console.log('Will not run if aborted');
}

after('2s', doWork, { signal: ac.signal });

ac.abort();
```

If already aborted at creation time, no work is scheduled.

---

# RAF Utilities

Frame-based timing powered by `requestAnimationFrame`.

Ideal for visual updates, scroll handlers, layout checks, and animation loops.

## Available

* `afterRaf()`
* `everyRaf()`
* `debounceRaf()`
* `throttleRaf()`
* `waitForRaf()`

## Example

```js
import { throttleRaf } from 'timeout-flow';

function drawFrame() {
  console.log('draw');
}

const onScroll = throttleRaf(drawFrame);

onScroll.cancel();
onScroll.flush();
```

---

# Public API

```js
import {
  after,
  every,
  debounce,
  throttle,
  retry,
  waitFor,
  flow,

  afterRaf,
  everyRaf,
  debounceRaf,
  throttleRaf,
  waitForRaf
} from 'timeout-flow';
```

---

# License

--{DR.WATT v3.0}--
