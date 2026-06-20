import test from "node:test";
import assert from "node:assert/strict";

import {
  BASE_SYMBOL_PAYOUTS,
  BET_OPTIONS,
  JACKPOT_AMOUNT,
  REGULAR_OUTCOME_PROFILE,
  RISK_TRIGGER_MULTIPLIER,
  canOfferRiskChoice,
  getOutcomeProfile,
  getPayoutMultiplier,
  getRoundStake,
  getScaledPayout,
  qualifiesForRiskChoice,
  resolveRiskChoice,
  getSymbolPayout,
} from "./gameMath.js";

test("base bet keeps the configured base payout values", () => {
  assert.equal(getPayoutMultiplier(2.5), 1);
  assert.equal(getSymbolPayout("lion", 2.5), BASE_SYMBOL_PAYOUTS.lion);
  assert.equal(getRoundStake(2.5), 2.5);
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

test("balanced outcome profile now targets roughly a 16.5 percent hit rate with fewer near misses", () => {
  const winningSymbols = [
    "jackpot",
    "lion",
    "white-wolf",
    "dark-wolf",
    "pink-elf",
    "blonde-cat",
    "blonde-heart",
    "sheep",
  ];
  const profile = getOutcomeProfile(2.5);
  const hitRate = winningSymbols.reduce((sum, symbolId) => sum + profile[symbolId], 0);

  assert.equal(Number(hitRate.toFixed(6)), 0.165);
  assert.equal(Number(profile.nearMiss.toFixed(3)), 0.155);
});

test("higher stakes lightly boost premium-hit frequency from 25 GIL upward", () => {
  const premiumSymbols = ["jackpot", "lion", "white-wolf", "dark-wolf", "pink-elf", "blonde-cat"];
  const winningSymbols = [
    "jackpot",
    "lion",
    "white-wolf",
    "dark-wolf",
    "pink-elf",
    "blonde-cat",
    "blonde-heart",
    "sheep",
  ];
  const baseProfile = getOutcomeProfile(10);
  const highStakeProfile = getOutcomeProfile(50);
  const basePremiumRate = premiumSymbols.reduce((sum, symbolId) => sum + baseProfile[symbolId], 0);
  const highStakePremiumRate = premiumSymbols.reduce((sum, symbolId) => sum + highStakeProfile[symbolId], 0);
  const baseHitRate = winningSymbols.reduce((sum, symbolId) => sum + baseProfile[symbolId], 0);
  const highStakeHitRate = winningSymbols.reduce((sum, symbolId) => sum + highStakeProfile[symbolId], 0);

  assert.equal(baseProfile.jackpot, highStakeProfile.jackpot);
  assert.equal(Number(baseHitRate.toFixed(6)), Number(highStakeHitRate.toFixed(6)));
  assert.equal(Number(baseHitRate.toFixed(6)), 0.165);
  assert.equal(Number(highStakePremiumRate.toFixed(6)) > Number(basePremiumRate.toFixed(6)), true);
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
