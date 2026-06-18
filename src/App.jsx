import { useEffect, useMemo, useRef, useState } from "react";

import blondeCatGirl from "./assets/blonde-cat-girl-cut.png";
import blondeHeartGirl from "./assets/blonde-heart-girl-cut.png";
import jackpotGoldBoy from "./assets/jackpot-gold-boy.png";
import lionEmblem from "./assets/lion-emblem-new.png";
import pinkElfGirl from "./assets/pink-elf-girl-clean.png";
import sheepSymbol from "./assets/sheep-symbol-new-cut.png";
import whiteWolfBoy from "./assets/white-wolf-boy-cut.png";
import darkWolfFullCut from "./assets/dark-wolf-full-cut.png";

const numberFormatter = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const JACKPOT_AMOUNT = 1250000;
const lineOptions = [5, 10, 15, 20, 25];
const betOptions = [0.5, 1, 2.5, 5, 10];

const symbols = [
  {
    id: "dark-wolf",
    label: "Alucard",
    payout: 750,
    kind: "image",
    src: darkWolfFullCut,
  },
  {
    id: "blonde-cat",
    label: "Turri",
    payout: 400,
    kind: "image",
    src: blondeCatGirl,
  },
  {
    id: "blonde-heart",
    label: "Ashelia",
    payout: 350,
    kind: "image",
    src: blondeHeartGirl,
  },
  {
    id: "pink-elf",
    label: "Eden",
    payout: 500,
    kind: "image",
    src: pinkElfGirl,
  },
  {
    id: "white-wolf",
    label: "Poly",
    payout: 1000,
    kind: "image",
    src: whiteWolfBoy,
  },
  {
    id: "lion",
    label: "Löwe",
    payout: 5000,
    kind: "image",
    src: lionEmblem,
  },
  {
    id: "sheep",
    label: "Schaf",
    payout: 50,
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
const payoutBoardSymbols = [
  "jackpot",
  "lion",
  "white-wolf",
  "dark-wolf",
  "pink-elf",
  "blonde-cat",
  "blonde-heart",
  "sheep",
].map((symbolId) => symbolMap[symbolId]);

const normalSymbols = symbols.filter((symbol) => symbol.id !== "jackpot");
const spinningSymbols = symbols;
const featuredSymbols = symbols.filter(
  (symbol) => symbol.id !== "sheep" && symbol.id !== "jackpot",
);
const normalSymbolIds = normalSymbols.map((symbol) => symbol.id);
const spinningSymbolIds = spinningSymbols.map((symbol) => symbol.id);

function formatCurrency(value) {
  return `€ ${numberFormatter.format(value)}`;
}

function formatGil(value) {
  return `${numberFormatter.format(value)} GIL`;
}

function formatSymbolPayout(symbol) {
  return formatGil(symbol.payout);
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

function getScriptedOutcome() {
  const roll = Math.random();

  if (roll < 0.005) {
    return ["jackpot", "jackpot", "jackpot"];
  }

  if (roll < 0.025) {
    return ["lion", "lion", "lion"];
  }

  if (roll < 0.045) {
    return ["white-wolf", "white-wolf", "white-wolf"];
  }

  if (roll < 0.065) {
    return ["dark-wolf", "dark-wolf", "dark-wolf"];
  }

  if (roll < 0.085) {
    return ["blonde-cat", "blonde-cat", "blonde-cat"];
  }

  if (roll < 0.105) {
    return ["pink-elf", "pink-elf", "pink-elf"];
  }

  if (roll < 0.125) {
    return ["blonde-heart", "blonde-heart", "blonde-heart"];
  }

  if (roll < 0.145) {
    return ["sheep", "sheep", "sheep"];
  }

  if (roll < 0.38) {
    return getNearMissOutcome();
  }

  return getMixedOutcome();
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

function PayoutBoard() {
  return (
    <section aria-label="Auszahlungstafel" className="payout-board">
      <div className="payout-board-header">
        <h2>Auszahlungstafel</h2>
        <p>Gewinn bei 3 gleichen Symbolen auf der mittleren Linie</p>
      </div>

      <div className="payout-board-list">
        {payoutBoardSymbols.map((symbol) => (
          <article className="payout-board-row" key={symbol.id}>
            <div className="payout-board-symbol">
              <SymbolArt compact symbol={symbol} />
            </div>
            <div className="payout-board-copy">
              <strong>{symbol.label}</strong>
              <span>3x Symbol</span>
            </div>
            <div className="payout-board-value">{formatSymbolPayout(symbol)}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function App() {
  const [reels, setReels] = useState([getRandomRows(), getRandomRows(), getRandomRows()]);
  const [balance, setBalance] = useState(2850);
  const [lastWin, setLastWin] = useState(750);
  const [lines, setLines] = useState(25);
  const [bet, setBet] = useState(2.5);
  const [isSpinning, setIsSpinning] = useState(false);
  const [activeMessage, setActiveMessage] = useState("Zeig, auf welcher Seite du stehst.");
  const [isJackpot, setIsJackpot] = useState(false);
  const timersRef = useRef([]);
  const intervalsRef = useRef([]);

  const totalStake = useMemo(() => bet * (lines / 5), [bet, lines]);

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

  function cycleLines(direction) {
    setLines((current) => {
      const currentIndex = lineOptions.indexOf(current);
      const nextIndex =
        direction > 0
          ? Math.min(lineOptions.length - 1, currentIndex + 1)
          : Math.max(0, currentIndex - 1);

      return lineOptions[nextIndex];
    });
  }

  function cycleBet(direction) {
    setBet((current) => {
      const currentIndex = betOptions.indexOf(current);
      const nextIndex =
        direction > 0
          ? Math.min(betOptions.length - 1, currentIndex + 1)
          : Math.max(0, currentIndex - 1);

      return betOptions[nextIndex];
    });
  }

  function resolveSpin(outcome) {
    const winningSymbol = outcome.every((symbolId) => symbolId === outcome[0]) ? symbolMap[outcome[0]] : null;

    if (!winningSymbol) {
      setLastWin(0);
      setActiveMessage("Kein Dreier. Noch einmal drehen.");
      setIsJackpot(false);
      return;
    }

    const multiplier = (lines / 25) * (bet / 2.5);
    const payout = Math.round(winningSymbol.payout * Math.max(1, multiplier));

    setBalance((current) => current + payout);
    setLastWin(payout);

    if (winningSymbol.id === "jackpot") {
      setActiveMessage("Mega Jackpot geknackt.");
      setIsJackpot(true);
      return;
    }

    setActiveMessage(`Dreier auf ${winningSymbol.label}.`);
    setIsJackpot(false);
  }

  function spin() {
    if (isSpinning) {
      return;
    }

    if (balance < totalStake) {
      setActiveMessage("Zu wenig Guthaben für diese Runde.");
      setIsJackpot(false);
      return;
    }

    clearSpinHandles();
    setBalance((current) => current - totalStake);
    setIsSpinning(true);
    setIsJackpot(false);
    setActiveMessage("Die Walzen laufen...");

    const outcome = getScriptedOutcome();
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
      resolveSpin(outcome);
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
            <p>{activeMessage}</p>
          </div>

          <div className={`desktop-machine-shell ${isJackpot ? "is-jackpot" : ""}`}>
            <div className="desktop-jackpot-bar">
              <span>Mega Jackpot</span>
              <strong>{formatGil(JACKPOT_AMOUNT)}</strong>
            </div>

            <div className="desktop-slot-stack">
              <ReelWindow isSpinning={isSpinning} reels={reels} />

              <button
                aria-label="Spielen"
                className="desktop-spin-button"
                disabled={isSpinning}
                onClick={spin}
                type="button"
              >
                {isSpinning ? "Dreht..." : "Spielen"}
              </button>
            </div>

            <PayoutBoard />
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
            Geburtstags-Slot im Rot-Gold-Look mit echten Charakter-Motiven, Löwe, Schaf und
            eigenem Jackpot.
          </p>
        </header>

        <section className="mobile-machine">
          <div className="mobile-jackpot-bar">
            <span>Mega Jackpot</span>
            <strong>{formatGil(JACKPOT_AMOUNT)}</strong>
          </div>

          <ReelWindow isSpinning={isSpinning} reels={reels} />

          <div className="mobile-actions">
            <div className="control-group">
              <span>Linien</span>
              <div className="control-stepper">
                <button
                  disabled={isSpinning || lines === lineOptions[0]}
                  onClick={() => cycleLines(-1)}
                  type="button"
                >
                  -
                </button>
                <strong>{lines}</strong>
                <button
                  disabled={isSpinning || lines === lineOptions[lineOptions.length - 1]}
                  onClick={() => cycleLines(1)}
                  type="button"
                >
                  +
                </button>
              </div>
            </div>

            <button className="mobile-play" disabled={isSpinning} onClick={spin} type="button">
              {isSpinning ? "Walzen drehen..." : "Jetzt spielen"}
            </button>

            <div className="control-group">
              <span>Einsatz</span>
              <div className="control-stepper">
                <button
                  disabled={isSpinning || bet === betOptions[0]}
                  onClick={() => cycleBet(-1)}
                  type="button"
                >
                  -
                </button>
                <strong>{formatCurrency(bet)}</strong>
                <button
                  disabled={isSpinning || bet === betOptions[betOptions.length - 1]}
                  onClick={() => cycleBet(1)}
                  type="button"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mobile-metrics">
          <article>
            <span>Guthaben</span>
            <strong>{formatCurrency(balance)}</strong>
          </article>
          <article>
            <span>Letzter Gewinn</span>
            <strong>{formatCurrency(lastWin)}</strong>
          </article>
          <article>
            <span>Rundeneinsatz</span>
            <strong>{formatCurrency(totalStake)}</strong>
          </article>
        </section>

        <section className={`mobile-status-panel ${isJackpot ? "is-jackpot" : ""}`}>
          <h2>{activeMessage}</h2>
          <p>Jackpot nur mit drei goldenen High-Roller-Motiven auf der mittleren Gewinnlinie.</p>
        </section>

        <PayoutBoard />
      </section>
    </main>
  );
}
