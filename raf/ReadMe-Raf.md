## 🗯 Frame-Based Timing (RAF Utilities)

These helpers use `requestAnimationFrame` under the hood to provide smooth, energy-efficient timing. Ideal for visual UI flows, canvas apps, scroll/resize behavior, and performance-sensitive interactions.

All `raf` utilities automatically **pause in background tabs**, unlike timers.

---

### 👉 API Summary

| Function                | Purpose                                                                 | Best For                                       |
|-------------------------|-------------------------------------------------------------------------|------------------------------------------------|
| `afterRaf()`            | Runs a function **once after N ms**, using `requestAnimationFrame`.     | Idle effects, UI post-load, paint batching     |
| `everyRaf()`            | Repeats a function **every N ms**, throttled via frames.                | Sanity loops, smooth polling, visual checks    |
| `debounceRaf()`         | Debounces a function using **frames instead of timeouts**.              | Drag/move handlers, visual updates             |
| `debounceRaf('300ms', fn)` | Debounces like traditional debounce, but frame-aware.              | Resize events, paused background flows         |
| `throttleRaf()`         | Throttles execution to **at most once per frame**.                     | Scroll events, pointermove, paint-heavy flows  |
| `throttleRaf(fn, 2)`    | Throttles to once every 3 frames (`frameSkip = 2`).                     | Advanced visuals, slower sync without timers   |

---

### ✨ Key Advantages

- 🔄 **Frame-sync**: Triggered in sync with visual updates (60Hz or higher)
- 🛌 **Background-tab safe**: No CPU use when inactive
- ⚡ **Energy efficient**: Great for battery-conscious apps
- 🧘 **Smoother UX**: Especially under load or heavy visuals

---

### 🛠 Example Usage

```js
import { debounceRaf } from './raf/debounceRaf.js';

// Wait 1 frame after rapid calls
const onMouseMove = debounceRaf(() => {
  drawPreview();
});

// Wait 250ms of inactivity (with frame-based throttle)
const onResize = debounceRaf('250ms', () => {
  updateLayout();
});
```

```js
import { afterRaf } from './raf/afterRaf.js';

afterRaf('2s', () => {
  showIntroAnimation();
});
```

```js
import { everyRaf } from './raf/everyRaf.js';

const loop = everyRaf('1s', () => {
  console.log('heartbeat');
});
```

```js
import { throttleRaf } from './raf/throttleRaf.js';

// Throttle a scroll event to at most once per animation frame
const onScroll = throttleRaf((e) => {
  handleScroll(e);
});

// Throttle to once every 3 frames (skip 2 frames)
const onDrag = throttleRaf(drawFrame, 2);
```

---

### 📦 File Locations

| File                  | Description                                             |
|-----------------------|---------------------------------------------------------|
| `raf/afterRaf.js`     | One-time timer with frame pause support                |
| `raf/everyRaf.js`     | Interval timer using `requestAnimationFrame`           |
| `raf/debounceRaf.js`  | Smart debounce with optional duration and frame pause  |
| `raf/throttleRaf.js`  | Input-event throttle using frame-skip control          |

