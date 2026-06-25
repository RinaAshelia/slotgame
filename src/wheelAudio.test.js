import assert from "node:assert/strict";
import test from "node:test";

import { getWheelSpinAudioPlan } from "./wheelAudio.js";

test("wheel spin audio starts with a launch cue and sustained loop", () => {
  assert.deepEqual(getWheelSpinAudioPlan({ id: "lion", isBlank: false }), {
    start: ["spinStart", "spinLoop"],
    stop: ["reelStop", "win"],
  });
});

test("wheel spin audio resolves sheep results with the blank cue", () => {
  assert.deepEqual(getWheelSpinAudioPlan({ id: "sheep", isBlank: true }), {
    start: ["spinStart", "spinLoop"],
    stop: ["reelStop", "featureTrigger"],
  });
});

test("wheel spin audio resolves jackpot results with the jackpot sting", () => {
  assert.deepEqual(getWheelSpinAudioPlan({ id: "jackpot", isBlank: false }), {
    start: ["spinStart", "spinLoop"],
    stop: ["reelStop", "jackpot"],
  });
});
