import { formatGil } from "./formatGil.js";

function getLineOverlayText(lineId) {
  if (lineId === "top") {
    return "auf der oberen Reihe";
  }

  if (lineId === "bottom") {
    return "auf der unteren Reihe";
  }

  if (lineId === "middle") {
    return "auf der mittleren Reihe";
  }

  return "";
}

export function createRiskDecisionOverlay(choice) {
  const lineText = choice.lineId ? ` ${getLineOverlayText(choice.lineId)}` : "";

  return {
    phase: "decision",
    kicker: "Offener Gewinn",
    title: "Bleibst du Schaf oder wirst du Löwe?",
    amount: formatGil(choice.openWin),
    detail: `${choice.symbolLabel}${lineText} bringt ${formatGil(choice.openWin)}. Der Gewinn ist noch nicht gesichert.`,
    options: [
      {
        symbolId: "sheep",
        label: "Schaf",
        caption: "Sicher nehmen und sofort gutschreiben.",
      },
      {
        symbolId: "lion",
        label: "Löwe",
        caption: "50/50 auf doppelt oder komplett weg.",
      },
    ],
  };
}

export function createRiskResultOverlay(choice, result) {
  const lineText = choice.lineId ? ` ${getLineOverlayText(choice.lineId)}` : "";

  if (result.outcome === "safe") {
    return {
      phase: "result",
      variant: "safe",
      kicker: "Schaf-Modus",
      title: "Sicher ist sicher.",
      amount: formatGil(result.creditedWin),
      detail: `${choice.symbolLabel}${lineText} wurde direkt gesichert und gutgeschrieben.`,
      heroSymbolId: "sheep",
      actionLabel: "Weiter spielen",
    };
  }

  if (result.outcome === "lion-win") {
    return {
      phase: "result",
      variant: "lion-win",
      kicker: "Löwe gewinnt",
      title: "Der Löwe brüllt!",
      amount: formatGil(result.creditedWin),
      detail: "Gewinn verdoppelt. Der Risiko-Spin hat gehalten.",
      heroSymbolId: "lion",
      actionLabel: "Weiter spielen",
    };
  }

  return {
      phase: "result",
      variant: "lion-loss",
      kicker: "Löwe verliert",
      title: "Du warst nur ein Schaf im Löwenfell.",
      amount: formatGil(result.creditedWin),
      detail: `${choice.symbolLabel}${lineText} war da, aber der offene Gewinn ist komplett verfallen.`,
      heroSymbolId: "sheep",
      actionLabel: "Weiter spielen",
    };
}
