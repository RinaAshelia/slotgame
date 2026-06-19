import { useEffect, useMemo, useRef, useState } from "react";

import blondeCatGirl from "./assets/blonde-cat-girl-cut.png";
import blondeHeartGirl from "./assets/blonde-heart-girl-cut.png";
import jackpotGoldBoy from "./assets/jackpot-gold-boy.png";
import lionEmblem from "./assets/lion-emblem-new.png";
import pinkElfGirl from "./assets/pink-elf-girl-clean.png";
import sheepSymbol from "./assets/sheep-symbol-new-cut.png";
import whiteWolfBoy from "./assets/white-wolf-boy-cut.png";
import darkWolfFullCut from "./assets/dark-wolf-full-cut.png";
import {
  BASE_SYMBOL_PAYOUTS,
  BET_OPTIONS,
  JACKPOT_AMOUNT,
  getOutcomeKind,
  getRoundStake,
  getSymbolPayout,
  qualifiesForRiskChoice,
  resolveRiskChoice,
} from "./gameMath.js";

const numberFormatter = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const symbols = [
  {
    id: "dark-wolf",
    label: "Alucard",
    payout: BASE_SYMBOL_PAYOUTS["dark-wolf"],
    kind: "image",
    src: darkWolfFullCut,
  },
  {
    id: "blonde-cat",
    label: "Turri",
    payout: BASE_SYMBOL_PAYOUTS["blonde-cat"],
    kind: "image",
    src: blondeCatGirl,
  },
  {
    id: "blonde-heart",
    label: "Ashelia",
    payout: BASE_SYMBOL_PAYOUTS["blonde-heart"],
    kind: "image",
    src: blondeHeartGirl,
  },
  {
    id: "pink-elf",
    label: "Eden",
    payout: BASE_SYMBOL_PAYOUTS["pink-elf"],
    kind: "image",
    src: pinkElfGirl,
  },
  {
    id: "white-wolf",
    label: "Poly",
    payout: BASE_SYMBOL_PAYOUTS["white-wolf"],
    kind: "image",
    src: whiteWolfBoy,
  },
  {
    id: "lion",
    label: "Löwe",
    payout: BASE_SYMBOL_PAYOUTS.lion,
    kind: "image",
    src: lionEmblem,
  },
  {
    id: "sheep",
    label: "Schaf",
    payout: BASE_SYMBOL_PAYOUTS.sheep,
    kind: "image",
    src: sheepSymbol,
  },
  {
    id: "jackpot",
    label: "Jackpot",
    payout: JACKPOT_AMOUNT,
    kind: "image",
    src: jackpotGoldBoy,
  },
];

const symbolMap = Object.fromEntries(symbols.map((symbol) => [symbol.id, symbol]));
const payoutBoardSections = [
  {
    id: "top",
    title: "Top Treffer",
    subtitle: "Die großen Sprünge mit klarer Symbolleiter.",
    symbolIds: ["jackpot", "lion", "white-wolf", "dark-wolf"],
  },
  {
    id: "mid",
    title: "Solide Gewinne",
    subtitle: "Spürbar besser als nur Einsatz zurück.",
    symbolIds: ["pink-elf", "blonde-cat", "blonde-heart"],
  },
  {
    id: "return",
    title: "Sicherheitsnetz",
    subtitle: "Der kleine Rettungsanker für schwächere Runden.",
    symbolIds: ["sheep"],
  },
].map((section) => ({
  ...section,
  symbols: section.symbolIds.map((symbolId) => symbolMap[symbolId]),
}));
const premiumPayoutIds = new Set(["jackpot", "lion", "white-wolf", "dark-wolf"]);

const normalSymbols = symbols.filter((symbol) => symbol.id !== "jackpot");
const spinningSymbols = symbols;
const featuredSymbols = symbols.filter(
  (symbol) => symbol.id !== "sheep" && symbol.id !== "jackpot",
);
const normalSymbolIds = normalSymbols.map((symbol) => symbol.id);
const spinningSymbolIds = spinningSymbols.map((symbol) => symbol.id);

function formatGil(value) {
  return `${numberFormatter.format(value)} GIL`;
}

function getRowsForSymbol(symbolId, pool = normalSymbolIds) {
  const centerIndex = pool.indexOf(symbolId);
  const safeCenter = centerIndex === -1 ? 0 : centerIndex;
  const previousIndex = (safeCenter + pool.length - 1) % pool.length;
  const nextIndex = (safeCenter + 1) % pool.length;

  return [pool[previousIndex], pool[safeCenter], pool[nextIndex]];
}

function getRandomRows(includeJackpot = false) {
  const pool = includeJackpot ? spinningSymbolIds : normalSymbolIds;
  const center = pool[Math.floor(Math.random() * pool.length)];
  return getRowsForSymbol(center, pool);
}

function getStoppedRows(symbolId) {
  const topPool = spinningSymbolIds.filter((candidate) => candidate !== symbolId);
  const bottomPool = spinningSymbolIds.filter((candidate) => candidate !== symbolId);
  const top = topPool[Math.floor(Math.random() * topPool.length)];
  const bottom = bottomPool[Math.floor(Math.random() * bottomPool.length)];

  return [top, symbolId, bottom];
}

function getMixedOutcome() {
  const pool = featuredSymbols.map((symbol) => symbol.id);
  const picks = new Set();

  while (picks.size < 3) {
    const next = pool[Math.floor(Math.random() * pool.length)];
    picks.add(next);
  }

  return Array.from(picks);
}

function getNearMissOutcome() {
  const pool = normalSymbols.map((symbol) => symbol.id);
  const primary = pool[Math.floor(Math.random() * pool.length)];
  const alternatives = pool.filter((symbolId) => symbolId !== primary);
  const secondary = alternatives[Math.floor(Math.random() * alternatives.length)];
  const outcome = [primary, primary, secondary];

  return outcome.sort(() => Math.random() - 0.5);
}

function getPayoutDescription(symbolId, bet) {
  if (symbolId === "jackpot") {
    return "Fixer Hauptgewinn";
  }

  if (symbolId === "sheep") {
    return `Einsatz zurück: ${formatGil(bet)}`;
  }

  return "3x Symbol auf der Mitte";
}

function SymbolArt({ symbol, compact = false }) {
  return (
    <img
      alt={symbol.label}
      className={`symbol-image ${compact ? "is-compact" : ""}`}
      src={symbol.src}
    />
  );
}

function ReelWindow({ reels, isSpinning, compact = false }) {
  return (
    <div className={`reel-window ${compact ? "is-compact" : ""} ${isSpinning ? "is-spinning" : ""}`}>
      <div className="payline" />
      {reels.map((rows, reelIndex) => (
        <div className="reel-strip" key={`reel-${reelIndex}`}>
          {rows.map((symbolId, rowIndex) => {
            const symbol = symbolMap[symbolId];

            return (
              <div
                className={`symbol-card ${rowIndex === 1 ? "is-center" : ""}`}
                key={`${reelIndex}-${rowIndex}-${symbolId}`}
              >
                <SymbolArt compact={compact} symbol={symbol} />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function PayoutBoard({ bet, highlightedSymbolId }) {
  return (
    <section aria-label="Auszahlungstafel" className="payout-board">
      <div className="payout-board-header">
        <div>
          <h2>Auszahlungstafel</h2>
          <p>Alle Gewinne gelten für 3 gleiche Symbole auf der mittleren Linie.</p>
        </div>
        <strong className="payout-board-bet">Aktuell bei {formatGil(bet)} Einsatz</strong>
      </div>

      <div className="payout-board-groups">
        {payoutBoardSections.map((section) => (
          <div className="payout-board-group" key={section.id}>
            <div className="payout-board-group-header">
              <strong>{section.title}</strong>
              <span>{section.subtitle}</span>
            </div>

            <div className="payout-board-list">
              {section.symbols.map((symbol) => (
                <article
                  className={`payout-board-row ${premiumPayoutIds.has(symbol.id) ? "is-premium" : ""} ${
                    highlightedSymbolId === symbol.id ? "is-active" : ""
                  }`}
                  key={symbol.id}
                >
                  <div className="payout-board-symbol">
                    <SymbolArt compact symbol={symbol} />
                  </div>
                  <div className="payout-board-copy">
                    <strong>{symbol.label}</strong>
                    <span>{getPayoutDescription(symbol.id, bet)}</span>
                  </div>
                  <div className="payout-board-value">{formatGil(getSymbolPayout(symbol.id, bet))}</div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StepperControl({
  decrementDisabled,
  incrementDisabled,
  label,
  onDecrement,
  onIncrement,
  value,
}) {
  return (
    <div className="control-group">
      <span>{label}</span>
      <div className="control-stepper">
        <button disabled={decrementDisabled} onClick={onDecrement} type="button">
          -
        </button>
        <strong>{value}</strong>
        <button disabled={incrementDisabled} onClick={onIncrement} type="button">
          +
        </button>
      </div>
    </div>
  );
}

function SpinButton({ className, disabled, isSpinning, onClick, stake }) {
  return (
    <button aria-label="Spielen" className={className} disabled={disabled} onClick={onClick} type="button">
      <span>{isSpinning ? "Dreht..." : "Spielen"}</span>
      <small>{formatGil(stake)} pro Dreh</small>
    </button>
  );
}

function RoundBrief({ bet, isJackpot, status }) {
  return (
    <section className={`round-brief ${isJackpot ? "is-jackpot" : ""} is-${status.tone}`}>
      <div className="round-brief-status">
        <span className="round-brief-eyebrow">Rundenstatus</span>
        <h2>{status.title}</h2>
        <p>{status.detail}</p>
      </div>

      <div className="round-brief-rules">
        <span className="round-brief-eyebrow">Direkt erklärt</span>
        <div className="round-brief-chips">
          <span>3 gleiche Symbole auf der Mitte</span>
          <span>3x Schaf = {formatGil(bet)}</span>
          <span>10x+ Gewinn = Schaf oder Loewe</span>
          <span>Jackpot bleibt {formatGil(JACKPOT_AMOUNT)}</span>
        </div>
      </div>
    </section>
  );
}

function MetricsPanel({ balance, className = "", lastWin, totalStake }) {
  const metrics = [
    { label: "Guthaben", value: formatGil(balance), modifier: "is-balance" },
    { label: "Rundeneinsatz", value: formatGil(totalStake), modifier: "is-stake" },
    {
      label: "Letzter Gewinn",
      value: formatGil(lastWin),
      modifier: lastWin > 0 ? "is-win" : "is-muted",
    },
  ];

  return (
    <section className={className}>
      {metrics.map((metric) => (
        <article className={`metric-card ${metric.modifier}`} key={metric.label}>
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
        </article>
      ))}
    </section>
  );
}

export function App() {
  const [reels, setReels] = useState([getRandomRows(), getRandomRows(), getRandomRows()]);
  const [balance, setBalance] = useState(400);
  const [lastWin, setLastWin] = useState(0);
  const [bet, setBet] = useState(2.5);
  const [isSpinning, setIsSpinning] = useState(false);
  const [pendingRiskChoice, setPendingRiskChoice] = useState(null);
  const [isResolvingRiskChoice, setIsResolvingRiskChoice] = useState(false);
  const [status, setStatus] = useState({
    title: "Drei gleiche in der Mitte gewinnen.",
    detail: "Das Schaf bringt exakt deinen Einsatz zurück. Große Treffer ab 10x Einsatz gehen erst in die Risikoentscheidung.",
    tone: "ready",
  });
  const [isJackpot, setIsJackpot] = useState(false);
  const [highlightedSymbolId, setHighlightedSymbolId] = useState(null);
  const timersRef = useRef([]);
  const intervalsRef = useRef([]);
  const riskResolutionGuardRef = useRef(false);

  const totalStake = useMemo(() => getRoundStake(bet), [bet]);
  const hasPendingRiskChoice = Boolean(pendingRiskChoice);

  useEffect(() => {
    return () => {
      intervalsRef.current.forEach((intervalId) => window.clearInterval(intervalId));
      timersRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, []);

  function clearSpinHandles() {
    intervalsRef.current.forEach((intervalId) => window.clearInterval(intervalId));
    timersRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    intervalsRef.current = [];
    timersRef.current = [];
  }

  function cycleBet(direction) {
    setBet((current) => {
      const currentIndex = BET_OPTIONS.indexOf(current);
      const nextIndex =
        direction > 0
          ? Math.min(BET_OPTIONS.length - 1, currentIndex + 1)
          : Math.max(0, currentIndex - 1);

      return BET_OPTIONS[nextIndex];
    });
  }

  function resolveSpin(outcome, spinContext) {
    const { stake } = spinContext;
    const winningSymbol = outcome.every((symbolId) => symbolId === outcome[0]) ? symbolMap[outcome[0]] : null;

    if (!winningSymbol) {
      setLastWin(0);
      setPendingRiskChoice(null);
      setIsResolvingRiskChoice(false);
      riskResolutionGuardRef.current = false;
      setStatus({
        title: "Kein Treffer.",
        detail: `Mit ${formatGil(stake)} Einsatz hat diesmal nichts verbunden.`,
        tone: "loss",
      });
      setIsJackpot(false);
      setHighlightedSymbolId(null);
      return;
    }

    const payout = getSymbolPayout(winningSymbol.id, stake);

    if (qualifiesForRiskChoice(payout, stake)) {
      setLastWin(0);
      setIsResolvingRiskChoice(false);
      riskResolutionGuardRef.current = false;
      setPendingRiskChoice({
        symbolId: winningSymbol.id,
        symbolLabel: winningSymbol.label,
        openWin: payout,
      });
      setHighlightedSymbolId(winningSymbol.id);
      setStatus({
        title: `${winningSymbol.label} bringt ${formatGil(payout)}.`,
        detail: "Der Gewinn ist noch offen. Jetzt entscheidest du zwischen Schaf und Loewe.",
        tone: "risk",
      });
      setIsJackpot(winningSymbol.id === "jackpot");
      return;
    }

    setBalance((current) => current + payout);
    setLastWin(payout);
    setPendingRiskChoice(null);
    setIsResolvingRiskChoice(false);
    riskResolutionGuardRef.current = false;
    setHighlightedSymbolId(winningSymbol.id);

    if (winningSymbol.id === "jackpot") {
      setStatus({
        title: "Mega Jackpot!",
        detail: "Drei Jackpot-Symbole holen den fixen Hauptgewinn auf der mittleren Linie.",
        tone: "jackpot",
      });
      setIsJackpot(true);
      return;
    }

    setStatus({
      title: `${winningSymbol.label} zahlt ${formatGil(payout)}.`,
      detail: `Drei gleiche auf der mittleren Linie bei ${formatGil(stake)} Einsatz.`,
      tone: "win",
    });
    setIsJackpot(false);
  }

  function handleRiskDecision(takeSafe) {
    if (riskResolutionGuardRef.current || !pendingRiskChoice) {
      return;
    }

    riskResolutionGuardRef.current = true;
    setIsResolvingRiskChoice(true);

    const choice = pendingRiskChoice;
    const result = resolveRiskChoice(choice.openWin, { takeSafe });
    setBalance((current) => current + result.creditedWin);
    setLastWin(result.creditedWin);
    setPendingRiskChoice(null);
    setIsResolvingRiskChoice(false);
    riskResolutionGuardRef.current = false;
    setIsJackpot(choice.symbolId === "jackpot" && result.creditedWin > 0);

    if (result.outcome === "safe") {
      setStatus({
        title: `Schaf nimmt ${formatGil(result.creditedWin)} mit.`,
        detail: `${choice.symbolLabel} bleibt sicher ausgezahlt.`,
        tone: choice.symbolId === "jackpot" ? "jackpot" : "win",
      });
      return;
    }

    if (result.outcome === "lion-win") {
      setStatus({
        title: `Loewe verdoppelt auf ${formatGil(result.creditedWin)}.`,
        detail: `${choice.symbolLabel} wurde aggressiv weitergespielt und hat gehalten.`,
        tone: choice.symbolId === "jackpot" ? "jackpot" : "win",
      });
      return;
    }

    setStatus({
      title: "Loewe verliert den offenen Gewinn.",
      detail: `${choice.symbolLabel} war da, aber die Risikoentscheidung hat nichts gesichert.`,
      tone: "loss",
    });
  }

  function buildOutcome(outcomeKind) {
    if (outcomeKind === "near-miss") {
      return getNearMissOutcome();
    }

    if (outcomeKind === "mixed") {
      return getMixedOutcome();
    }

    return [outcomeKind, outcomeKind, outcomeKind];
  }

  function spin() {
    if (isSpinning || hasPendingRiskChoice) {
      return;
    }

    const stake = getRoundStake(bet);

    if (stake <= 0 || balance < stake) {
      setStatus({
        title: "Zu wenig Guthaben.",
        detail: "Reduziere den Einsatz oder triff erst wieder einen Gewinn.",
        tone: "loss",
      });
      setIsJackpot(false);
      setHighlightedSymbolId(null);
      return;
    }

    clearSpinHandles();
    setBalance((current) => current - stake);
    setIsSpinning(true);
    setIsJackpot(false);
    setHighlightedSymbolId(null);
    setStatus({
      title: "Walzen laufen.",
      detail: `${formatGil(stake)} Einsatz ist jetzt auf der mittleren Linie im Spiel.`,
      tone: "spinning",
    });

    const outcome = buildOutcome(getOutcomeKind(Math.random()));
    const nextReels = [getRandomRows(true), getRandomRows(true), getRandomRows(true)];
    setReels(nextReels);

    outcome.forEach((symbolId, reelIndex) => {
      const intervalId = window.setInterval(() => {
        setReels((current) =>
          current.map((rows, index) => (index === reelIndex ? getRandomRows(true) : rows)),
        );
      }, 85 + reelIndex * 15);

      intervalsRef.current.push(intervalId);

      const stopTimeout = window.setTimeout(() => {
        window.clearInterval(intervalId);
        setReels((current) =>
          current.map((rows, index) => (index === reelIndex ? getStoppedRows(symbolId) : rows)),
        );
      }, 1100 + reelIndex * 520);

      timersRef.current.push(stopTimeout);
    });

    const endTimeout = window.setTimeout(() => {
      setIsSpinning(false);
      resolveSpin(outcome, { stake });
      clearSpinHandles();
    }, 2800);

    timersRef.current.push(endTimeout);
  }

  return (
    <main className={`app-shell ${isJackpot ? "has-jackpot" : ""}`}>
      <section className="desktop-experience" aria-label="Loewe Slots Desktop-Prototyp">
        <div className="desktop-stage">
          <div className="desktop-title-block">
            <p className="desktop-kicker">Loewe Slots</p>
            <h1>
              Lieber einmal <span>Löwe</span> als immer Schaf
            </h1>
            <p>Klare Mittellinie, sichtbares Risiko und eine Auszahlungstafel, die exakt zum Einsatz passt.</p>
          </div>

          <div className={`desktop-machine-shell ${isJackpot ? "is-jackpot" : ""}`}>
            <div className="desktop-jackpot-bar">
              <span>Mega Jackpot</span>
              <strong>{formatGil(JACKPOT_AMOUNT)}</strong>
            </div>

            <div className="desktop-slot-stack">
              <ReelWindow isSpinning={isSpinning} reels={reels} />

              <div className="desktop-controls">
                <StepperControl
                  decrementDisabled={isSpinning || hasPendingRiskChoice || bet === BET_OPTIONS[0]}
                  incrementDisabled={
                    isSpinning || hasPendingRiskChoice || bet === BET_OPTIONS[BET_OPTIONS.length - 1]
                  }
                  label="Einsatz"
                  onDecrement={() => cycleBet(-1)}
                  onIncrement={() => cycleBet(1)}
                  value={formatGil(bet)}
                />

                <SpinButton
                  className="desktop-spin-button"
                  disabled={isSpinning || hasPendingRiskChoice}
                  isSpinning={isSpinning}
                  onClick={() => spin()}
                  stake={totalStake}
                />
              </div>

              <RoundBrief bet={bet} isJackpot={isJackpot} status={status} />

              <MetricsPanel
                balance={balance}
                className="desktop-metrics"
                lastWin={lastWin}
                totalStake={totalStake}
              />
            </div>

            <PayoutBoard bet={bet} highlightedSymbolId={highlightedSymbolId} />
          </div>
        </div>
      </section>

      <section className="mobile-experience" aria-label="Loewe Slots Mobile-Prototyp">
        <header className="mobile-hero">
          <p className="eyebrow">Bold. Legendär. Unvergesslich.</p>
          <h1>
            Lieber einmal <span>Löwe</span> als immer Schaf
          </h1>
          <p className="subline">
            Eine klare Gewinnlinie, offene Großgewinne und ein fixer Jackpot im Rot-Gold-Look.
          </p>
        </header>

        <section className="mobile-machine">
          <div className="mobile-jackpot-bar">
            <span>Mega Jackpot</span>
            <strong>{formatGil(JACKPOT_AMOUNT)}</strong>
          </div>

          <ReelWindow isSpinning={isSpinning} reels={reels} />

          <div className="mobile-actions">
            <StepperControl
              decrementDisabled={isSpinning || hasPendingRiskChoice || bet === BET_OPTIONS[0]}
              incrementDisabled={
                isSpinning || hasPendingRiskChoice || bet === BET_OPTIONS[BET_OPTIONS.length - 1]
              }
              label="Einsatz"
              onDecrement={() => cycleBet(-1)}
              onIncrement={() => cycleBet(1)}
              value={formatGil(bet)}
            />

            <div className="mobile-action-buttons">
              <SpinButton
                className="mobile-play"
                disabled={isSpinning || hasPendingRiskChoice}
                isSpinning={isSpinning}
                onClick={() => spin()}
                stake={totalStake}
              />
            </div>
          </div>
        </section>

        <RoundBrief bet={bet} isJackpot={isJackpot} status={status} />

        <MetricsPanel balance={balance} className="mobile-metrics" lastWin={lastWin} totalStake={totalStake} />

        <PayoutBoard bet={bet} highlightedSymbolId={highlightedSymbolId} />
      </section>

      {pendingRiskChoice ? (
        <section className="risk-overlay" role="dialog" aria-modal="true" aria-labelledby="risk-title">
          <div className="risk-overlay-card">
            <span className="risk-kicker">Offener Gewinn</span>
            <h2 id="risk-title">Bleibst du Schaf oder wirst du Loewe?</h2>
            <strong>{formatGil(pendingRiskChoice.openWin)}</strong>
            <p>Der Gewinn ist noch nicht gesichert.</p>
            <div className="risk-actions">
              <button disabled={isResolvingRiskChoice} type="button" onClick={() => handleRiskDecision(true)}>
                Sicher nehmen
              </button>
              <button
                className="risk-action-danger"
                disabled={isResolvingRiskChoice}
                type="button"
                onClick={() => handleRiskDecision(false)}
              >
                Einmal Loewe sein
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
