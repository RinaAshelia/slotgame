import test from "node:test";
import assert from "node:assert/strict";

import { getSymbolPayout } from "./gameMath.js";
import { evaluatePaylineWins } from "./paylines.js";
import { createResolvedReels } from "./slotReels.js";

const countJackpots = (reels) =>
  reels.flat().filter((symbolId) => symbolId === "jackpot").length;

test("mixed outcomes calibrate two jackpot symbols to one percent of all spins", () => {
  const reels = createResolvedReels("mixed", { teaserRoll: 0.01, random: () => 0.4 });

  assert.equal(countJackpots(reels), 2);
  assert.equal(reels.map((reel) => reel[1]).filter((symbolId) => symbolId === "jackpot").length, 2);
  assert.deepEqual(evaluatePaylineWins(reels, 2.5, getSymbolPayout), []);
});

test("mixed outcomes calibrate one jackpot symbol to the next eight percent of all spins", () => {
  const reels = createResolvedReels("mixed", { teaserRoll: 0.05, random: () => 0.4 });

  assert.equal(countJackpots(reels), 1);
  assert.deepEqual(evaluatePaylineWins(reels, 2.5, getSymbolPayout), []);
});

test("mixed outcomes show no jackpot teaser outside the calibrated window", () => {
  const reels = createResolvedReels("mixed", { teaserRoll: 0.14, random: () => 0.4 });

  assert.equal(countJackpots(reels), 0);
});

test("real jackpot outcomes still place three jackpots on the middle row", () => {
  const reels = createResolvedReels("jackpot", { random: () => 0.4 });

  assert.equal(countJackpots(reels), 3);
  assert.deepEqual(reels.map((reel) => reel[1]), ["jackpot", "jackpot", "jackpot"]);
});
