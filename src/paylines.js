export const FIXED_PAYLINES = [
  { id: "top", label: "Obere Reihe", rowIndex: 0 },
  { id: "middle", label: "Mittlere Reihe", rowIndex: 1 },
  { id: "bottom", label: "Untere Reihe", rowIndex: 2 },
];

export const JACKPOT_PAYLINE_ID = "middle";

export function evaluatePaylineWins(reels, stake, getSymbolPayout) {
  return FIXED_PAYLINES.flatMap((line) => {
    const symbolId = reels[0]?.[line.rowIndex];

    if (!symbolId || reels.some((reel) => reel[line.rowIndex] !== symbolId)) {
      return [];
    }

    if (symbolId === "jackpot" && line.id !== JACKPOT_PAYLINE_ID) {
      return [];
    }

    return [
      {
        lineId: line.id,
        lineLabel: line.label,
        payout: getSymbolPayout(symbolId, stake),
        symbolId,
      },
    ];
  });
}
