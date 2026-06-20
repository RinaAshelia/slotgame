# Single Payline Slot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the confusing lines control, keep one visible payline, and make payout-board values follow the current bet.

**Architecture:** Extract the payout math into a small pure helper module, cover that module with a `node --test` regression test, then simplify `App.jsx` to consume the helper and remove all line-based state and UI. Keep styling changes narrow and limited to the removed control layout.

**Tech Stack:** React 19, Vite 6, Node built-in test runner

---

### Task 1: Add failing payout-math test

**Files:**
- Create: `src/gameMath.test.js`
- Test: `src/gameMath.test.js`

- [ ] **Step 1: Write the failing test**
- [ ] **Step 2: Run `node --test src/gameMath.test.js` and verify it fails because the helper module does not exist yet**

### Task 2: Implement single-payline math helpers

**Files:**
- Create: `src/gameMath.js`
- Test: `src/gameMath.test.js`

- [ ] **Step 1: Implement bet-based multiplier and payout helpers with no line dependency**
- [ ] **Step 2: Re-run `node --test src/gameMath.test.js` and verify it passes**

### Task 3: Simplify the app to one payline

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/styles.css`
- Modify: `AGENTS.md`

- [ ] **Step 1: Remove line state, line stepper, and line-based stake logic**
- [ ] **Step 2: Feed payout-board rows from the shared payout helper using the current bet**
- [ ] **Step 3: Tighten layout after removing the extra control**

### Task 4: Verify runtime behavior

**Files:**
- Test: `src/gameMath.test.js`
- Test: `src/App.jsx`

- [ ] **Step 1: Run `node --test src/gameMath.test.js`**
- [ ] **Step 2: Run `npm run build`**
- [ ] **Step 3: Reload the in-app browser and verify that the lines control is gone and payout-board values react to bet changes**
