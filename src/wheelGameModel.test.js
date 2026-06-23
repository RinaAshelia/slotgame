import assert from "node:assert/strict";
import test from "node:test";

import { WHEEL_PRIZES } from "./wheelGameModel.js";

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
