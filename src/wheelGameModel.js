export const WHEEL_PRIZES = Object.freeze({
  "blonde-cat": "Glam-Item",
  "dark-wolf": "Chocobo-Sattel (Auswahl 100er Trials)",
  "pink-elf": "33 Flasks nach Wahl",
  "blonde-heart": "50 Bufffood",
  "white-wolf": "100.000 GIL",
  sheep: "Niete",
  lion: "333.000 GIL",
  jackpot: "1.250.000 GIL",
});

export const TOTAL_WHEEL_SPINS = 3;

export function createWheelResult(segment) {
  return {
    id: segment.id,
    label: segment.label,
    prize: WHEEL_PRIZES[segment.id],
    src: segment.src,
    isBlank: segment.id === "sheep",
  };
}

export function appendWheelResult(history, result) {
  if (history.length >= TOTAL_WHEEL_SPINS) {
    return history;
  }

  return [...history, result];
}
