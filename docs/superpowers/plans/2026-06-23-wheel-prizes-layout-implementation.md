# Glücksrad Preise und Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Das Glücksrad vergibt drei feste FFXIV-Preise pro Sitzung, zeigt Symbol und Preis im Overlay sowie in einer Historie und erhält das freigegebene responsive Layout A.

**Architecture:** Eine neue reine Modell-Datei kapselt Segment-Metadaten, Preistexte, Overlay-Daten und die Begrenzung der Ergebnis-Historie. `WheelGame.jsx` verwendet dieses Modell und bleibt für Animation, Audio und React-Zustand verantwortlich; `styles.css` setzt ausschließlich die freigegebenen Wheel-Layout- und Darstellungsänderungen um. Slotgame-Dateien werden nicht verändert.

**Tech Stack:** React 19, Vite 6, CSS, Node.js `node:test`

---

## Dateistruktur

- Create: `src/wheelGameModel.js` - feste Wheel-Preise, Ergebnisaufbereitung und maximal drei bestätigte Ergebnisse.
- Create: `src/wheelGameModel.test.js` - automatisierte Tests für Preisdefinition, Overlay-Daten und Sitzungslimit.
- Modify: `src/WheelGame.jsx` - Balance-/Einsatzlogik entfernen, Modell verwenden, Overlay-Bild und Ergebnis-Historie rendern, Fokus setzen.
- Modify: `src/styles.css` - Variante A, volle Statusbreite, mobile Begrenzung, Historie und Overlay-Bild.

### Task 1: Feste Wheel-Preise modellieren

**Files:**
- Create: `src/wheelGameModel.js`
- Create: `src/wheelGameModel.test.js`

- [ ] **Step 1: Failing Test für alle Preiszuordnungen schreiben**

```js
import test from "node:test";
import assert from "node:assert/strict";

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
```

- [ ] **Step 2: Test ausführen und erwartetes RED prüfen**

Run: `node --test src/wheelGameModel.test.js`

Expected: FAIL mit `ERR_MODULE_NOT_FOUND`, weil `wheelGameModel.js` noch nicht existiert.

- [ ] **Step 3: Minimale Preisdefinition implementieren**

```js
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
```

- [ ] **Step 4: Test ausführen und GREEN prüfen**

Run: `node --test src/wheelGameModel.test.js`

Expected: PASS, 1 Test, 0 Fehler.

- [ ] **Step 5: Commit**

```bash
git add src/wheelGameModel.js src/wheelGameModel.test.js
git commit -m "feat: define fixed wheel prizes"
```

### Task 2: Overlay- und Historienergebnisse testgetrieben ergänzen

**Files:**
- Modify: `src/wheelGameModel.js`
- Modify: `src/wheelGameModel.test.js`

- [ ] **Step 1: Failing Tests für Ergebnisdaten und maximal drei Einträge schreiben**

```js
import {
  TOTAL_WHEEL_SPINS,
  WHEEL_PRIZES,
  appendWheelResult,
  createWheelResult,
} from "./wheelGameModel.js";

test("wheel result keeps the selected segment identity and prize", () => {
  const segment = {
    id: "pink-elf",
    label: "Eden",
    src: "/eden.png",
  };

  assert.deepEqual(createWheelResult(segment), {
    id: "pink-elf",
    label: "Eden",
    prize: "33 Flasks nach Wahl",
    src: "/eden.png",
    isBlank: false,
  });
});

test("sheep result is represented as a blank prize without currency copy", () => {
  const result = createWheelResult({
    id: "sheep",
    label: "Schaf",
    src: "/sheep.png",
  });

  assert.equal(result.prize, "Niete");
  assert.equal(result.isBlank, true);
});

test("wheel history accepts at most three confirmed results", () => {
  const result = createWheelResult({
    id: "lion",
    label: "Löwe",
    src: "/lion.png",
  });

  let history = [];
  history = appendWheelResult(history, result);
  history = appendWheelResult(history, result);
  history = appendWheelResult(history, result);
  history = appendWheelResult(history, result);

  assert.equal(TOTAL_WHEEL_SPINS, 3);
  assert.equal(history.length, 3);
});
```

- [ ] **Step 2: Test ausführen und erwartetes RED prüfen**

Run: `node --test src/wheelGameModel.test.js`

Expected: FAIL, weil `TOTAL_WHEEL_SPINS`, `createWheelResult` und `appendWheelResult` fehlen.

- [ ] **Step 3: Minimale Modellfunktionen implementieren**

```js
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
```

- [ ] **Step 4: Test ausführen und GREEN prüfen**

Run: `node --test src/wheelGameModel.test.js`

Expected: PASS, 4 Tests, 0 Fehler.

- [ ] **Step 5: Commit**

```bash
git add src/wheelGameModel.js src/wheelGameModel.test.js
git commit -m "feat: model wheel results and session limit"
```

### Task 3: Wheel-Komponente auf feste Ergebnisse umstellen

**Files:**
- Modify: `src/WheelGame.jsx`
- Test: `src/wheelGameModel.test.js`

- [ ] **Step 1: Failing Modelltest für Audio-Schaltertexte schreiben**

```js
import { getWheelAudioLabel } from "./wheelGameModel.js";

test("audio label describes the action that the button performs", () => {
  assert.equal(getWheelAudioLabel(true), "Ton einschalten");
  assert.equal(getWheelAudioLabel(false), "Ton ausschalten");
});
```

- [ ] **Step 2: Test ausführen und erwartetes RED prüfen**

Run: `node --test src/wheelGameModel.test.js`

Expected: FAIL, weil `getWheelAudioLabel` fehlt.

- [ ] **Step 3: Audio-Label-Helfer implementieren**

```js
export function getWheelAudioLabel(isMuted) {
  return isMuted ? "Ton einschalten" : "Ton ausschalten";
}
```

- [ ] **Step 4: `WheelGame.jsx` auf das Modell umstellen**

Importe:

```js
import {
  TOTAL_WHEEL_SPINS,
  WHEEL_PRIZES,
  appendWheelResult,
  createWheelResult,
  getWheelAudioLabel,
} from "./wheelGameModel.js";
```

Segmentdefinitionen erhalten `prize` statt `payout`:

```js
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
```

Zustand und Spin-Logik:

```js
const [spinsLeft, setSpinsLeft] = useState(TOTAL_WHEEL_SPINS);
const [pendingResult, setPendingResult] = useState(null);
const [overlayResult, setOverlayResult] = useState(null);
const [results, setResults] = useState([]);
const confirmButtonRef = useRef(null);

const canSpin = !isSpinning && !overlayResult && spinsLeft > 0;
```

`balance`, `bet`, `lastWin`, Auszahlungsskalierung und den zweiten Gewinn-Zufall entfernen. In `doSpin()` aus dem ausgewählten Segment genau ein Ergebnis erzeugen:

```js
const result = createWheelResult(segment);

setSpinsLeft((current) => current - 1);
setPendingResult(result);
setOverlayResult(null);
```

Nach Ende der Animation:

```js
setStatus(
  result.isBlank
    ? "Schaf getroffen. Diesmal ist es eine Niete."
    : `${result.label} getroffen: ${result.prize}.`,
);
void playCue(result.id === "jackpot" ? "jackpot" : result.isBlank ? "featureTrigger" : "win");
```

Nach `RESULT_DELAY_MS`:

```js
setOverlayResult(result);
```

Beim Bestätigen:

```js
setResults((current) => appendWheelResult(current, pendingResult));
setOverlayResult(null);
setPendingResult(null);
setStatus(
  spinsLeft > 0
    ? "Nächster Versuch ist bereit."
    : "Alle drei Drehungen für heute sind verbraucht.",
);
```

Fokus setzen:

```js
useEffect(() => {
  if (overlayResult) {
    confirmButtonRef.current?.focus();
  }
}, [overlayResult]);
```

Audio-Button:

```jsx
<span>{getWheelAudioLabel(muted)}</span>
```

- [ ] **Step 5: Overlay mit Bild, Name und Preis rendern**

```jsx
<div
  className={`spin-overlay-card ${overlayResult.isBlank ? "is-empty" : "is-win"}`}
  aria-labelledby="wheel-result-title"
>
  <div className="spin-overlay-kicker">
    {overlayResult.isBlank ? "Kein Gewinn" : "Dein Preis"}
  </div>
  <img
    alt=""
    className="spin-overlay-symbol"
    src={overlayResult.src}
  />
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
```

- [ ] **Step 6: Historie direkt unter dem Button rendern**

Rad, Button und Historie werden in `.wheel-play-column` zusammengefasst:

```jsx
<div className="wheel-play-column">
  <Wheel activeSegment={activeSegment} isSpinning={isSpinning} rotation={rotation} />
  <button className="primary-button is-spin wheel-spin-button" ...>
    <span>{isSpinning ? "Dreht..." : spinsLeft > 0 ? "Jetzt drehen" : "Keine Drehungen mehr"}</span>
    <small>{spinsLeft} Drehungen übrig</small>
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
```

- [ ] **Step 7: Kurzregeln aktualisieren**

```jsx
<span>3 Drehungen heute</span>
<span>8 feste Preise</span>
<span>Jackpot: {WHEEL_PRIZES.jackpot}</span>
<span>Schaf: Niete</span>
```

- [ ] **Step 8: Tests und Build prüfen**

Run: `node --test src/wheelGameModel.test.js`

Expected: PASS, 5 Tests, 0 Fehler.

Run: `npm run build`

Expected: Exit 0 ohne JSX- oder Importfehler.

- [ ] **Step 9: Commit**

```bash
git add src/WheelGame.jsx src/wheelGameModel.js src/wheelGameModel.test.js
git commit -m "feat: show fixed wheel prizes and result history"
```

### Task 4: Freigegebenes Layout A und responsive Korrekturen umsetzen

**Files:**
- Modify: `src/styles.css`

- [ ] **Step 1: Grid und gemeinsame Radspalte korrigieren**

```css
.wheel-app-shell .wheel-layout,
.wheel-app-shell .wheel-main-column,
.wheel-stage-shell,
.wheel-stage-row,
.wheel-play-column,
.wheel-jackpot-card {
  min-width: 0;
}

.wheel-app-shell .wheel-layout {
  grid-template-columns: minmax(0, 1fr);
}

.wheel-stage-row {
  grid-template-columns: minmax(0, 720px) minmax(240px, 300px);
  justify-content: start;
  gap: 14px;
}

.wheel-play-column {
  display: grid;
  min-width: 0;
  gap: 12px;
  justify-items: center;
}

.wheel-spin-button {
  width: min(100%, 620px);
  margin-top: 0;
}
```

- [ ] **Step 2: Löwe rot und Jackpot gold definieren**

In `getSegmentGradient()` in `WheelGame.jsx`:

```js
if (segment.id === "jackpot") {
  return ["#8a5a09", "#ffd76a"];
}

if (segment.id === "lion") {
  return ["#6f0909", "#d9362b"];
}
```

- [ ] **Step 3: Historie gestalten**

```css
.wheel-result-history {
  width: min(100%, 620px);
  display: grid;
  gap: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 204, 120, 0.16);
  border-radius: 8px;
  background: rgba(255, 227, 170, 0.05);
}

.wheel-result-history-header {
  display: grid;
  gap: 4px;
}

.wheel-result-history-header h2 {
  margin: 0;
  color: #fff0c8;
  font-family: "Iowan Old Style", "Palatino Linotype", serif;
  font-size: 1.15rem;
}

.wheel-result-list {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.wheel-result-item {
  display: grid;
  grid-template-columns: 28px 48px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 8px 10px;
  border: 1px solid rgba(255, 204, 120, 0.12);
  border-radius: 6px;
  background: rgba(17, 7, 5, 0.44);
}

.wheel-result-item img {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.wheel-result-item span:last-child {
  min-width: 0;
}

.wheel-result-item strong,
.wheel-result-item small {
  display: block;
}

.wheel-result-item small {
  color: rgba(247, 223, 170, 0.76);
  overflow-wrap: anywhere;
}
```

- [ ] **Step 4: Overlay-Symbol gestalten**

```css
.spin-overlay-symbol {
  width: 132px;
  height: 132px;
  justify-self: center;
  object-fit: contain;
  filter: drop-shadow(0 16px 24px rgba(0, 0, 0, 0.34));
}

.spin-overlay-result {
  align-items: center;
}

.spin-overlay-result strong {
  max-width: 68%;
  text-align: right;
  overflow-wrap: anywhere;
}
```

- [ ] **Step 5: Mobile Begrenzung und Stapelreihenfolge setzen**

```css
@media (max-width: 1060px) {
  .wheel-stage-row {
    grid-template-columns: minmax(0, 1fr);
  }

  .wheel-stage {
    width: min(100%, calc(100vw - 32px));
    justify-self: center;
  }
}

@media (max-width: 860px) {
  .wheel-app-shell {
    padding-inline: 16px;
  }

  .wheel-header-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .wheel-result-history,
  .wheel-spin-button {
    width: 100%;
  }
}
```

- [ ] **Step 6: Build und CSS-Sanity prüfen**

Run: `npm run build`

Expected: Exit 0.

Run: `rg -n "min-width: 0|calc\\(100vw - 32px\\)|wheel-result-history|spin-overlay-symbol" src/styles.css`

Expected: Treffer für Grid-Shrinking, mobile Radbreite, Historie und Overlay-Symbol.

- [ ] **Step 7: Commit**

```bash
git add src/WheelGame.jsx src/styles.css
git commit -m "style: refine wheel layout and mobile sizing"
```

### Task 5: Vollständige Verifikation

**Files:**
- Verify: `src/WheelGame.jsx`
- Verify: `src/wheelGameModel.js`
- Verify: `src/wheelGameModel.test.js`
- Verify: `src/styles.css`

- [ ] **Step 1: Gesamte Testsuite ausführen**

Run: `node --test src/*.test.js`

Expected: Alle Tests PASS, 0 Fehler.

- [ ] **Step 2: Produktionsbuild ausführen**

Run: `npm run build`

Expected: Exit 0.

- [ ] **Step 3: Desktop visuell prüfen**

Open: `http://127.0.0.1:<vite-port>/wheel`

Viewport: `1440x1100`

Prüfen:

- Statuspanel endet bündig mit der rechten Header-Aktion.
- Jackpot-Bühne steht unmittelbar neben dem Rad.
- Button sitzt direkt unter dem Rad.
- Ergebnisliste sitzt direkt unter dem Button.
- Löwensegment ist rot; Jackpotsegment ist gold.
- Overlay zeigt Symbol, Name und Preis.

- [ ] **Step 4: Mobil visuell prüfen**

Viewport: `390x844`

Prüfen:

- Kein horizontales Abschneiden.
- Rad ist höchstens `calc(100vw - 32px)` breit.
- Reihenfolge ist Rad, Button, Historie, Jackpot-Bühne.
- Lange Preise brechen lesbar um.
- Header-Aktionen und Tonschalter bleiben bedienbar.

- [ ] **Step 5: Drei-Drehungen-Ablauf prüfen**

1. Drei Drehungen durchführen.
2. Jedes Overlay bestätigen.
3. Prüfen, dass drei Historieneinträge sichtbar sind.
4. Prüfen, dass der Button `Keine Drehungen mehr` zeigt und deaktiviert bleibt.
5. Prüfen, dass keine neue Runde angeboten wird.

- [ ] **Step 6: Slotgame-Regressionsprüfung**

Open: `http://127.0.0.1:<vite-port>/slot`

Prüfen:

- Slotgame lädt.
- Einsatz- und Guthabenlogik sind unverändert sichtbar.
- Ein Slot-Spin kann weiterhin gestartet werden.

- [ ] **Step 7: Diff-Sanity**

Run: `git diff --check`

Expected: Keine Whitespace-Fehler.

Run: `git status --short`

Expected: Nur beabsichtigte Quelldateien; bestehende `.idea`- und `.superpowers`-Artefakte bleiben unberührt.
