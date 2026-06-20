# Slot Audio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a premium-casino audio layer with mute control and the first synthesized cues for spin, reel stop, win, feature, and jackpot states.

**Architecture:** Keep audio fully client-side with a small Web Audio manager that starts only after user interaction. Define the cue palette as pure data and lightweight helper functions so the sound plan is testable in Node without trying to instantiate browser audio in unit tests.

**Tech Stack:** React 19, Vite, Web Audio API, Node test runner

---

### Task 1: Define the cue map and audio state helpers

**Files:**
- Create: `src/audioTheme.js`
- Create: `src/audioTheme.test.js`

- [ ] **Step 1: Write the failing test**

```js
import test from "node:test";
import assert from "node:assert/strict";

import { AUDIO_CUES, getDefaultAudioPreferences } from "./audioTheme.js";

test("audio theme defines the premium-casino core cues", () => {
  assert.deepEqual(Object.keys(AUDIO_CUES), [
    "uiClick",
    "spinStart",
    "spinLoop",
    "reelStop",
    "win",
    "featureTrigger",
    "riskSafe",
    "riskCommit",
    "riskWin",
    "riskLoss",
    "jackpot",
  ]);
});

test("default audio preferences start enabled at the intended master level", () => {
  assert.deepEqual(getDefaultAudioPreferences(), {
    isMuted: false,
    masterVolume: 0.58,
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/audioTheme.test.js`
Expected: FAIL because `src/audioTheme.js` does not exist yet

- [ ] **Step 3: Write minimal implementation**

```js
export const AUDIO_CUES = {
  uiClick: { family: "ui" },
  spinStart: { family: "transport" },
  spinLoop: { family: "transport" },
  reelStop: { family: "transport" },
  win: { family: "reward" },
  featureTrigger: { family: "feature" },
  riskSafe: { family: "feature" },
  riskCommit: { family: "feature" },
  riskWin: { family: "feature" },
  riskLoss: { family: "feature" },
  jackpot: { family: "reward" },
};

export function getDefaultAudioPreferences() {
  return {
    isMuted: false,
    masterVolume: 0.58,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/audioTheme.test.js`
Expected: PASS

### Task 2: Build the browser audio manager

**Files:**
- Create: `src/useSlotAudio.js`
- Modify: `src/audioTheme.js`
- Test: `src/audioTheme.test.js`

- [ ] **Step 1: Write the failing test**

```js
import test from "node:test";
import assert from "node:assert/strict";

import { getCueNamesForOutcome } from "./audioTheme.js";

test("audio cue planner escalates feature and jackpot outcomes correctly", () => {
  assert.deepEqual(getCueNamesForOutcome("spin-start"), ["spinStart", "spinLoop"]);
  assert.deepEqual(getCueNamesForOutcome("feature-open"), ["featureTrigger"]);
  assert.deepEqual(getCueNamesForOutcome("jackpot"), ["jackpot"]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/audioTheme.test.js`
Expected: FAIL because `getCueNamesForOutcome` is missing

- [ ] **Step 3: Write minimal implementation**

```js
export function getCueNamesForOutcome(eventName) {
  const map = {
    "spin-start": ["spinStart", "spinLoop"],
    "feature-open": ["featureTrigger"],
    jackpot: ["jackpot"],
  };

  return map[eventName] ?? [];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/audioTheme.test.js`
Expected: PASS

- [ ] **Step 5: Implement the hook**

```js
export function useSlotAudio() {
  // create/resume AudioContext on demand
  // expose playCue, startLoop, stopLoop, toggleMute
}
```

- [ ] **Step 6: Smoke-check build**

Run: `npm run build`
Expected: PASS

### Task 3: Integrate controls and sound triggers into the slot flow

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/styles.css`
- Modify: `AGENTS.md`

- [ ] **Step 1: Add visible mute toggle and audio state wiring**

```jsx
<button className="audio-toggle" type="button">
  Sound an
</button>
```

- [ ] **Step 2: Trigger cues from real interactions**

```js
playCue("uiClick");
playCue("spinStart");
startLoop("spinLoop");
playCue("reelStop");
playCue("win");
playCue("featureTrigger");
playCue("jackpot");
```

- [ ] **Step 3: Stop loop playback cleanly on spin completion and unmount**

```js
stopLoop("spinLoop");
```

- [ ] **Step 4: Update durable prototype decisions**

```md
- Premium-casino audio is synthesized in-browser with a visible mute toggle and first-pass cues for spin, stop, win, feature, and jackpot moments.
```

### Task 4: Verify the audio-enabled prototype

**Files:**
- Test: `src/audioTheme.test.js`
- Test: `src/gameMath.test.js`
- Test: `src/paylines.test.js`
- Test: `src/riskOverlay.test.js`

- [ ] **Step 1: Run focused tests**

Run: `node --test src/audioTheme.test.js src/gameMath.test.js src/paylines.test.js src/riskOverlay.test.js`
Expected: PASS

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Browser-check the preview**

Run a local preview check for:
- mute toggle visibility
- spin loop starts only after interaction
- reel stops click once per reel
- feature overlay has its own trigger cue
- jackpot path stays distinct
