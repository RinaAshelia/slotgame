# Jackpot Symbol Presence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add visible jackpot teaser symbols to losing spins without changing the slot economy.

**Architecture:** Extract deterministic final-reel generation into `slotReels.js`. Use a separate teaser roll only for mixed losing outcomes, then inject one or two jackpots while preserving non-winning rows.

**Tech Stack:** JavaScript, React, Node test runner, Vite

---

### Task 1: Lock teaser behavior with tests

**Files:**
- Create: `src/slotReels.test.js`
- Create: `src/slotReels.js`

- [ ] Test that rolls below `0.01` produce exactly two middle-row jackpots and no win.
- [ ] Test that rolls from `0.01` through `0.09` produce exactly one jackpot and no win.
- [ ] Test that rolls at or above `0.09` produce no jackpot.
- [ ] Test that real jackpot outcomes still produce three middle-row jackpots.
- [ ] Run `node --test src/slotReels.test.js` and confirm failure because the module is absent.

### Task 2: Implement and integrate reel generation

**Files:**
- Create: `src/slotReels.js`
- Modify: `src/App.jsx`

- [ ] Implement deterministic random selection and teaser injection.
- [ ] Remove duplicated final-reel construction from `App.jsx`.
- [ ] Keep animation-only rows able to display jackpot symbols.
- [ ] Run `node --test src/slotReels.test.js` and confirm success.

### Task 3: Verify economy and app behavior

**Files:**
- Verify: `src/*.test.js`

- [ ] Run `node --test src/*.test.js`.
- [ ] Run `npm run build`.
- [ ] Inspect `/slot` in the in-app browser and confirm the app renders without console errors.
