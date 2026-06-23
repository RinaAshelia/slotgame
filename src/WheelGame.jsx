import { Fragment, useEffect, useRef, useState } from "react";

import blondeCatGirl from "./assets/blonde-cat-girl-cut.png";
import blondeHeartGirl from "./assets/blonde-heart-girl-cut.png";
import darkWolfFullCut from "./assets/dark-wolf-full-cut.png";
import jackpotGoldBoy from "./assets/jackpot-gold-boy.png";
import lionEmblem from "./assets/lion-emblem-new.png";
import pinkElfGirl from "./assets/pink-elf-girl-clean.png";
import sheepSymbol from "./assets/sheep-symbol-new-cut.png";
import whiteWolfBoy from "./assets/white-wolf-boy-cut.png";
import { formatGil } from "./formatGil.js";
import { useSlotAudio } from "./useSlotAudio.js";

const SEGMENTS = [
  { id: "jackpot", label: "Jackpot", payout: 1250000, src: jackpotGoldBoy, tone: "is-jackpot" },
  { id: "lion", label: "Löwe", payout: 100, src: lionEmblem, tone: "is-lion" },
  { id: "blonde-cat", label: "Turri", payout: 10, src: blondeCatGirl, tone: "is-gold" },
  { id: "blonde-heart", label: "Ashelia", payout: 5, src: blondeHeartGirl, tone: "is-rose" },
  { id: "pink-elf", label: "Eden", payout: 15, src: pinkElfGirl, tone: "is-rose" },
  { id: "white-wolf", label: "Poly", payout: 50, src: whiteWolfBoy, tone: "is-ice" },
  { id: "dark-wolf", label: "Alucard", payout: 25, src: darkWolfFullCut, tone: "is-ember" },
  { id: "sheep", label: "Schaf", payout: 0, src: sheepSymbol, tone: "is-sheep" },
];

const TOTAL_SPINS = 3;
const SPIN_DURATION_MS = 3800;
const RESULT_DELAY_MS = 420;
const POINTER_DEG = 90;
const WHEEL_SIZE = 1000;
const WHEEL_CENTER = WHEEL_SIZE / 2;
const WHEEL_RADIUS = 434;
const SEGMENT_IMAGE_RADIUS = 270;
const SEGMENT_IMAGE_SIZE = 150;
const SEGMENT_LABEL_RADIUS = 346;

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
    return ["#7f1f0c", "#f4b24b"];
  }

  if (segment.id === "lion") {
    return ["#5f3514", "#f1c058"];
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
    <button className={`audio-toggle ${muted ? "is-muted" : ""}`} onClick={onClick} type="button">
      <span className="audio-toggle-dot" aria-hidden="true" />
      <span>{muted ? "Sound aus" : "Sound an"}</span>
    </button>
  );
}

export function WheelGame() {
  const [balance, setBalance] = useState(35);
  const [bet, setBet] = useState(2.5);
  const [spinsLeft, setSpinsLeft] = useState(TOTAL_SPINS);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [activeSegment, setActiveSegment] = useState(null);
  const [pendingResult, setPendingResult] = useState(null);
  const [overlayResult, setOverlayResult] = useState(null);
  const [lastWin, setLastWin] = useState(0);
  const [status, setStatus] = useState("Du hast drei Chancen, den Gilbaron zu beeindrucken.");
  const timersRef = useRef([]);
  const { isMuted, playCue, toggleMute } = useSlotAudio();

  const canSpin = !isSpinning && !overlayResult && spinsLeft > 0 && balance >= bet;

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
    };
  }, []);

  function clearTimers() {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }

  function doSpin() {
    if (!canSpin) {
      return;
    }

    clearTimers();
    const segment = pickSegment();
    const nextRotation = getRotation(TOTAL_SPINS - spinsLeft + 4, SEGMENTS.indexOf(segment));
    const win = segment.payout > 0 && Math.random() > 0.16;
    const payout = win ? (segment.id === "jackpot" ? 1250000 : segment.payout * (bet / 2.5)) : 0;

    setBalance((current) => current - bet);
    setSpinsLeft((current) => current - 1);
    setIsSpinning(true);
    setActiveSegment(segment);
    setRotation(nextRotation);
    setPendingResult({ win, payout, segment });
    setOverlayResult(null);
    setStatus("Das Rad läuft. Bitte warten, bis es steht.");
    void playCue("spinStart");

    timersRef.current.push(
      window.setTimeout(() => {
        void playCue("reelStop");
      }, SPIN_DURATION_MS - 700),
    );

    timersRef.current.push(
      window.setTimeout(() => {
        setIsSpinning(false);
        setLastWin(payout);
        setStatus(win ? `${segment.label} wurde getroffen.` : "Leider nichts getroffen.");
        void playCue(win ? (segment.id === "jackpot" ? "jackpot" : "win") : "featureTrigger");
      }, SPIN_DURATION_MS),
    );

    timersRef.current.push(
      window.setTimeout(() => {
        setOverlayResult(
          win
            ? {
                title: `${segment.label} gewonnen`,
                detail: "Bestätigen schreibt den Gewinn gut.",
                payout,
                win: true,
              }
            : {
                title: "Leider nichts",
                detail: "Diesmal gibt es keinen Gewinn. Bestätigen für den nächsten Versuch.",
                payout: 0,
                win: false,
              },
        );
      }, SPIN_DURATION_MS + RESULT_DELAY_MS),
    );
  }

  function confirmResult() {
    if (!pendingResult) {
      return;
    }

    if (pendingResult.win) {
      setBalance((current) => current + pendingResult.payout);
      setLastWin(pendingResult.payout);
    } else {
      setLastWin(0);
    }

    setOverlayResult(null);
    setPendingResult(null);
    setStatus(spinsLeft > 0 ? "Nächster Versuch ist frei." : "Alle drei Versuche sind verbraucht.");
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
            <a className="audio-toggle wheel-nav-link" href="/">
              Start
            </a>
            <a className="audio-toggle wheel-nav-link" href="/slot">
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
                  <span>8 Felder</span>
                  <span>Jackpot: {formatGil(1250000)}</span>
                  <span>Schaf: leer</span>
                </div>
              </div>
            </div>

            <div className="wheel-stage-shell">
              <div className="wheel-stage-row">
                <Wheel activeSegment={activeSegment} isSpinning={isSpinning} rotation={rotation} />
                <aside className="wheel-jackpot-card">
                  <div className="wheel-jackpot-copy">
                    <span>JACKPOT-BÜHNE</span>
                    <strong>Gil-Baron</strong>
                    <p>Der Sondergewinn bleibt immer sichtbar inszeniert.</p>
                  </div>
                  <img alt="Jackpot Gold Boy" className="wheel-jackpot-image" src={jackpotGoldBoy} />
                  <div className="wheel-jackpot-amount">{formatGil(1250000)}</div>
                </aside>
              </div>
              <button className="primary-button is-spin wheel-spin-button" disabled={!canSpin} onClick={doSpin} type="button">
                <span>{isSpinning ? "Dreht..." : spinsLeft > 0 ? "Jetzt drehen" : "Keine Spins mehr"}</span>
                <small>{spinsLeft} Versuche übrig</small>
              </button>
            </div>
          </div>
        </div>
      </section>

      {overlayResult ? (
        <div className="spin-overlay" role="dialog" aria-modal="true">
          <div className={`spin-overlay-card ${overlayResult.win ? "is-win" : "is-empty"}`}>
            <div className="spin-overlay-kicker">{overlayResult.win ? "Gewonnen" : "Kein Treffer"}</div>
            <h2>{overlayResult.title}</h2>
            <p>{overlayResult.detail}</p>
            <div className="spin-overlay-result">
              <span>{overlayResult.win ? "Auszahlung" : "Ergebnis"}</span>
              <strong>{overlayResult.win ? formatGil(overlayResult.payout) : "0 GIL"}</strong>
            </div>
            <button className="primary-button" onClick={confirmResult} type="button">
              Bestätigen
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
