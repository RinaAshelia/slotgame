# Schaf Oder Loewe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the persistent `All in` flow with a single post-win risk decision that triggers only on wins worth at least `10x` the current stake, including jackpot wins.

**Architecture:** Keep all payout and trigger rules in `src/gameMath.js` as pure helpers, then let `src/App.jsx` use those helpers to enter a `pending-risk-choice` UI state. Remove the visible `All in` action, add an overlay-driven decision flow, and restyle the status area so the temporary open win is obvious before crediting balance.

**Tech Stack:** React, Vite, plain CSS, `node:test`

---

## File Structure

- Modify: `src/gameMath.js`
  - Add pure helpers for the `10x` trigger and the one-shot lion risk resolution.
- Modify: `src/gameMath.test.js`
  - Add deterministic tests for trigger threshold, secure crediting, doubled crediting, and total loss.
- Modify: `src/App.jsx`
  - Remove `All in`, add `openWin` / `pendingRiskChoice` state, add overlay actions, and gate spin controls while a choice is pending.
- Modify: `src/styles.css`
  - Remove `All in` layout styling, add overlay styling, and update controls/status spacing for the new interaction model.
- Modify: `AGENTS.md`
  - Record the durable removal of `All in` and the new `Schaf oder Loewe` trigger rule after implementation is complete.

### Task 1: Add Deterministic Risk-Choice Game Math

**Files:**
- Modify: `src/gameMath.js`
- Test: `src/gameMath.test.js`

- [ ] **Step 1: Write the failing tests**

```js
test("wins only trigger the Schaf oder Loewe choice at 10x stake or higher", () => {
  assert.equal(qualifiesForRiskChoice(24.99, 2.5), false);
  assert.equal(qualifiesForRiskChoice(25, 2.5), true);
  assert.equal(qualifiesForRiskChoice(1000, 100), true);
});

test("taking the safe option returns the open win unchanged", () => {
  assert.deepEqual(resolveRiskChoice(250, { takeSafe: true }), {
    creditedWin: 250,
    outcome: "safe",
  });
});

test("lion risk either doubles the open win or loses it all", () => {
  assert.deepEqual(resolveRiskChoice(250, { takeSafe: false, roll: 0.2 }), {
    creditedWin: 500,
    outcome: "lion-win",
  });
  assert.deepEqual(resolveRiskChoice(250, { takeSafe: false, roll: 0.8 }), {
    creditedWin: 0,
    outcome: "lion-loss",
  });
});

test("jackpot payouts also qualify for the post-win risk choice", () => {
  const payout = getSymbolPayout("jackpot", 2.5);
  assert.equal(qualifiesForRiskChoice(payout, 2.5), true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/gameMath.test.js`
Expected: FAIL with missing exports such as `qualifiesForRiskChoice` and `resolveRiskChoice`.

- [ ] **Step 3: Write the minimal implementation**

```js
export const RISK_TRIGGER_MULTIPLIER = 10;

export function qualifiesForRiskChoice(payout, stake) {
  if (stake <= 0) {
    return false;
  }

  return payout >= stake * RISK_TRIGGER_MULTIPLIER;
}

export function resolveRiskChoice(openWin, options = {}) {
  const { takeSafe = false, roll = Math.random() } = options;

  if (takeSafe) {
    return {
      creditedWin: openWin,
      outcome: "safe",
    };
  }

  if (roll < 0.5) {
    return {
      creditedWin: openWin * 2,
      outcome: "lion-win",
    };
  }

  return {
    creditedWin: 0,
    outcome: "lion-loss",
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/gameMath.test.js`
Expected: PASS with new risk-choice tests included in the suite.

- [ ] **Step 5: Commit**

```bash
git add src/gameMath.js src/gameMath.test.js
git commit -m "feat: add schaf oder loewe game math"
```

### Task 2: Replace All-In App State With Pending Risk Choice

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Re-run the math tests before the app-state refactor**

Run: `node --test src/gameMath.test.js`
Expected: PASS so the trigger helpers are locked before changing the UI flow.

- [ ] **Step 2: Update `src/App.jsx` to use pending open-win state instead of all-in**

```jsx
const [pendingRiskChoice, setPendingRiskChoice] = useState(null);

function resolveSpin(outcome, spinContext) {
  const { stake } = spinContext;
  const winningSymbol = outcome.every((symbolId) => symbolId === outcome[0]) ? symbolMap[outcome[0]] : null;

  if (!winningSymbol) {
    setLastWin(0);
    setPendingRiskChoice(null);
    setStatus({
      title: "Kein Treffer.",
      detail: `Mit ${formatGil(stake)} Einsatz hat diesmal nichts verbunden.`,
      tone: "loss",
    });
    return;
  }

  const payout = getSymbolPayout(winningSymbol.id, stake);

  if (qualifiesForRiskChoice(payout, stake)) {
    setLastWin(0);
    setPendingRiskChoice({
      symbolId: winningSymbol.id,
      symbolLabel: winningSymbol.label,
      stake,
      openWin: payout,
    });
    setHighlightedSymbolId(winningSymbol.id);
    setStatus({
      title: `${winningSymbol.label} bringt ${formatGil(payout)}.`,
      detail: "Der Gewinn ist noch offen. Jetzt entscheidest du zwischen Schaf und Loewe.",
      tone: "risk",
    });
    return;
  }

  setBalance((current) => current + payout);
  setLastWin(payout);
  setPendingRiskChoice(null);
}

function handleRiskDecision(takeSafe) {
  if (!pendingRiskChoice) {
    return;
  }

  const result = resolveRiskChoice(pendingRiskChoice.openWin, { takeSafe });
  setBalance((current) => current + result.creditedWin);
  setLastWin(result.creditedWin);
  setPendingRiskChoice(null);
}
```

- [ ] **Step 3: Add the overlay markup and remove the all-in controls**

```jsx
<div className="desktop-controls">
  <StepperControl
    decrementDisabled={isSpinning || pendingRiskChoice || bet === BET_OPTIONS[0]}
    incrementDisabled={isSpinning || pendingRiskChoice || bet === BET_OPTIONS[BET_OPTIONS.length - 1]}
    label="Einsatz"
    onDecrement={() => cycleBet(-1)}
    onIncrement={() => cycleBet(1)}
    value={formatGil(bet)}
  />

  <SpinButton
    className="desktop-spin-button"
    disabled={isSpinning || Boolean(pendingRiskChoice)}
    isSpinning={isSpinning}
    onClick={() => spin()}
    stake={totalStake}
  />
</div>

{pendingRiskChoice ? (
  <section className="risk-overlay" role="dialog" aria-modal="true" aria-labelledby="risk-title">
    <div className="risk-overlay-card">
      <span className="risk-kicker">Offener Gewinn</span>
      <h2 id="risk-title">Bleibst du Schaf oder wirst du Loewe?</h2>
      <strong>{formatGil(pendingRiskChoice.openWin)}</strong>
      <p>Der Gewinn ist noch nicht gesichert.</p>
      <div className="risk-actions">
        <button type="button" onClick={() => handleRiskDecision(true)}>Sicher nehmen</button>
        <button type="button" onClick={() => handleRiskDecision(false)}>Einmal Loewe sein</button>
      </div>
    </div>
  </section>
) : null}
```

- [ ] **Step 4: Run targeted verification**

Run: `npm run build`
Expected: PASS and no references to `AllInButton`, `allIn`, or removed handlers remain in `src/App.jsx`.

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx src/gameMath.js src/gameMath.test.js
git commit -m "feat: add pending schaf oder loewe flow"
```

### Task 3: Style The Overlay And Update Persistent Product Notes

**Files:**
- Modify: `src/styles.css`
- Modify: `AGENTS.md`

- [ ] **Step 1: Add the overlay and simplified controls styling**

```css
.risk-overlay {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(8, 3, 2, 0.72);
  backdrop-filter: blur(6px);
}

.risk-overlay-card {
  width: min(520px, 100%);
  padding: 28px 24px;
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(74, 18, 12, 0.98) 0%, rgba(23, 8, 5, 0.98) 100%);
  border: 1px solid rgba(255, 208, 118, 0.28);
  text-align: center;
}

.risk-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.risk-actions button:last-child {
  background: linear-gradient(180deg, #c43b22 0%, #8a140e 100%);
}
```

- [ ] **Step 2: Update the persistent prototype decisions**

```md
- The dedicated `All in` button is removed in favor of a post-win `Schaf oder Loewe` decision.
- Wins are only routed into `Schaf oder Loewe` when they are worth at least `10x` the current stake.
- The risk choice appears as a blocking overlay, keeps the win uncredited until resolved, and also applies to jackpot wins.
```

- [ ] **Step 3: Run full verification**

Run:

```bash
node --test src/gameMath.test.js
npm run build
```

Expected:
- `node --test` PASS
- `vite build` PASS

Then verify in the running preview:
- A normal sub-10x win credits immediately.
- A `Loewe` or `Jackpot` win opens the overlay instead of crediting immediately.
- `Sicher nehmen` credits the open win.
- `Einmal Loewe sein` either doubles or loses the open win and closes the overlay.

- [ ] **Step 4: Commit**

```bash
git add src/styles.css AGENTS.md
git commit -m "feat: style schaf oder loewe overlay"
```

## Self-Review

- Spec coverage check:
  - `All in` removal is covered in Task 2 and Task 3.
  - `10x` trigger logic is covered in Task 1 and reinforced in Task 2 tests.
  - Jackpot participation is covered in Task 1 tests and Task 3 browser verification.
  - Single 50/50 choice with no chaining is covered by Task 1 helper design and Task 2 overlay flow.
  - Open win not credited before the decision is covered in Task 2 state handling.
- Placeholder scan:
  - No `TODO`, `TBD`, or indirect “handle later” language remains.
- Type consistency:
  - Shared names are fixed to `qualifiesForRiskChoice`, `resolveRiskChoice`, and `pendingRiskChoice` across all tasks.
