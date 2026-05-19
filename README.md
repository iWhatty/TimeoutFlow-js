# timeout-flow

[![npm](https://img.shields.io/npm/v/timeout-flow)](https://www.npmjs.com/package/timeout-flow)
[![downloads](https://img.shields.io/npm/dm/timeout-flow)](https://www.npmjs.com/package/timeout-flow)
[![bundle size](https://img.shields.io/bundlephobia/minzip/timeout-flow)](https://bundlephobia.com/package/timeout-flow)
[![license](https://img.shields.io/npm/l/timeout-flow)](https://github.com/iWhatty/TimeoutFlow-js/blob/main/LICENSE)
[![stars](https://img.shields.io/github/stars/iWhatty/TimeoutFlow-js?style=social)](https://github.com/iWhatty/TimeoutFlow-js)

Fluent, human-readable time control for JavaScript. A modern, composable upgrade to `setTimeout` and `setInterval` with chaining, conditional logic, pause/resume control, retries, and RAF utilities.

## Features

- Readable durations: `"1s"`, `"500ms"`, plain numbers
- Pause / resume / cancel controllers for `after()`, `every()`, RAF variants
- `flow()` builds declarative timelines with branching and labels
- `retry()` with backoff, jitter, and `AbortSignal` cancellation
- `waitFor()` polls a predicate with timeout
- RAF variants (`afterRaf`, `everyRaf`, `debounceRaf`, `throttleRaf`, `waitForRaf`) for frame-aligned timing
- ESM-first, tree-shakeable. Per-file subpath exports for size-sensitive consumers (~1.2 KB gzipped for a single primitive)
- Zero dependencies
- ~6–7 KB minified for the full kit (~2–3 KB gzipped)

---

## Install

```sh
pnpm add timeout-flow
```

---

## Quick start

```js
import { after } from 'timeout-flow';

function greet() {
  console.log('Hello');
}

const ctrl = after('2s', greet);

ctrl.pause();
ctrl.resume();
ctrl.cancel();
```

---

## API

### `after(duration, fn, options?)`

Run once after a delay.

```js
import { after } from 'timeout-flow';

after('2s', function greet() {
  console.log('Hello');
});
```

### `every(duration, fn, options?)`

Repeat execution with optional limit.

```js
import { every } from 'timeout-flow';

const ticker = every('1s', function tick(i) {
  console.log('Tick', i);
}, { max: 5 });
```

### `debounce(duration, fn, options?)`

Delay execution until inactivity.

```js
import { debounce } from 'timeout-flow';

const debouncedSearch = debounce('300ms', function search(event) {
  console.log('Searching for:', event.target.value);
});

debouncedSearch.cancel();
debouncedSearch.flush();
```

### `throttle(duration, fn, options?)`

Limit execution frequency.

```js
import { throttle } from 'timeout-flow';

const onScroll = throttle('250ms', function handleScroll() {
  console.log('scroll');
});

onScroll.cancel();
onScroll.flush();
```

### `retry(fn, options?)`

Retry async operations with backoff and jitter.

```js
import { retry } from 'timeout-flow';

await retry(async function fetchData() {
  return fetch('/api/data');
}, {
  attempts: 5,
  delay: '500ms',
  backoff: true,
  factor: 2,
  maxDelay: '5s',
  jitter: 'decorrelated'
});
```

### `waitFor(predicate, options?)`

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

### `flow()`

Build declarative time flows.

```js
import { flow } from 'timeout-flow';

flow()
  .after('1s', function stepOne() {
    console.log('Step 1');
  })
  .every('500ms', function tick(i) {
    console.log('Tick', i);
  }, { max: 3 })
  .after('1s', function finalStep() {
    console.log('Final Step');
  })
  .start();
```

Flow reads like a timeline and keeps duration-first ordering for readability.

### RAF utilities

Frame-based timing powered by `requestAnimationFrame`. Ideal for visual updates, scroll handlers, layout checks, and animation loops.

Available: `afterRaf()`, `everyRaf()`, `debounceRaf()`, `throttleRaf()`, `waitForRaf()`.

```js
import { throttleRaf } from 'timeout-flow';

const onScroll = throttleRaf(function drawFrame() {
  console.log('draw');
});

onScroll.cancel();
onScroll.flush();
```

### Controllers

Most time-based primitives return a controller object:

```js
const ctrl = after('1s', () => console.log('done'));

ctrl.pause();
ctrl.resume();
ctrl.cancel();
ctrl.reset?.();

console.log(ctrl.isRunning);
console.log(ctrl.isPaused);
console.log(ctrl.isFinished);
```

Shared by `after()`, `every()`, `afterRaf()`, `everyRaf()`. All controllers are pause-safe (paused time does not count), cancel-safe, monotonic-time based, and `AbortSignal`-aware where supported.

### AbortSignal support

Many utilities accept `{ signal }` for automatic cancellation.

```js
import { after } from 'timeout-flow';

const ac = new AbortController();

after('2s', function doWork() {
  console.log('Will not run if aborted');
}, { signal: ac.signal });

ac.abort();
```

If already aborted at creation time, no work is scheduled.

### Public surface

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

## Notes

### Tree-shaking and per-primitive imports

Two import styles, same package, choose by bundle-size sensitivity:

```js
// Full kit. Every primitive available on one import.
// Modern bundlers (esbuild, vite, rollup, webpack 5) will tree-shake
// unused exports because the package ships `sideEffects: false` and the
// `.` entrypoint points at ESM source instead of a pre-minified blob.
import { after, debounce, retry } from 'timeout-flow';
```

```js
// Per-primitive subpath. Explicit minimum surface, useful when you know
// you only need one primitive and want the bundle to reflect that
// without relying on the bundler's tree-shaker. Same source either way.
import { after }     from 'timeout-flow/after';
import { every }     from 'timeout-flow/every';
import { debounce }  from 'timeout-flow/debounce';
import { throttle }  from 'timeout-flow/throttle';
import { retry }     from 'timeout-flow/retry';
import { waitFor }   from 'timeout-flow/wait-for';
import { flow }      from 'timeout-flow/flow';
import { afterRaf, everyRaf, debounceRaf, throttleRaf, waitForRaf } from 'timeout-flow/raf';
import { parseDuration } from 'timeout-flow/parse-duration';
```

Measured for a single `after()` call in a typical browser bundler (esbuild, minified + gzip):

| Import style | Gzip |
|---|---:|
| pre-0.0.19 default (full minified bundle) | 5098 bytes |
| 0.0.19 default (`import { after } from 'timeout-flow'`) | 1199 bytes |
| 0.0.19 subpath (`import { after } from 'timeout-flow/after'`) | 1199 bytes |

For unbundled `<script type="module">` consumption of the full kit, use the **`timeout-flow/min`** subpath, which points at the pre-built minified IIFE.

### Clean signatures

timeout-flow supports both natural-language and function-first argument ordering:

```js
after('1s', done);
// or
after(done, '1s');
```

This applies to `after()`, `every()`, `debounce()`, `throttle()`. Use whichever reads best in your codebase.

### Philosophy

timeout-flow is not just a wrapper around timers, it's a composable toolkit for expressing time as readable logic. Temporal behavior should be:

- **Readable.** Durations like `"1s"` and `"500ms"` beat magic numbers.
- **Composable.** Sequencing should be declarative.
- **Controllable.** Timers should pause, resume, cancel.
- **Branchable.** Real flows need `if`, `while`, `label`, `jumpTo()`.
- **Tiny.** No runtime bloat.

> Think of timeout-flow as `setTimeout()` with superpowers.

---

## License

See [LICENSE](./LICENSE) and [ADDITIONAL_TERMS.md](./ADDITIONAL_TERMS.md). © WATT3D.
