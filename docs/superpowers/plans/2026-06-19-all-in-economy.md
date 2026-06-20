# All-In Economy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fixed 1.25M jackpot, a separate all-in button, and a stronger high-stake payout curve without desynchronizing UI and payout logic.

**Architecture:** Keep payout math and outcome profiles in `src/gameMath.js`, cover the economy changes with `node --test`, and let `src/App.jsx` consume the shared helpers for jackpot display, payout-board values, regular spins, and all-in spins. Update the layout narrowly in `src/styles.css` so the new risk button reads as a secondary but prominent action.

**Tech Stack:** React 19, Vite 6, Node built-in test runner

---

### Task 1: Extend the economy test suite first

**Files:**
- Modify: `src/gameMath.test.js`
- Test: `src/gameMath.test.js`

- [ ] **Step 1: Write failing tests for fixed jackpot payout, stronger high-stake multipliers, and all-in profile odds**
- [ ] **Step 2: Run `node --test src/gameMath.test.js` and confirm the new expectations fail**

### Task 2: Implement payout and odds helpers

**Files:**
- Modify: `src/gameMath.js`
- Test: `src/gameMath.test.js`

- [ ] **Step 1: Add fixed jackpot constant, expanded bet options, stronger multiplier curve, and all-in outcome profile helpers**
- [ ] **Step 2: Re-run `node --test src/gameMath.test.js` and confirm all tests pass**

### Task 3: Wire the app to the new economy

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/styles.css`
- Modify: `AGENTS.md`

- [ ] **Step 1: Update the slot symbols and payout board to use the new shared economy helpers**
- [ ] **Step 2: Add a separate all-in button and execute all-in spins against the full current balance**
- [ ] **Step 3: Adjust desktop and mobile controls so `Spielen`, `Einsatz`, and `All in` read clearly**

### Task 4: Verify the full feature

**Files:**
- Test: `src/gameMath.test.js`
- Test: `src/App.jsx`

- [ ] **Step 1: Run `node --test src/gameMath.test.js`**
- [ ] **Step 2: Run `npm run build`**
- [ ] **Step 3: Reload the browser and verify jackpot stays fixed, bet values above 10 are available, and the all-in button uses the full balance**
