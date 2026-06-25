import assert from "node:assert/strict";
import test from "node:test";

import {
  appendWheelResult,
  createWheelResult,
  getWheelAudioLabel,
  getRemainingSpinsLabel,
  TOTAL_WHEEL_SPINS,
  WHEEL_PRIZE_BOARD,
  WHEEL_PRIZES,
} from "./wheelGameModel.js";

test("wheel prizes use the fixed Final Fantasy XIV fulfillment labels", () => {
  assert.deepEqual(WHEEL_PRIZES, {
    "blonde-cat": "Glam-Item",
    "dark-wolf": "Chocobo-Sattel (Auswahl 100er Trials)",
    "pink-elf": "33 Flasks nach Wahl",
    "blonde-heart": "50 Bufffood",
    "white-wolf": "100.000 GIL",
    sheep: "Niete",
    lion: "333.000 GIL",
    jackpot: "1.250.000 GIL",
  });
});

test("wheel prizes are frozen", () => {
  assert.equal(Object.isFrozen(WHEEL_PRIZES), true);
});

test("prize board exposes every fixed prize in display order", () => {
  assert.deepEqual(WHEEL_PRIZE_BOARD, [
    { id: "jackpot", label: "Jackpot", prize: "1.250.000 GIL" },
    { id: "lion", label: "Löwe", prize: "333.000 GIL" },
    { id: "white-wolf", label: "Poly", prize: "100.000 GIL" },
    { id: "blonde-cat", label: "Turri", prize: "Glam-Item" },
    {
      id: "dark-wolf",
      label: "Alucard",
      prize: "Chocobo-Sattel (Auswahl 100er Trials)",
    },
    { id: "pink-elf", label: "Eden", prize: "33 Flasks nach Wahl" },
    { id: "blonde-heart", label: "Ashelia", prize: "50 Bufffood" },
    { id: "sheep", label: "Schaf", prize: "Niete" },
  ]);
  assert.equal(Object.isFrozen(WHEEL_PRIZE_BOARD), true);
  assert.equal(WHEEL_PRIZE_BOARD.every(Object.isFrozen), true);
});

test("createWheelResult returns display data and the matching prize", () => {
  const result = createWheelResult({
    id: "pink-elf",
    label: "Eden",
    src: "/assets/pink-elf.png",
  });

  assert.deepEqual(result, {
    id: "pink-elf",
    label: "Eden",
    prize: "33 Flasks nach Wahl",
    src: "/assets/pink-elf.png",
    isBlank: false,
  });
});

test("createWheelResult marks the sheep result as blank", () => {
  const result = createWheelResult({
    id: "sheep",
    label: "Schaf",
    src: "/assets/sheep.png",
  });

  assert.deepEqual(result, {
    id: "sheep",
    label: "Schaf",
    prize: "Niete",
    src: "/assets/sheep.png",
    isBlank: true,
  });
});

test("createWheelResult throws for an unknown segment id", () => {
  assert.throws(
    () =>
      createWheelResult({
        id: "unknown-segment",
        label: "Unknown",
        src: "/assets/unknown.png",
      }),
    /unknown-segment/,
  );
});

test("appendWheelResult returns a new array without changing input history", () => {
  const first = createWheelResult({
    id: "pink-elf",
    label: "Eden",
    src: "/assets/pink-elf.png",
  });
  const history = [first];
  const second = createWheelResult({
    id: "lion",
    label: "Loewe",
    src: "/assets/lion.png",
  });

  const updatedHistory = appendWheelResult(history, second);

  assert.notStrictEqual(updatedHistory, history);
  assert.deepEqual(history, [first]);
  assert.deepEqual(updatedHistory, [first, second]);
});

test("appendWheelResult stores a frozen copy of mutable results", () => {
  const result = {
    id: "lion",
    label: "Loewe",
    prize: "333.000 GIL",
    src: "/assets/lion.png",
    isBlank: false,
  };

  const history = appendWheelResult([], result);
  result.prize = "changed";

  assert.notStrictEqual(history[0], result);
  assert.equal(Object.isFrozen(history[0]), true);
  assert.equal(history[0].prize, "333.000 GIL");
});

test("appendWheelResult returns the same array after three confirmed results", () => {
  const first = { id: "pink-elf" };
  const second = { id: "lion" };
  const third = { id: "sheep" };
  const fourth = { id: "jackpot" };

  const oneResult = appendWheelResult([], first);
  const twoResults = appendWheelResult(oneResult, second);
  const threeResults = appendWheelResult(twoResults, third);
  const unchangedHistory = appendWheelResult(threeResults, fourth);

  assert.strictEqual(unchangedHistory, threeResults);
});

test("wheel sessions allow exactly three spins", () => {
  assert.equal(TOTAL_WHEEL_SPINS, 3);
});

test("audio label describes the action the button performs", () => {
  assert.equal(getWheelAudioLabel(true), "Ton einschalten");
  assert.equal(getWheelAudioLabel(false), "Ton ausschalten");
});

test("remaining spin label uses correct German singular and plural", () => {
  assert.equal(getRemainingSpinsLabel(0), "0 Drehungen übrig");
  assert.equal(getRemainingSpinsLabel(1), "1 Drehung übrig");
  assert.equal(getRemainingSpinsLabel(2), "2 Drehungen übrig");
});
