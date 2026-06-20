import test from "node:test";
import assert from "node:assert/strict";

import { evaluatePaylineWins, FIXED_PAYLINES, JACKPOT_PAYLINE_ID } from "./paylines.js";
import { getSymbolPayout } from "./gameMath.js";

test("balanced model uses three fixed horizontal paylines with jackpot locked to the middle", () => {
  assert.deepEqual(
    FIXED_PAYLINES.map((line) => line.id),
    ["top", "middle", "bottom"],
  );
  assert.equal(JACKPOT_PAYLINE_ID, "middle");
});

test("top and bottom rows can produce regular wins", () => {
  const reels = [
    ["blonde-cat", "sheep", "pink-elf"],
    ["blonde-cat", "white-wolf", "pink-elf"],
    ["blonde-cat", "dark-wolf", "pink-elf"],
  ];

  const wins = evaluatePaylineWins(reels, 10, getSymbolPayout);

  assert.deepEqual(wins, [
    {
      lineId: "top",
      lineLabel: "Obere Reihe",
      payout: 40,
      symbolId: "blonde-cat",
    },
    {
      lineId: "bottom",
      lineLabel: "Untere Reihe",
      payout: 60,
      symbolId: "pink-elf",
    },
  ]);
});

test("jackpot only pays on the middle row", () => {
  const reels = [
    ["jackpot", "jackpot", "sheep"],
    ["jackpot", "jackpot", "blonde-heart"],
    ["jackpot", "jackpot", "dark-wolf"],
  ];

  const wins = evaluatePaylineWins(reels, 2.5, getSymbolPayout);

  assert.deepEqual(wins, [
    {
      lineId: "middle",
      lineLabel: "Mittlere Reihe",
      payout: 1250000,
      symbolId: "jackpot",
    },
  ]);
});
