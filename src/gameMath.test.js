import test from "node:test";
import assert from "node:assert/strict";

import {
  BASE_SYMBOL_PAYOUTS,
  BET_OPTIONS,
  JACKPOT_AMOUNT,
  RISK_TRIGGER_MULTIPLIER,
  START_BALANCE,
  canOfferRiskChoice,
  getOutcomeProfile,
  getPayoutMultiplier,
  getRoundStake,
  getScaledPayout,
  qualifiesForRiskChoice,
  resolveRiskChoice,
  getSymbolPayout,
} from "./gameMath.js";

const WINNING_SYMBOL_IDS = [
  "jackpot",
  "lion",
  "white-wolf",
  "dark-wolf",
  "pink-elf",
  "blonde-cat",
  "blonde-heart",
  "sheep",
];

function getProfileRtp(stake) {
  const profile = getOutcomeProfile(stake);
  const expectedPayout = WINNING_SYMBOL_IDS.reduce(
    (sum, symbolId) => sum + profile[symbolId] * getSymbolPayout(symbolId, stake),
    0,
  );

  return expectedPayout / stake;
}

test("base bet keeps the configured base payout values", () => {
  assert.equal(getPayoutMultiplier(2.5), 1);
  assert.equal(getSymbolPayout("lion", 2.5), BASE_SYMBOL_PAYOUTS.lion);
  assert.equal(getRoundStake(2.5), 2.5);
});

test("slot sessions retain the 400 GIL starting balance", () => {
  assert.equal(START_BALANCE, 400);
});

test("regular bet ladder now supports meaningful values above 10 GIL", () => {
  assert.deepEqual(BET_OPTIONS, [2.5, 5, 10, 25, 50, 100]);
});

test("non-jackpot payouts now scale directly with the current stake", () => {
  assert.equal(getPayoutMultiplier(10), 4);
  assert.equal(getPayoutMultiplier(50), 20);
  assert.equal(getPayoutMultiplier(100), 40);
  assert.equal(getSymbolPayout("lion", 100), 4000);
  assert.equal(getSymbolPayout("pink-elf", 25), 150);
});

test("jackpot stays fixed regardless of stake", () => {
  assert.equal(JACKPOT_AMOUNT, 1250000);
  assert.equal(getSymbolPayout("jackpot", 2.5), 1250000);
  assert.equal(getSymbolPayout("jackpot", 100), 1250000);
});

test("round stake follows the selected bet", () => {
  assert.equal(getRoundStake(25, { balance: 400 }), 25);
});

test("base payouts are raised to match the bigger stake ladder", () => {
  assert.deepEqual(BASE_SYMBOL_PAYOUTS, {
    jackpot: 1250000,
    lion: 100,
    "white-wolf": 50,
    "dark-wolf": 25,
    "pink-elf": 15,
    "blonde-cat": 10,
    "blonde-heart": 5,
    sheep: 2.5,
  });
});

test("top-tier symbols now have clearly larger reward gaps", () => {
  assert.equal(BASE_SYMBOL_PAYOUTS.lion - BASE_SYMBOL_PAYOUTS["white-wolf"], 50);
  assert.equal(BASE_SYMBOL_PAYOUTS["white-wolf"] - BASE_SYMBOL_PAYOUTS["dark-wolf"], 25);
  assert.equal(BASE_SYMBOL_PAYOUTS["dark-wolf"] - BASE_SYMBOL_PAYOUTS["pink-elf"], 10);
  assert.equal(BASE_SYMBOL_PAYOUTS.sheep, 2.5);
});

test("three sheep always returns exactly the current stake", () => {
  assert.equal(getSymbolPayout("sheep", 2.5), 2.5);
  assert.equal(getSymbolPayout("sheep", 25), 25);
});

test("scaled payout helper rounds to cents", () => {
  assert.equal(getScaledPayout(15, 25), 150);
  assert.equal(getScaledPayout(5, 10), 20);
});

test("balanced model lowers the Schaf oder Loewe trigger to 4x stake", () => {
  assert.equal(RISK_TRIGGER_MULTIPLIER, 4);
  assert.equal(qualifiesForRiskChoice(9.99, 2.5), false);
  assert.equal(qualifiesForRiskChoice(10, 2.5), true);
  assert.equal(qualifiesForRiskChoice(39.99, 10), false);
  assert.equal(qualifiesForRiskChoice(40, 10), true);
  assert.equal(qualifiesForRiskChoice(25, 0), false);
  assert.equal(qualifiesForRiskChoice(25, -5), false);
});

test("risk choice is only offered for eligible symbols and never for sheep", () => {
  assert.equal(canOfferRiskChoice("sheep", 25, 2.5), false);
  assert.equal(canOfferRiskChoice("blonde-heart", 5, 2.5), false);
  assert.equal(canOfferRiskChoice("blonde-cat", 10, 2.5), true);
  assert.equal(canOfferRiskChoice("jackpot", JACKPOT_AMOUNT, 2.5), true);
});

test("fun profile targets a 24 percent hit rate with 9 percent near misses", () => {
  for (const stake of BET_OPTIONS) {
    const profile = getOutcomeProfile(stake);
    const hitRate = WINNING_SYMBOL_IDS.reduce((sum, symbolId) => sum + profile[symbolId], 0);

    assert.equal(Number(hitRate.toFixed(6)), 0.24);
    assert.equal(Number(profile.nearMiss.toFixed(6)), 0.09);
    assert.equal(Number(profile.mixed.toFixed(6)), 0.67);
  }
});

test("fun profile produces a profitable result on roughly 16 percent of spins", () => {
  for (const stake of BET_OPTIONS) {
    const profile = getOutcomeProfile(stake);
    const profitableHitRate = WINNING_SYMBOL_IDS.filter((symbolId) => symbolId !== "sheep").reduce(
      (sum, symbolId) => sum + profile[symbolId],
      0,
    );

    assert.equal(profitableHitRate >= 0.16 && profitableHitRate <= 0.161, true);
  }
});

test("fun profile returns 92 percent theoretically at every supported stake", () => {
  for (const stake of BET_OPTIONS) {
    assert.equal(Number(getProfileRtp(stake).toFixed(6)), 0.92);
  }
});

test("jackpot probability scales with stake to preserve its RTP contribution", () => {
  const baseProfile = getOutcomeProfile(2.5);
  const highProfile = getOutcomeProfile(100);
  const baseContribution = (baseProfile.jackpot * JACKPOT_AMOUNT) / 2.5;
  const highContribution = (highProfile.jackpot * JACKPOT_AMOUNT) / 100;

  assert.equal(Number(baseContribution.toFixed(6)), 0.1);
  assert.equal(Number(highContribution.toFixed(6)), 0.1);
});

test("taking the safe option returns the open win unchanged", () => {
  assert.deepEqual(resolveRiskChoice(250, { takeSafe: true }), {
    creditedWin: 250,
    outcome: "safe",
  });
});

test("lion risk either doubles the open win or loses it all", () => {
  assert.deepEqual(resolveRiskChoice(250, { takeSafe: false, roll: 0.2 }), {
    creditedWin: 500,
    outcome: "lion-win",
  });
  assert.deepEqual(resolveRiskChoice(250, { takeSafe: false, roll: 0.8 }), {
    creditedWin: 0,
    outcome: "lion-loss",
  });
});

test("jackpot payouts also qualify for the post-win risk choice", () => {
  const payout = getSymbolPayout("jackpot", 2.5);
  assert.equal(qualifiesForRiskChoice(payout, 2.5), true);
});
