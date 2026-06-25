# Slot Fun Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebalance `/slot` to a 24% hit rate and 92% RTP at every stake while retaining the 400 GIL start balance.

**Architecture:** Keep the existing outcome-first slot model. Replace the stake boost table with a formula-driven profile that budgets a constant jackpot RTP contribution, then solves cat and sheep probabilities to satisfy the hit-rate and total-RTP constraints.

**Tech Stack:** JavaScript, React, Node test runner, Vite

---

### Task 1: Lock the target economics with tests

**Files:**
- Modify: `src/gameMath.test.js`

- [ ] Add assertions for the 400 GIL start balance, 24% hit rate, 9% near-miss rate, roughly 16% profitable-hit rate, and 92% RTP at every supported stake.
- [ ] Run `node --test src/gameMath.test.js` and confirm the new assertions fail against the old profile.

### Task 2: Implement the formula-driven profile

**Files:**
- Modify: `src/gameMath.js`
- Modify: `src/App.jsx`

- [ ] Export `START_BALANCE = 400`.
- [ ] Replace the old regular profile and high-stake boost with a stake-aware profile that preserves the target hit rate and RTP.
- [ ] Use `START_BALANCE` for the slot balance state.
- [ ] Run `node --test src/gameMath.test.js` and confirm it passes.

### Task 3: Verify the complete prototype

**Files:**
- Verify: `src/*.test.js`

- [ ] Run `node --test src/*.test.js`.
- [ ] Run `npm run build`.
- [ ] Start the Vite development server and inspect `/slot` in the in-app browser.
- [ ] Confirm the slot loads with 400 GIL and remains playable.
