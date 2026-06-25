# Wheel Prize Board Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a responsive prize board that exposes every fixed wheel prize before play and fixes remaining-spin grammar.

**Architecture:** Move the canonical ordered segment metadata into `wheelGameModel.js`, while `WheelGame.jsx` enriches it with imported image assets. Render one semantic prize-board component in desktop and mobile variants, with CSS controlling visibility and density. Keep all spin state and payout behavior unchanged.

**Tech Stack:** React 19, JavaScript, CSS, Node test runner, Vite.

---

### Task 1: Add tested display-model helpers

**Files:**
- Modify: `src/wheelGameModel.test.js`
- Modify: `src/wheelGameModel.js`

- [ ] Write failing tests asserting the ordered prize-board entries and singular/plural spin labels.
- [ ] Run `node --test src/wheelGameModel.test.js` and confirm failures are caused by missing exports.
- [ ] Export `WHEEL_PRIZE_BOARD` and `getRemainingSpinsLabel`.
- [ ] Run `node --test src/wheelGameModel.test.js` and confirm all model tests pass.

### Task 2: Render the responsive prize board

**Files:**
- Modify: `src/WheelGame.jsx`
- Modify: `src/styles.css`
- Modify: `AGENTS.md`

- [ ] Build the ordered segment array from `WHEEL_PRIZE_BOARD` plus existing image imports.
- [ ] Add a reusable semantic prize-list component and desktop/mobile wrappers.
- [ ] Highlight `activeSegment` and use `getRemainingSpinsLabel` in the spin button.
- [ ] Add premium casino styling, a desktop grid, and a mobile collapsed `details` presentation.
- [ ] Record the durable responsive prize-board decision in `AGENTS.md`.

### Task 3: Verify behavior and presentation

**Files:**
- Verify: `src/*.test.js`
- Verify: responsive wheel route in the in-app browser

- [ ] Run `node --test src/*.test.js`.
- [ ] Run `npm run build`.
- [ ] Inspect desktop start, mobile collapsed, mobile expanded, and post-spin highlighted states.
- [ ] Confirm no console errors and preserve the existing three-spin flow.
