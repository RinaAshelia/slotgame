import { Fragment, useEffect, useRef, useState } from "react";

import blondeCatGirl from "./assets/blonde-cat-girl-cut.png";
import blondeHeartGirl from "./assets/blonde-heart-girl-cut.png";
import darkWolfFullCut from "./assets/dark-wolf-full-cut.png";
import jackpotGoldBoy from "./assets/jackpot-gold-boy.png";
import lionEmblem from "./assets/lion-emblem-new.png";
import pinkElfGirl from "./assets/pink-elf-girl-clean.png";
import sheepSymbol from "./assets/sheep-symbol-new-cut.png";
import whiteWolfBoy from "./assets/white-wolf-boy-cut.png";
import { useSlotAudio } from "./useSlotAudio.js";
import {
  TOTAL_WHEEL_SPINS,
  WHEEL_PRIZE_BOARD,
  WHEEL_PRIZES,
  appendWheelResult,
  createWheelResult,
  getRemainingSpinsLabel,
  getWheelAudioLabel,
} from "./wheelGameModel.js";
import { getWheelSpinAudioPlan } from "./wheelAudio.js";

const APP_BASE = import.meta.env.BASE_URL || "/";

function buildAppPath(pathname = "") {
  const normalizedBase = APP_BASE.endsWith("/") ? APP_BASE : `${APP_BASE}/`;
  const trimmedPath = pathname.startsWith("/") ? pathname.slice(1) : pathname;
  return `${normalizedBase}${trimmedPath}`;
}

const SEGMENTS = [
  { id: "jackpot", label: "Jackpot", prize: WHEEL_PRIZES.jackpot, src: jackpotGoldBoy, tone: "is-jackpot" },
  { id: "lion", label: "Löwe", prize: WHEEL_PRIZES.lion, src: lionEmblem, tone: "is-lion" },
  { id: "blonde-cat", label: "Turri", prize: WHEEL_PRIZES["blonde-cat"], src: blondeCatGirl, tone: "is-gold" },
  { id: "blonde-heart", label: "Ashelia", prize: WHEEL_PRIZES["blonde-heart"], src: blondeHeartGirl, tone: "is-rose" },
  { id: "pink-elf", label: "Eden", prize: WHEEL_PRIZES["pink-elf"], src: pinkElfGirl, tone: "is-rose" },
  { id: "white-wolf", label: "Poly", prize: WHEEL_PRIZES["white-wolf"], src: whiteWolfBoy, tone: "is-ice" },
  { id: "dark-wolf", label: "Alucard", prize: WHEEL_PRIZES["dark-wolf"], src: darkWolfFullCut, tone: "is-ember" },
  { id: "sheep", label: "Schaf", prize: WHEEL_PRIZES.sheep, src: sheepSymbol, tone: "is-sheep" },
];

const WHEEL_ASSETS = Object.freeze({
  jackpot: jackpotGoldBoy,
  lion: lionEmblem,
  "white-wolf": whiteWolfBoy,
  "blonde-cat": blondeCatGirl,
  "dark-wolf": darkWolfFullCut,
  "pink-elf": pinkElfGirl,
  "blonde-heart": blondeHeartGirl,
  sheep: sheepSymbol,
});

const PRIZE_BOARD_ITEMS = WHEEL_PRIZE_BOARD.map((item) => ({
  ...item,
  src: WHEEL_ASSETS[item.id],
}));

const SPIN_DURATION_MS = 3800;
const RESULT_DELAY_MS = 420;
const POINTER_DEG = 90;
const WHEEL_SIZE = 1000;
const WHEEL_CENTER = WHEEL_SIZE / 2;
const WHEEL_RADIUS = 434;
const SEGMENT_IMAGE_RADIUS = 258;
const SEGMENT_IMAGE_SIZE = 150;
const SEGMENT_LABEL_RADIUS = 358;

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeSectorPath(centerX, centerY, radius, startAngle, endAngle) {
  const start = polarToCartesian(centerX, centerY, radius, endAngle);
  const end = polarToCartesian(centerX, centerY, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    `M ${centerX} ${centerY}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

function getSegmentGradient(segment) {
  if (segment.id === "jackpot") {
    return ["#8a5a09", "#ffd76a"];
  }

  if (segment.id === "lion") {
    return ["#6f0909", "#d9362b"];
  }

  if (segment.id === "blonde-cat") {
    return ["#7a2911", "#ffcf6c"];
  }

  if (segment.id === "blonde-heart") {
    return ["#792952", "#ffb8dc"];
  }

  if (segment.id === "pink-elf") {
    return ["#7d2f53", "#ff9fd0"];
  }

  if (segment.id === "white-wolf") {
    return ["#3b5e86", "#dff1ff"];
  }

  if (segment.id === "dark-wolf") {
    return ["#582113", "#d97a42"];
  }

  return ["#47423c", "#c9beb0"];
}

function pickSegment() {
  const roll = Math.random();
  const weights = [0.02, 0.07, 0.18, 0.16, 0.17, 0.12, 0.12, 0.16];
  let cursor = 0;

  for (let index = 0; index < SEGMENTS.length; index += 1) {
    cursor += weights[index];
    if (roll <= cursor) {
      return SEGMENTS[index];
    }
  }

  return SEGMENTS[SEGMENTS.length - 1];
}

function getRotation(spinCount, segmentIndex) {
  const slice = 360 / SEGMENTS.length;
  const target = 360 - (segmentIndex * slice + slice / 2);
  return spinCount * 360 + target + POINTER_DEG;
}

function Wheel({ rotation, activeSegment, isSpinning }) {
  const slice = 360 / SEGMENTS.length;

  return (
    <div className={`wheel-stage ${isSpinning ? "is-spinning" : ""}`}>
      <div className="wheel-pointer" aria-hidden="true" />
      <div className="wheel-rim" aria-hidden="true" />
      <div className="wheel-disc" style={{ transform: `rotate(${rotation}deg)` }}>
        <svg aria-hidden="true" className="wheel-svg" viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}>
          <defs>
            {SEGMENTS.map((segment, index) => {
              const startAngle = index * slice - 90;
              const endAngle = startAngle + slice;
              const [startColor, endColor] = getSegmentGradient(segment);

              return (
                <Fragment key={segment.id}>
                  <linearGradient id={`segment-gradient-${segment.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={startColor} />
                    <stop offset="100%" stopColor={endColor} />
                  </linearGradient>
                  <clipPath id={`segment-clip-${segment.id}`}>
                    <path d={describeSectorPath(WHEEL_CENTER, WHEEL_CENTER, WHEEL_RADIUS, startAngle, endAngle)} />
                  </clipPath>
                </Fragment>
              );
            })}
          </defs>

          {SEGMENTS.map((segment, index) => {
            const startAngle = index * slice - 90;
            const endAngle = startAngle + slice;
            const midAngle = startAngle + slice / 2;
            const imagePosition = polarToCartesian(WHEEL_CENTER, WHEEL_CENTER, SEGMENT_IMAGE_RADIUS, midAngle);
            const labelPosition = polarToCartesian(WHEEL_CENTER, WHEEL_CENTER, SEGMENT_LABEL_RADIUS, midAngle);
            const [startColor, endColor] = getSegmentGradient(segment);

            return (
              <g key={segment.id}>
                <path
                  d={describeSectorPath(WHEEL_CENTER, WHEEL_CENTER, WHEEL_RADIUS, startAngle, endAngle)}
                  fill={`url(#segment-gradient-${segment.id})`}
                  stroke="rgba(255, 241, 210, 0.16)"
                  strokeWidth="4"
                />
                <g clipPath={`url(#segment-clip-${segment.id})`}>
                  <image
                    href={segment.src}
                    x={imagePosition.x - SEGMENT_IMAGE_SIZE / 2}
                    y={imagePosition.y - SEGMENT_IMAGE_SIZE / 2}
                    width={SEGMENT_IMAGE_SIZE}
                    height={SEGMENT_IMAGE_SIZE}
                    preserveAspectRatio="xMidYMid meet"
                  />
                </g>
                <text
                  className={`wheel-label ${segment.tone} ${activeSegment?.id === segment.id ? "is-active" : ""}`}
                  x={labelPosition.x}
                  y={labelPosition.y}
                  textAnchor="middle"
                >
                  {segment.label}
                </text>
              </g>
            );
          })}
          <circle cx={WHEEL_CENTER} cy={WHEEL_CENTER} r="102" fill="rgba(92, 26, 11, 0.98)" />
          <circle
            cx={WHEEL_CENTER}
            cy={WHEEL_CENTER}
            r="88"
            fill="url(#segment-gradient-jackpot)"
            opacity="0.92"
          />
          <circle cx={WHEEL_CENTER} cy={WHEEL_CENTER} r="48" fill="rgba(255, 233, 176, 0.8)" />
        </svg>
      </div>
      <div className="wheel-hub" aria-hidden="true">
        <span />
      </div>
    </div>
  );
}

function AudioButton({ muted, onClick }) {
  return (
    <button
      aria-pressed={!muted}
      className={`audio-toggle ${muted ? "is-muted" : ""}`}
      onClick={onClick}
      type="button"
    >
      <span className="audio-toggle-dot" aria-hidden="true" />
      <span>{getWheelAudioLabel(muted)}</span>
    </button>
  );
}

function PrizeList({ activePrizeId }) {
  return (
    <ol className="wheel-prize-list">
      {PRIZE_BOARD_ITEMS.map((item) => (
        <li
          className={`wheel-prize-item ${activePrizeId === item.id ? "is-active" : ""}`}
          key={item.id}
        >
          <img alt="" src={item.src} />
          <span className="wheel-prize-copy">
            <strong>{item.label}</strong>
            <small>{item.prize}</small>
          </span>
          {activePrizeId === item.id ? <span className="wheel-prize-hit">Getroffen</span> : null}
        </li>
      ))}
    </ol>
  );
}

function PrizeBoard({ activePrizeId }) {
  return (
    <>
      <section className="wheel-prize-board wheel-prize-board-desktop" aria-labelledby="wheel-prizes-title">
        <div className="wheel-prize-board-heading">
          <div>
            <span className="wheel-brief-eyebrow">Gewinnübersicht</span>
            <h2 id="wheel-prizes-title">Alle acht festen Preise</h2>
          </div>
          <p>Das Symbol bestimmt den Preis.</p>
        </div>
        <PrizeList activePrizeId={activePrizeId} />
      </section>

      <details className="wheel-prize-board wheel-prize-board-mobile">
        <summary>
          <span>
            <span className="wheel-brief-eyebrow">Gewinnübersicht</span>
            <strong>Alle Preise ansehen</strong>
          </span>
          <small>8 feste Preise</small>
        </summary>
        <PrizeList activePrizeId={activePrizeId} />
      </details>
    </>
  );
}

export function WheelGame() {
  const [spinsLeft, setSpinsLeft] = useState(TOTAL_WHEEL_SPINS);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [activeSegment, setActiveSegment] = useState(null);
  const [pendingResult, setPendingResult] = useState(null);
  const [overlayResult, setOverlayResult] = useState(null);
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("Du hast drei Chancen, den Gilbaron zu beeindrucken.");
  const timersRef = useRef([]);
  const confirmButtonRef = useRef(null);
  const { isMuted, playCue, startLoop, stopLoop, stopAllLoops, toggleMute } = useSlotAudio();

  const canSpin = !isSpinning && !overlayResult && spinsLeft > 0;
  const activePrizeId = isSpinning ? null : activeSegment?.id;

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
      stopAllLoops();
    };
  }, []);

  useEffect(() => {
    if (overlayResult) {
      confirmButtonRef.current?.focus();
    }
  }, [overlayResult]);

  function clearTimers() {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
    stopAllLoops();
  }

  function doSpin() {
    if (!canSpin) {
      return;
    }

    clearTimers();
    const segment = pickSegment();
    const result = createWheelResult(segment);
    const nextRotation = getRotation(TOTAL_WHEEL_SPINS - spinsLeft + 4, SEGMENTS.indexOf(segment));
    const audioPlan = getWheelSpinAudioPlan(result);

    setSpinsLeft((current) => current - 1);
    setIsSpinning(true);
    setActiveSegment(segment);
    setRotation(nextRotation);
    setPendingResult(result);
    setOverlayResult(null);
    setStatus("Das Rad läuft. Bitte warten, bis es steht.");
    void playCue(audioPlan.start[0]);
    void startLoop(audioPlan.start[1]);

    timersRef.current.push(
      window.setTimeout(() => {
        stopLoop("spinLoop");
        void playCue("reelStop");
      }, SPIN_DURATION_MS - 700),
    );

    timersRef.current.push(
      window.setTimeout(() => {
        setIsSpinning(false);
        setStatus(
          result.isBlank
            ? "Schaf getroffen. Diesmal ist es eine Niete."
            : `${result.label} getroffen: ${result.prize}.`,
        );
        void playCue(audioPlan.stop[1]);
      }, SPIN_DURATION_MS),
    );

    timersRef.current.push(
      window.setTimeout(() => {
        setOverlayResult(result);
      }, SPIN_DURATION_MS + RESULT_DELAY_MS),
    );
  }

  function confirmResult() {
    if (!pendingResult) {
      return;
    }

    setResults((current) => appendWheelResult(current, pendingResult));
    setOverlayResult(null);
    setPendingResult(null);
    setStatus(
      spinsLeft > 0
        ? "Nächster Versuch ist bereit."
        : "Alle drei Drehungen für heute sind verbraucht.",
    );
  }

  return (
    <main className="app-shell wheel-app-shell">
      <section className="wheel-lobby">
        <div className="wheel-lobby-header">
          <div>
            <p className="desktop-kicker">Birthday Wheel</p>
            <h1>LUCK SLOTS WHEEL</h1>
          </div>
          <div className="wheel-header-actions">
            <a className="audio-toggle wheel-nav-link" href={buildAppPath("")}>
              Start
            </a>
            <a className="audio-toggle wheel-nav-link" href={buildAppPath("slot")}>
              Slotgame
            </a>
            <AudioButton muted={isMuted} onClick={() => void toggleMute()} />
          </div>
        </div>

        <div className="wheel-layout">
          <div className="wheel-main-column">
            <div className="wheel-brief-panel">
              <div className="wheel-brief-status">
                <span className="wheel-brief-eyebrow">Status</span>
                <h2>{status}</h2>
                <p>Kurz drehen, Ergebnis prüfen, dann weiter.</p>
              </div>
              <div className="wheel-brief-rules">
                <span className="wheel-brief-eyebrow">Kurzregeln</span>
                <div className="wheel-brief-chips">
                  <span>3 Drehungen</span>
                  <span>8 feste Preise</span>
                  <span>Jackpot: {WHEEL_PRIZES.jackpot}</span>
                  <span>Schaf: Niete</span>
                </div>
              </div>
            </div>

            <PrizeBoard activePrizeId={activePrizeId} />

            <div className="wheel-stage-shell">
              <div className="wheel-stage-row">
                <div className="wheel-play-column">
                  <Wheel activeSegment={activeSegment} isSpinning={isSpinning} rotation={rotation} />
                  <button
                    className="primary-button is-spin wheel-spin-button"
                    disabled={!canSpin}
                    onClick={doSpin}
                    type="button"
                  >
                    <span>{isSpinning ? "Dreht..." : spinsLeft > 0 ? "Jetzt drehen" : "Keine Drehungen mehr"}</span>
                    <small>{getRemainingSpinsLabel(spinsLeft)}</small>
                  </button>
                  <section className="wheel-result-history" aria-labelledby="wheel-history-title">
                    <div className="wheel-result-history-header">
                      <span className="wheel-brief-eyebrow">Ergebnisse</span>
                      <h2 id="wheel-history-title">Deine Drehungen heute</h2>
                    </div>
                    {results.length > 0 ? (
                      <ol className="wheel-result-list">
                        {results.map((result, index) => (
                          <li className="wheel-result-item" key={`${result.id}-${index}`}>
                            <span className="wheel-result-number">{index + 1}</span>
                            <img alt="" src={result.src} />
                            <span>
                              <strong>{result.label}</strong>
                              <small>{result.prize}</small>
                            </span>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="wheel-result-empty">Noch kein Ergebnis bestätigt.</p>
                    )}
                  </section>
                </div>
                <aside className="wheel-jackpot-card">
                  <div className="wheel-jackpot-copy">
                    <span>JACKPOT-BÜHNE</span>
                    <strong>Gil-Baron</strong>
                    <p className="wheel-jackpot-quote">"1.250.000 GIL warten auf dich!"</p>
                  </div>
                  <img alt="Jackpot Gold Boy" className="wheel-jackpot-image" src={jackpotGoldBoy} />
                  <div className="wheel-jackpot-amount">{WHEEL_PRIZES.jackpot}</div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </section>

      {overlayResult ? (
        <div className="spin-overlay">
          <div
            aria-labelledby="wheel-result-title"
            aria-modal="true"
            className={`spin-overlay-card ${overlayResult.isBlank ? "is-empty" : "is-win"}`}
            role="dialog"
          >
            <div className="spin-overlay-kicker">{overlayResult.isBlank ? "Kein Gewinn" : "Dein Preis"}</div>
            <img alt="" className="spin-overlay-symbol" src={overlayResult.src} />
            <h2 id="wheel-result-title">{overlayResult.label}</h2>
            <p>Dieses Ergebnis wird für deine heutige Runde festgehalten.</p>
            <div className="spin-overlay-result">
              <span>Preis</span>
              <strong>{overlayResult.prize}</strong>
            </div>
            <button
              className="primary-button"
              onClick={confirmResult}
              ref={confirmButtonRef}
              type="button"
            >
              Bestätigen
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
