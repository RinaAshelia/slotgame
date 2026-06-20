import { useEffect, useMemo, useRef, useState } from "react";

import blondeCatGirl from "./assets/blonde-cat-girl-cut.png";
import blondeHeartGirl from "./assets/blonde-heart-girl-cut.png";
import jackpotGoldBoy from "./assets/jackpot-gold-boy.png";
import lionEmblem from "./assets/lion-emblem-new.png";
import pinkElfGirl from "./assets/pink-elf-girl-clean.png";
import sheepSymbol from "./assets/sheep-symbol-new-cut.png";
import whiteWolfBoy from "./assets/white-wolf-boy-cut.png";
import darkWolfFullCut from "./assets/dark-wolf-full-cut.png";
import { getCueNamesForRiskResult } from "./audioTheme.js";
import { formatGil } from "./formatGil.js";
import { FIXED_PAYLINES, JACKPOT_PAYLINE_ID, evaluatePaylineWins } from "./paylines.js";
import {
  BASE_SYMBOL_PAYOUTS,
  BET_OPTIONS,
  JACKPOT_AMOUNT,
  canOfferRiskChoice,
  getOutcomeKind,
  getRoundStake,
  getSymbolPayout,
  resolveRiskChoice,
} from "./gameMath.js";
import { createRiskDecisionOverlay, createRiskResultOverlay } from "./riskOverlay.js";
import { useSlotAudio } from "./useSlotAudio.js";

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

function getRandomSymbolId(pool = normalSymbolIds) {
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildNonWinningRow(pool = normalSymbolIds) {
  const row = [getRandomSymbolId(pool), getRandomSymbolId(pool), getRandomSymbolId(pool)];

  if (row[0] === row[1] && row[1] === row[2]) {
    const alternatives = pool.filter((symbolId) => symbolId !== row[0]);
    row[2] = alternatives[Math.floor(Math.random() * alternatives.length)];
  }

  return row;
}

function rowsToReels(rows) {
  return [0, 1, 2].map((reelIndex) => rows.map((row) => row[reelIndex]));
}

function createResolvedReels(outcomeKind) {
  const rows = [buildNonWinningRow(), buildNonWinningRow(), buildNonWinningRow()];

  if (outcomeKind === "mixed") {
    return rowsToReels(rows);
  }

  const targetLine =
    outcomeKind === "jackpot"
      ? FIXED_PAYLINES.find((line) => line.id === JACKPOT_PAYLINE_ID)
      : FIXED_PAYLINES[Math.floor(Math.random() * FIXED_PAYLINES.length)];

  if (outcomeKind === "near-miss") {
    const primary = getRandomSymbolId(featuredSymbols.map((symbol) => symbol.id));
    const alternatives = normalSymbolIds.filter((symbolId) => symbolId !== primary);
    const secondary = alternatives[Math.floor(Math.random() * alternatives.length)];
    rows[targetLine.rowIndex] = [primary, primary, secondary].sort(() => Math.random() - 0.5);

    return rowsToReels(rows);
  }

  rows[targetLine.rowIndex] = [outcomeKind, outcomeKind, outcomeKind];
  return rowsToReels(rows);
}

function getPayoutDescription(symbolId, bet) {
  if (symbolId === "jackpot") {
    return "Nur auf der Mitte";
  }

  if (symbolId === "sheep") {
    return "3 feste Reihen: Einsatz zurück";
  }

  return "3x Symbol auf einer festen Reihe";
}

function getLineLocationText(lineId) {
  if (lineId === "top") {
    return "oberen Reihe";
  }

  if (lineId === "bottom") {
    return "unteren Reihe";
  }

  return "mittleren Reihe";
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
      {FIXED_PAYLINES.map((line) => (
        <div className={`payline is-${line.id}`} key={line.id} />
      ))}
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
          <p>Gewinne zählen auf oberer, mittlerer und unterer Reihe. Jackpot nur auf der Mitte.</p>
        </div>
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

function AudioToggleButton({ isMuted, onClick }) {
  return (
    <button
      aria-label={isMuted ? "Sound einschalten" : "Sound stummschalten"}
      className={`audio-toggle ${isMuted ? "is-muted" : ""}`}
      onClick={onClick}
      type="button"
    >
      <span className="audio-toggle-dot" aria-hidden="true" />
      <span>{isMuted ? "Sound aus" : "Sound an"}</span>
    </button>
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
        <span className="round-brief-eyebrow">Status</span>
        <h2>{status.title}</h2>
        <p>{status.detail}</p>
      </div>

      <div className="round-brief-rules">
        <span className="round-brief-eyebrow">Kurzregeln</span>
        <div className="round-brief-chips">
          <span>3 feste Reihen: oben, mitte, unten</span>
          <span>Risiko-Feature möglich bei Premium-Treffern ab 4x Einsatz</span>
          <span>Jackpot nur mittig: {formatGil(JACKPOT_AMOUNT)}</span>
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
  const RISK_SELECTION_DELAY_MS = 240;
  const [reels, setReels] = useState([getRandomRows(), getRandomRows(), getRandomRows()]);
  const [balance, setBalance] = useState(400);
  const [lastWin, setLastWin] = useState(0);
  const [bet, setBet] = useState(2.5);
  const [isSpinning, setIsSpinning] = useState(false);
  const [pendingRiskChoice, setPendingRiskChoice] = useState(null);
  const [riskResultOverlay, setRiskResultOverlay] = useState(null);
  const [isResolvingRiskChoice, setIsResolvingRiskChoice] = useState(false);
  const [status, setStatus] = useState({
    title: "Drei gleiche auf einer festen Reihe gewinnen.",
    detail: "Oben, Mitte und unten zahlen aus. Das Schaf bringt deinen Einsatz zurück, große Treffer ab 4x gehen in die Risikoentscheidung.",
    tone: "ready",
  });
  const [isJackpot, setIsJackpot] = useState(false);
  const [highlightedSymbolId, setHighlightedSymbolId] = useState(null);
  const timersRef = useRef([]);
  const intervalsRef = useRef([]);
  const riskResolutionGuardRef = useRef(false);
  const riskDecisionTimerRef = useRef(null);
  const { isMuted, playCue, startLoop, stopAllLoops, toggleMute } = useSlotAudio();

  const totalStake = useMemo(() => getRoundStake(bet), [bet]);
  const hasRiskOverlay = Boolean(pendingRiskChoice || riskResultOverlay);
  const activeRiskOverlay = pendingRiskChoice
    ? createRiskDecisionOverlay(pendingRiskChoice)
    : riskResultOverlay;

  useEffect(() => {
    return () => {
      if (riskDecisionTimerRef.current) {
        window.clearTimeout(riskDecisionTimerRef.current);
      }

      intervalsRef.current.forEach((intervalId) => window.clearInterval(intervalId));
      timersRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, []);

  function clearSpinHandles() {
    intervalsRef.current.forEach((intervalId) => window.clearInterval(intervalId));
    timersRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    if (riskDecisionTimerRef.current) {
      window.clearTimeout(riskDecisionTimerRef.current);
      riskDecisionTimerRef.current = null;
    }
    intervalsRef.current = [];
    timersRef.current = [];
    stopAllLoops();
  }

  function cycleBet(direction) {
    void playCue("uiClick");
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
    const wins = evaluatePaylineWins(outcome, stake, getSymbolPayout);

    if (wins.length === 0) {
      setLastWin(0);
      setPendingRiskChoice(null);
      setRiskResultOverlay(null);
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

    const primaryWin = wins.reduce((best, current) => (current.payout > best.payout ? current : best), wins[0]);
    const winningSymbol = symbolMap[primaryWin.symbolId];
    const payout = primaryWin.payout;
    const totalPayout = wins.reduce((sum, win) => sum + win.payout, 0);

    if (wins.length === 1 && canOfferRiskChoice(winningSymbol.id, payout, stake)) {
      void playCue(winningSymbol.id === "jackpot" ? "jackpot" : "featureTrigger");
      setLastWin(0);
      setIsResolvingRiskChoice(false);
      riskResolutionGuardRef.current = false;
      setRiskResultOverlay(null);
      setPendingRiskChoice({
        symbolId: winningSymbol.id,
        symbolLabel: winningSymbol.label,
        lineId: primaryWin.lineId,
        lineLabel: primaryWin.lineLabel,
        openWin: payout,
      });
      setHighlightedSymbolId(winningSymbol.id);
      setStatus({
        title: `${winningSymbol.label} trifft auf der ${getLineLocationText(primaryWin.lineId)}.`,
        detail: `${formatGil(payout)} sind offen. Jetzt entscheidest du zwischen Schaf und Löwe.`,
        tone: "risk",
      });
      setIsJackpot(winningSymbol.id === "jackpot");
      return;
    }

    setBalance((current) => current + totalPayout);
    setLastWin(totalPayout);
    setPendingRiskChoice(null);
    setRiskResultOverlay(null);
    setIsResolvingRiskChoice(false);
    riskResolutionGuardRef.current = false;
    setHighlightedSymbolId(winningSymbol.id);

    if (winningSymbol.id === "jackpot" && wins.length === 1) {
      void playCue("jackpot");
      setStatus({
        title: "Mega Jackpot!",
        detail: "Drei Jackpot-Symbole holen den fixen Hauptgewinn nur auf der mittleren Reihe.",
        tone: "jackpot",
      });
      setIsJackpot(true);
      return;
    }

    void playCue("win");
    setStatus({
      title: `${wins.length} Reihen treffen für ${formatGil(totalPayout)}.`,
      detail: wins
        .map((win) => `${win.lineLabel}: ${symbolMap[win.symbolId].label}`)
        .join(" · "),
      tone: "win",
    });
    setIsJackpot(false);
  }

  function handleRiskDecision(takeSafe) {
    if (riskResolutionGuardRef.current || !pendingRiskChoice) {
      return;
    }

    if (takeSafe) {
      void playCue("sheepSelect");
    }

    riskResolutionGuardRef.current = true;
    setIsResolvingRiskChoice(true);

    const choice = pendingRiskChoice;
    riskDecisionTimerRef.current = window.setTimeout(() => {
      const result = resolveRiskChoice(choice.openWin, { takeSafe });
      setBalance((current) => current + result.creditedWin);
      setLastWin(result.creditedWin);
      setPendingRiskChoice(null);
      setRiskResultOverlay(createRiskResultOverlay(choice, result));
      setIsResolvingRiskChoice(false);
      riskResolutionGuardRef.current = false;
      riskDecisionTimerRef.current = null;
      setIsJackpot(choice.symbolId === "jackpot" && result.creditedWin > 0);

      if (result.outcome === "safe") {
        setStatus({
          title: `Schaf nimmt ${formatGil(result.creditedWin)} mit.`,
          detail: `${choice.symbolLabel} auf der ${getLineLocationText(choice.lineId)} bleibt sicher ausgezahlt.`,
          tone: choice.symbolId === "jackpot" ? "jackpot" : "win",
        });
        return;
      }

      if (result.outcome === "lion-win") {
        getCueNamesForRiskResult(result.outcome).forEach((cueName) => {
          void playCue(cueName);
        });
        setStatus({
          title: `Loewe verdoppelt auf ${formatGil(result.creditedWin)}.`,
          detail: `${choice.symbolLabel} auf der ${getLineLocationText(choice.lineId)} wurde aggressiv weitergespielt und hat gehalten.`,
          tone: choice.symbolId === "jackpot" ? "jackpot" : "win",
        });
        return;
      }

      getCueNamesForRiskResult("lion-loss").forEach((cueName) => {
        void playCue(cueName);
      });
      setStatus({
        title: "Loewe verliert den offenen Gewinn.",
        detail: `${choice.symbolLabel} auf der ${getLineLocationText(choice.lineId)} war da, aber die Risikoentscheidung hat nichts gesichert.`,
        tone: "loss",
      });
    }, RISK_SELECTION_DELAY_MS);
  }

  function dismissRiskOverlay() {
    if (isResolvingRiskChoice) {
      return;
    }

    setRiskResultOverlay(null);
  }

  function handleAudioToggle() {
    const wasMuted = isMuted;
    toggleMute();

    if (wasMuted) {
      void playCue("uiClick");
    }
  }

  function spin() {
    if (isSpinning || hasRiskOverlay) {
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
    void playCue("spinStart");
    void startLoop("spinLoop");
    setStatus({
      title: "Walzen laufen.",
      detail: `${formatGil(stake)} Einsatz ist jetzt über drei feste Reihen im Spiel.`,
      tone: "spinning",
    });

    const outcome = createResolvedReels(getOutcomeKind(Math.random(), { stake }));
    const nextReels = [getRandomRows(true), getRandomRows(true), getRandomRows(true)];
    setReels(nextReels);

    outcome.forEach((finalRows, reelIndex) => {
      const intervalId = window.setInterval(() => {
        setReels((current) =>
          current.map((rows, index) => (index === reelIndex ? getRandomRows(true) : rows)),
        );
      }, 85 + reelIndex * 15);

      intervalsRef.current.push(intervalId);

      const stopTimeout = window.setTimeout(() => {
        window.clearInterval(intervalId);
        void playCue("reelStop");
        setReels((current) => current.map((rows, index) => (index === reelIndex ? finalRows : rows)));
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
          <div aria-hidden="true" className="stage-backdrop">
            <div className="stage-backdrop-orb is-left" />
            <div className="stage-backdrop-orb is-right" />
            <div className="stage-backdrop-spotlight" />
            <img
              alt=""
              className="stage-backdrop-jackpot"
              src={jackpotGoldBoy}
            />
          </div>

          <div className="desktop-title-block">
            <div className="title-utility-row">
              <p className="desktop-kicker">Loewe Slots</p>
              <AudioToggleButton isMuted={isMuted} onClick={() => handleAudioToggle()} />
            </div>
            <h1>
              Lieber einmal <span>Löwe</span> als immer Schaf
            </h1>
            <p>Drei feste Reihen, sichtbares Risiko und eine Auszahlungstafel, die exakt zum Einsatz passt.</p>
          </div>

          <div className={`desktop-machine-shell ${isJackpot ? "is-jackpot" : ""}`}>
            <div className="desktop-jackpot-bar">
              <span>Mega Jackpot</span>
              <strong>{formatGil(JACKPOT_AMOUNT)}</strong>
            </div>

            <div className="desktop-slot-stack">
              <div className="desktop-slot-hero">
                <ReelWindow isSpinning={isSpinning} reels={reels} />

                <aside aria-label="Geburtstags-Jackpot" className="desktop-character-stage">
                  <div className="desktop-character-copy">
                    <span>Birthday Jackpot</span>
                    <strong>Der Gastgeber der großen Treffer</strong>
                  </div>
                  <img alt="" className="desktop-character-jackpot" src={jackpotGoldBoy} />
                </aside>
              </div>

              <div className="desktop-controls">
                <StepperControl
                  decrementDisabled={isSpinning || hasRiskOverlay || bet === BET_OPTIONS[0]}
                  incrementDisabled={
                    isSpinning || hasRiskOverlay || bet === BET_OPTIONS[BET_OPTIONS.length - 1]
                  }
                  label="Einsatz"
                  onDecrement={() => cycleBet(-1)}
                  onIncrement={() => cycleBet(1)}
                  value={formatGil(bet)}
                />

                <SpinButton
                  className="desktop-spin-button"
                  disabled={isSpinning || hasRiskOverlay}
                  isSpinning={isSpinning}
                  onClick={() => spin()}
                  stake={totalStake}
                />
              </div>

              <MetricsPanel
                balance={balance}
                className="desktop-metrics"
                lastWin={lastWin}
                totalStake={totalStake}
              />

              <RoundBrief bet={bet} isJackpot={isJackpot} status={status} />
            </div>

            <PayoutBoard bet={bet} highlightedSymbolId={highlightedSymbolId} />
          </div>
        </div>
      </section>

      <section className="mobile-experience" aria-label="Loewe Slots Mobile-Prototyp">
        <header className="mobile-hero">
          <div className="title-utility-row is-mobile">
            <p className="eyebrow">Bold. Legendär. Unvergesslich.</p>
            <AudioToggleButton isMuted={isMuted} onClick={() => handleAudioToggle()} />
          </div>
          <h1>
            Lieber einmal <span>Löwe</span> als immer Schaf
          </h1>
          <p className="subline">
            Drei feste Gewinnreihen, offene Großgewinne und ein fixer Jackpot im Rot-Gold-Look.
          </p>
        </header>

        <section className="mobile-machine">
          <div aria-hidden="true" className="mobile-stage-backdrop">
            <div className="stage-backdrop-spotlight is-mobile" />
          </div>

          <div className="mobile-jackpot-bar">
            <span>Mega Jackpot</span>
            <strong>{formatGil(JACKPOT_AMOUNT)}</strong>
          </div>

          <ReelWindow isSpinning={isSpinning} reels={reels} />

          <div className="mobile-actions">
            <StepperControl
              decrementDisabled={isSpinning || hasRiskOverlay || bet === BET_OPTIONS[0]}
              incrementDisabled={
                isSpinning || hasRiskOverlay || bet === BET_OPTIONS[BET_OPTIONS.length - 1]
              }
              label="Einsatz"
              onDecrement={() => cycleBet(-1)}
              onIncrement={() => cycleBet(1)}
              value={formatGil(bet)}
            />

            <div className="mobile-action-buttons">
              <SpinButton
                className="mobile-play"
                disabled={isSpinning || hasRiskOverlay}
                isSpinning={isSpinning}
                onClick={() => spin()}
                stake={totalStake}
              />
            </div>
          </div>
        </section>

        <MetricsPanel balance={balance} className="mobile-metrics" lastWin={lastWin} totalStake={totalStake} />

        <RoundBrief bet={bet} isJackpot={isJackpot} status={status} />

        <PayoutBoard bet={bet} highlightedSymbolId={highlightedSymbolId} />
      </section>

      {activeRiskOverlay ? (
        <section className="risk-overlay" role="dialog" aria-modal="true" aria-labelledby="risk-title">
          <div
            className={`risk-overlay-card ${
              activeRiskOverlay.phase === "result" ? `is-${activeRiskOverlay.variant}` : ""
            }`}
          >
            <span className="risk-kicker">{activeRiskOverlay.kicker}</span>

            {activeRiskOverlay.phase === "decision" ? (
              <>
                <div className="risk-symbol-duel" aria-hidden="true">
                  {activeRiskOverlay.options.map((option) => (
                    <article
                      className={`risk-symbol-card ${option.symbolId === "lion" ? "is-danger" : ""}`}
                      key={option.symbolId}
                    >
                      <div className="risk-symbol-frame">
                        <SymbolArt compact symbol={symbolMap[option.symbolId]} />
                      </div>
                      <strong>{option.label}</strong>
                      <span>{option.caption}</span>
                    </article>
                  ))}
                </div>

                <h2 id="risk-title">{activeRiskOverlay.title}</h2>
                <div className="risk-amount">{activeRiskOverlay.amount}</div>
                <p>{activeRiskOverlay.detail}</p>
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
                    Einmal Löwe sein
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="risk-result-hero" aria-hidden="true">
                  <div className={`risk-result-emblem is-${activeRiskOverlay.variant}`}>
                    <SymbolArt compact symbol={symbolMap[activeRiskOverlay.heroSymbolId]} />
                  </div>
                </div>

                <h2 id="risk-title">{activeRiskOverlay.title}</h2>
                <div className="risk-amount">{activeRiskOverlay.amount}</div>
                <p>{activeRiskOverlay.detail}</p>
                <button className="risk-result-button" type="button" onClick={() => dismissRiskOverlay()}>
                  {activeRiskOverlay.actionLabel}
                </button>
              </>
            )}
          </div>
        </section>
      ) : null}
    </main>
  );
}
