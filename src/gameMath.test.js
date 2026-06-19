import test from "node:test";
import assert from "node:assert/strict";

import {
  ALL_IN_OUTCOME_PROFILE,
  BASE_SYMBOL_PAYOUTS,
  BET_OPTIONS,
  JACKPOT_AMOUNT,
  REGULAR_OUTCOME_PROFILE,
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

test("jackpot stays fixed regardless of stake or all-in mode", () => {
  assert.equal(JACKPOT_AMOUNT, 1250000);
  assert.equal(getSymbolPayout("jackpot", 2.5), 1250000);
  assert.equal(getSymbolPayout("jackpot", 100), 1250000);
  assert.equal(getSymbolPayout("jackpot", 400, { allIn: true }), 1250000);
});

test("all in uses the full current balance as the round stake", () => {
  assert.equal(getRoundStake(25, { allIn: true, balance: 400 }), 400);
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

test("all-in profile increases the chance of big prizes", () => {
  assert.ok(ALL_IN_OUTCOME_PROFILE.jackpot > REGULAR_OUTCOME_PROFILE.jackpot);
  assert.ok(ALL_IN_OUTCOME_PROFILE.lion > REGULAR_OUTCOME_PROFILE.lion);
  assert.ok(ALL_IN_OUTCOME_PROFILE["white-wolf"] > REGULAR_OUTCOME_PROFILE["white-wolf"]);
  assert.ok(ALL_IN_OUTCOME_PROFILE.mixed < REGULAR_OUTCOME_PROFILE.mixed);
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
  assert.equal(getSymbolPayout("sheep", 400, { allIn: true }), 400);
});

test("all-in payouts for non-jackpot symbols also follow the full staked amount", () => {
  assert.equal(getSymbolPayout("dark-wolf", 400, { allIn: true }), 4000);
  assert.equal(getSymbolPayout("blonde-heart", 400, { allIn: true }), 800);
});

test("wins only trigger the Schaf oder Loewe choice at 10x stake or higher", () => {
  assert.equal(qualifiesForRiskChoice(24.99, 2.5), false);
  assert.equal(qualifiesForRiskChoice(25, 2.5), true);
  assert.equal(qualifiesForRiskChoice(1000, 100), true);
  assert.equal(qualifiesForRiskChoice(25, 0), false);
  assert.equal(qualifiesForRiskChoice(25, -5), false);
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
