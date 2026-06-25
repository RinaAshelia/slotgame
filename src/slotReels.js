import { FIXED_PAYLINES, JACKPOT_PAYLINE_ID } from "./paylines.js";

export const NORMAL_SYMBOL_IDS = [
  "dark-wolf",
  "blonde-cat",
  "blonde-heart",
  "pink-elf",
  "white-wolf",
  "lion",
  "sheep",
];
export const SPINNING_SYMBOL_IDS = [...NORMAL_SYMBOL_IDS, "jackpot"];
const FEATURED_SYMBOL_IDS = NORMAL_SYMBOL_IDS.filter((symbolId) => symbolId !== "sheep");
const MIXED_OUTCOME_RATE = 0.67;
const DOUBLE_JACKPOT_TEASER_RATE = 0.01 / MIXED_OUTCOME_RATE;
const ANY_JACKPOT_TEASER_RATE = 0.09 / MIXED_OUTCOME_RATE;

function getRandomSymbolId(pool, random) {
  return pool[Math.floor(random() * pool.length)];
}

export function getRowsForSymbol(symbolId, pool = NORMAL_SYMBOL_IDS) {
  const centerIndex = pool.indexOf(symbolId);
  const safeCenter = centerIndex === -1 ? 0 : centerIndex;
  const previousIndex = (safeCenter + pool.length - 1) % pool.length;
  const nextIndex = (safeCenter + 1) % pool.length;

  return [pool[previousIndex], pool[safeCenter], pool[nextIndex]];
}

export function getRandomRows(includeJackpot = false, random = Math.random) {
  const pool = includeJackpot ? SPINNING_SYMBOL_IDS : NORMAL_SYMBOL_IDS;
  return getRowsForSymbol(getRandomSymbolId(pool, random), pool);
}

function buildNonWinningRow(random) {
  const row = [
    getRandomSymbolId(NORMAL_SYMBOL_IDS, random),
    getRandomSymbolId(NORMAL_SYMBOL_IDS, random),
    getRandomSymbolId(NORMAL_SYMBOL_IDS, random),
  ];

  if (row[0] === row[1] && row[1] === row[2]) {
    const alternatives = NORMAL_SYMBOL_IDS.filter((symbolId) => symbolId !== row[0]);
    row[2] = getRandomSymbolId(alternatives, random);
  }

  return row;
}

function rowsToReels(rows) {
  return [0, 1, 2].map((reelIndex) => rows.map((row) => row[reelIndex]));
}

function addJackpotTeaser(rows, teaserRoll, random) {
  if (teaserRoll >= ANY_JACKPOT_TEASER_RATE) {
    return;
  }

  const rowIndex =
    teaserRoll < DOUBLE_JACKPOT_TEASER_RATE ? 1 : Math.floor(random() * rows.length);
  const jackpotCount = teaserRoll < DOUBLE_JACKPOT_TEASER_RATE ? 2 : 1;
  const reelIndexes = [0, 1, 2].sort(() => random() - 0.5).slice(0, jackpotCount);

  reelIndexes.forEach((reelIndex) => {
    rows[rowIndex][reelIndex] = "jackpot";
  });
}

export function createResolvedReels(outcomeKind, options = {}) {
  const { random = Math.random, teaserRoll = random() } = options;
  const rows = [buildNonWinningRow(random), buildNonWinningRow(random), buildNonWinningRow(random)];

  if (outcomeKind === "mixed") {
    addJackpotTeaser(rows, teaserRoll, random);
    return rowsToReels(rows);
  }

  const targetLine =
    outcomeKind === "jackpot"
      ? FIXED_PAYLINES.find((line) => line.id === JACKPOT_PAYLINE_ID)
      : FIXED_PAYLINES[Math.floor(random() * FIXED_PAYLINES.length)];

  if (outcomeKind === "near-miss") {
    const primary = getRandomSymbolId(FEATURED_SYMBOL_IDS, random);
    const alternatives = NORMAL_SYMBOL_IDS.filter((symbolId) => symbolId !== primary);
    const secondary = getRandomSymbolId(alternatives, random);
    rows[targetLine.rowIndex] = [primary, primary, secondary].sort(() => random() - 0.5);
    return rowsToReels(rows);
  }

  rows[targetLine.rowIndex] = [outcomeKind, outcomeKind, outcomeKind];
  return rowsToReels(rows);
}
