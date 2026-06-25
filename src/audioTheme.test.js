import test from "node:test";
import assert from "node:assert/strict";

import {
  AUDIO_CUES,
  buildAudioAssetUrl,
  getCueNamesForOutcome,
  getCueNamesForRiskResult,
  getDefaultAudioPreferences,
} from "./audioTheme.js";

test("audio theme defines the premium-casino core cues", () => {
  assert.deepEqual(Object.keys(AUDIO_CUES), [
    "uiClick",
    "spinStart",
    "spinLoop",
    "reelStop",
    "win",
    "featureTrigger",
    "sheepSelect",
    "lionSelect",
    "riskWin",
    "riskLoss",
    "jackpot",
  ]);
});

test("feature decision buttons use dedicated sample-based animal sounds", () => {
  assert.equal(AUDIO_CUES.sheepSelect.kind, "sample");
  assert.match(AUDIO_CUES.sheepSelect.src, /sheep-feature\.mp3$/);
  assert.equal(AUDIO_CUES.sheepSelect.offset, 0);
  assert.equal(AUDIO_CUES.sheepSelect.playDuration, 0.72);
  assert.equal(AUDIO_CUES.lionSelect.kind, "sample");
  assert.match(AUDIO_CUES.lionSelect.src, /lion-feature\.mp3$/);
  assert.equal(AUDIO_CUES.lionSelect.offset, 0.62);
  assert.equal(AUDIO_CUES.lionSelect.playDuration, 1.55);
});

test("sample audio URLs respect the GitHub Pages base path", () => {
  assert.equal(
    buildAudioAssetUrl("audio/sheep-feature.mp3", "/slotgame/"),
    "/slotgame/audio/sheep-feature.mp3",
  );
  assert.equal(
    buildAudioAssetUrl("/audio/lion-feature.mp3", "/slotgame"),
    "/slotgame/audio/lion-feature.mp3",
  );
});

test("default audio preferences start enabled at the intended master level", () => {
  assert.deepEqual(getDefaultAudioPreferences(), {
    isMuted: false,
    masterVolume: 0.58,
  });
});

test("audio cue planner escalates feature and jackpot outcomes correctly", () => {
  assert.deepEqual(getCueNamesForOutcome("spin-start"), ["spinStart", "spinLoop"]);
  assert.deepEqual(getCueNamesForOutcome("feature-open"), ["featureTrigger"]);
  assert.deepEqual(getCueNamesForOutcome("feature-safe"), ["sheepSelect"]);
  assert.deepEqual(getCueNamesForOutcome("feature-commit"), ["lionSelect"]);
  assert.deepEqual(getCueNamesForOutcome("feature-win"), ["riskWin"]);
  assert.deepEqual(getCueNamesForOutcome("feature-loss"), ["sheepSelect", "riskLoss"]);
  assert.deepEqual(getCueNamesForOutcome("jackpot"), ["jackpot"]);
});

test("risk result cue planner keeps lion and sheep outcomes cleanly separated", () => {
  assert.deepEqual(getCueNamesForRiskResult("safe"), ["sheepSelect"]);
  assert.deepEqual(getCueNamesForRiskResult("lion-win"), ["lionSelect", "riskWin"]);
  assert.deepEqual(getCueNamesForRiskResult("lion-loss"), ["sheepSelect"]);
  assert.deepEqual(getCueNamesForRiskResult("unknown"), []);
});
