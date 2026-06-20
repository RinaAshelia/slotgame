import test from "node:test";
import assert from "node:assert/strict";

import { createRiskDecisionOverlay, createRiskResultOverlay } from "./riskOverlay.js";

test("risk decision overlay introduces both sheep and lion paths up front", () => {
  const overlay = createRiskDecisionOverlay({
    symbolId: "white-wolf",
    symbolLabel: "Poly",
    openWin: 50,
  });

  assert.equal(overlay.phase, "decision");
  assert.equal(overlay.title, "Bleibst du Schaf oder wirst du Löwe?");
  assert.equal(overlay.amount, "50,00 GIL");
  assert.equal(overlay.options[0].symbolId, "sheep");
  assert.equal(overlay.options[1].symbolId, "lion");
});

test("safe risk result keeps the sheep framing and secured-win copy", () => {
  const overlay = createRiskResultOverlay(
    { symbolId: "white-wolf", symbolLabel: "Poly", openWin: 50 },
    { creditedWin: 50, outcome: "safe" },
  );

  assert.equal(overlay.phase, "result");
  assert.equal(overlay.variant, "safe");
  assert.equal(overlay.heroSymbolId, "sheep");
  assert.equal(overlay.title, "Sicher ist sicher.");
  assert.equal(overlay.detail, "Poly wurde direkt gesichert und gutgeschrieben.");
});

test("lion win result celebrates the doubled payout", () => {
  const overlay = createRiskResultOverlay(
    { symbolId: "lion", symbolLabel: "Löwe", openWin: 100 },
    { creditedWin: 200, outcome: "lion-win" },
  );

  assert.equal(overlay.variant, "lion-win");
  assert.equal(overlay.heroSymbolId, "lion");
  assert.equal(overlay.title, "Der Löwe brüllt!");
  assert.equal(overlay.amount, "200,00 GIL");
  assert.equal(overlay.detail, "Gewinn verdoppelt. Der Risiko-Spin hat gehalten.");
});

test("lion loss result keeps the drama visible in the overlay", () => {
  const overlay = createRiskResultOverlay(
    { symbolId: "jackpot", symbolLabel: "Jackpot", openWin: 1250000 },
    { creditedWin: 0, outcome: "lion-loss" },
  );

  assert.equal(overlay.variant, "lion-loss");
  assert.equal(overlay.heroSymbolId, "sheep");
  assert.equal(overlay.title, "Du warst nur ein Schaf im Löwenfell.");
  assert.equal(overlay.amount, "0,00 GIL");
  assert.equal(overlay.detail, "Jackpot war da, aber der offene Gewinn ist komplett verfallen.");
});
