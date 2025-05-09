# TimeoutFlow

[![npm](https://img.shields.io/npm/v/timeout-flow)](https://www.npmjs.com/package/timeout-flow)
[![gzip size](https://img.shields.io/bundlephobia/minzip/timeout-flow)](https://bundlephobia.com/package//timeout-flow)
[![downloads](https://img.shields.io/npm/dw/timeout-flow)](https://www.npmjs.com/package/timeout-flow)
[![GitHub stars](https://img.shields.io/github/stars/iWhatty/TimeoutFlow-js?style=social)](https://github.com/iWhatty/TimeoutFlow-js)

**Fluent, human-readable time control for JavaScript.**

TimeoutFlow makes working with time-based logic intuitive — think of it as a modern, composable upgrade to `setTimeout` and `setInterval`, with added powers like chaining, conditional logic, pause/resume, retries, and more.

* Minified: 6.64 KB
* Gzipped: 2.6 KB

---

## Philosophy

**TimeoutFlow is not just a wrapper for `setTimeout`.**
It's a composable mini-framework for expressing time as fluent logic.

We believe temporal behavior in JavaScript should be:

* **Readable** – durations like "1s" and "500ms" are easier to reason about than magic numbers.
* **Composable** – sequencing events should be declarative, not a tangle of nested callbacks or timers.
* **Controllable** – any timer should be pauseable, resumable, and cancelable at any moment.
* **Branchable** – real flows require `if`, `while`, `label`, and `jumpTo()` — not just repetition.
* **Tiny** – no dependencies, no bloat, and no reactivity engine required.

TimeoutFlow gives you **atomic time primitives** (`after`, `every`, `debounce`, `retry`)
and a fluent builder (`flow()`) to script rich behavior over time — like a timeline you can control.

### In Other Words:

> Think of TimeoutFlow as **setTimeout() with superpowers.**
> But more importantly, think of it as a way to **write time** like you write logic.

```js
flow()
  .after('1s', () => console.log('Start'))
  .every('500ms', (i) => console.log(`Tick ${i}`), 3)
  .after('1s', () => console.log('Done'))
  .start();
```

This isn’t about wrapping timers.
It’s about **orchestrating intent** — clearly, fluently, and with full control.

---

## Installation

```bash
npm install timeout-flow
```

---

## Features

* `after("1s", fn)` — delay execution (via `AfterTimer`)
* `every("500ms", fn, count?)` — repeat execution with optional limit (via `EveryTimer`)
* `flow()` — create fluent, chainable timelines with:

  * `.after()`, `.every()`, `.loop(n)`
  * `.if()`, `.unless()`, `.label()`, `.jumpTo()`
  * `.while()`, `.doWhile()`
* Utilities: `debounce()`, `throttle()`, `retry()`, `waitFor()`

---

## Usage Examples

```js
// 1. Delayed Execution
import { after } from 'timeout-flow';
after('2s', () => console.log('Waited 2 seconds...'));

// 2. Repeating with Pause & Resume
import { every, after as wait } from 'timeout-flow';
const ticker = every('1s', i => console.log(`Tick ${i}`), 5);
wait('2.5s', () => ticker.pause());
wait('4s', () => ticker.resume());

// 3. Debounced Input
import { debounce } from 'timeout-flow';
const search = debounce('300ms', (e) => {
  console.log('Searching for:', e.target.value);
});
document.querySelector('input').addEventListener('input', search);

// 4. Retry a Failing Request
import { retry } from 'timeout-flow';
await retry(() => fetch('/api/data'), {
  attempts: 4,
  delay: '1s',
  backoff: true
});

// 5. Wait for DOM Change
import { waitFor } from 'timeout-flow';
await waitFor(() => document.querySelector('#loaded'), {
  interval: '250ms',
  timeout: '5s'
});
console.log('Element loaded!');

// 6. Fluent Timeline
import { flow } from 'timeout-flow';
flow()
  .after('1s', () => console.log('Step 1'))
  .every('500ms', (i) => console.log(`Tick ${i}`), 3)
  .after('1s', () => console.log('Final Step'))
  .start();

// 7. Conditional & Labeled Logic
let debug = true;
flow()
  .after('1s', () => console.log('Boot sequence'))
  .if(() => debug)
  .after('500ms', () => console.log('Debug logs enabled'))
  .label('loop')
  .every('1s', i => console.log(`Frame ${i}`), 3)
  .after('500ms', () => console.log('Restarting...'))
  .jumpTo('loop')
  .start();

// 8. Controlled Loop
let energy = 3;
flow()
  .doWhile(() => energy-- > 0)
  .every('400ms', () => console.log(`Blast (${energy})`))
  .after('1s', () => console.log('Energy depleted'))
  .start();
```

---

## Utilities

```js
import { debounce, throttle, retry, waitFor } from 'timeout-flow';
```

* `debounce('300ms', fn)` — Run only after silence
* `throttle('1s', fn)` — Run at most once per time window
* `retry(fn, { attempts, delay, backoff })` — Resilient retry for async calls
* `waitFor(() => condition, { timeout, interval })` — Await condition change

---

##  Frame-Based Timing (RAF Utilities)

These helpers use `requestAnimationFrame` under the hood to provide smooth, energy-efficient timing. Ideal for visual UI flows, canvas apps, scroll/resize behavior, and performance-sensitive interactions.

All `raf` utilities automatically **pause in background tabs**, unlike timers.

###  API Summary

| Function                   | Purpose                                                             | Best For                                           |
| -------------------------- | ------------------------------------------------------------------- | -------------------------------------------------- |
| `afterRaf()`               | Runs a function **once after N ms**, using `requestAnimationFrame`. | Idle effects, UI post-load, paint batching         |
| `everyRaf()`               | Repeats a function **every N ms**, throttled via frames.            | Sanity loops, smooth polling, visual checks        |
| `debounceRaf()`            | Debounces a function using **frames instead of timeouts**.          | Drag/move handlers, visual updates                 |
| `debounceRaf('300ms', fn)` | Debounces like traditional debounce, but frame-aware.               | Resize events, paused background flows             |
| `throttleRaf()`            | Throttles execution to **at most once per frame**.                  | Scroll events, pointermove, paint-heavy flows      |
| `throttleRaf(fn, 2)`       | Throttles to once every 3 frames (`frameSkip = 2`).                 | Advanced visuals, slower sync without timers       |
| `waitForRaf()`             | Waits for a condition to become true using a frame-based loop.      | DOM readiness, layout stability, visibility checks |

###  Key Advantages

*  **Frame-sync**: Triggered in sync with visual updates (60Hz or higher)
*  **Background-tab safe**: No CPU use when inactive
*  **Energy efficient**: Great for battery-conscious apps
*  **Smoother UX**: Especially under load or heavy visuals

### 🛠 Example Usage

```js
import { debounceRaf } from 'timeout-flow';

const onMouseMove = debounceRaf(() => {
  drawPreview();
});

const onResize = debounceRaf('250ms', () => {
  updateLayout();
});
```

```js
import { afterRaf } from 'timeout-flow';

afterRaf('2s', () => {
  showIntroAnimation();
});
```

```js
import { everyRaf } from 'timeout-flow';

const loop = everyRaf('1s', () => {
  console.log('heartbeat');
});
```

```js
import { throttleRaf } from 'timeout-flow';

const onScroll = throttleRaf((e) => {
  handleScroll(e);
});

const onDrag = throttleRaf(drawFrame, 2);
```

```js
import { waitForRaf } from 'timeout-flow';

await waitForRaf(() => document.querySelector('#panel')?.offsetHeight > 0);
```

###  File Locations

| File                 | Description                                            |
| -------------------- | ------------------------------------------------------ |
| `raf/afterRaf.js`    | One-time timer with frame pause support                |
| `raf/everyRaf.js`    | Interval timer using `requestAnimationFrame`           |
| `raf/debounceRaf.js` | Smart debounce with optional duration and frame pause  |
| `raf/throttleRaf.js` | Input-event throttle using frame-skip control          |
| `raf/waitForRaf.js`  | Waits for truthy condition using passive frame polling |

---

## License

DR.WATT 2.0
