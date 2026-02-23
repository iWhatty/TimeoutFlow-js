// testing/node-harness.mjs
import { after, every, debounce, flow } from './timeout-flow.min.js';

const outputLines = [];

function log(message) {
  console.log(message);
  outputLines.push(message);
}

function assertOutput(expectedLines) {
  const result = outputLines.slice(0, expectedLines.length);
  const passed = result.every((line, i) => line === expectedLines[i]);

  log('---');
  if (passed) {
    log('✅ Assertion passed: output matches expected lines');
    return true;
  }

  log('❌ Assertion failed: output did not match expected lines');
  result.forEach((line, i) => {
    const expected = expectedLines[i];
    if (line !== expected) {
      log(`  ✖ Line ${i + 1}: expected "${expected}" but got "${line}"`);
    }
  });
  return false;
}

const expectedLines = [
  '[after] duration-first',
  '[after] fn-first',

  '[every] duration-first 0',
  '[every] duration-first 1',
  '[every] duration-first 2',

  '[every] fn-first 0',
  '[every] fn-first 1',
  '[every] fn-first 2',

  '[debounce] A3',

  '[flow] Step 1',
  '[flow] Tick 0',
  '[flow] Tick 1',
  '[flow] Tick 2',
  '[flow] every(0) advanced',
  '[flow] Done',
];

// ---------- Phase 1: after ----------
function afterDurationFirst() {
  log('[after] duration-first');
}
function afterFnFirst() {
  log('[after] fn-first');
}

function runAfterPhase(next) {
  after('20ms', afterDurationFirst);
  after(afterFnFirst, '25ms');

  // barrier: after both should have fired
  after('50ms', next);
}

// ---------- Phase 2: every ----------
let everyA = 0;
function everyDurationFirstTick() {
  log(`[every] duration-first ${everyA++}`);
}

let everyB = 0;
function everyFnFirstTick() {
  log(`[every] fn-first ${everyB++}`);
}

function runEveryPhase(next) {
  // duration-first every (3 ticks)
  every('15ms', everyDurationFirstTick, { max: 3 });

  // barrier for 3 ticks @15ms + slack
  after('70ms', function runFnFirstEvery() {
    every(everyFnFirstTick, '15ms', { max: 3 });

    // barrier for second 3 ticks + slack
    after('70ms', next);
  });
}

// ---------- Phase 3: debounce ----------
function onDebounced(value) {
  log(`[debounce] ${value}`);
}

function runDebouncePhase(next) {
  const d = debounce('30ms', onDebounced);
  d('A1');
  d('A2');
  d('A3');

  // barrier: debounce window + slack
  after('60ms', next);
}

// ---------- Phase 4: flow ----------
function flowStep1() {
  log('[flow] Step 1');
}
function flowTick(i) {
  log(`[flow] Tick ${i}`);
}
function flowEveryZeroAdvanced() {
  log('[flow] every(0) advanced');
}
function flowDone() {
  log('[flow] Done');

  const ok = assertOutput(expectedLines);
  process.exitCode = ok ? 0 : 1;
}

function runFlowPhase() {
  flow()
    .after('40ms', flowStep1)
    .every('20ms', flowTick, { max: 3 })
    .every('20ms', flowTick, 0) // should advance immediately (no hang)
    .after('40ms', flowEveryZeroAdvanced)
    .after('40ms', flowDone)
    .start();
}

// ---------- main ----------
function main() {
  runAfterPhase(function () {
    runEveryPhase(function () {
      runDebouncePhase(runFlowPhase);
    });
  });
}

main();