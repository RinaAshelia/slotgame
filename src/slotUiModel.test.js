import test from "node:test";
import assert from "node:assert/strict";

import { getNextLastWin, getSlotNavigationItems } from "./slotUiModel.js";

test("slot navigation links respect the app base path", () => {
  assert.deepEqual(getSlotNavigationItems("/slotgame/"), [
    { href: "/slotgame/", label: "Start" },
    { href: "/slotgame/wheel", label: "Glücksrad" },
  ]);
});

test("last win remains unchanged when no positive amount is credited", () => {
  assert.equal(getNextLastWin(25, 0), 25);
  assert.equal(getNextLastWin(25, undefined), 25);
});

test("a newly credited positive win replaces the previous last win", () => {
  assert.equal(getNextLastWin(25, 50), 50);
});
