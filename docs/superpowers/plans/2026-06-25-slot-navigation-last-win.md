# Slot Navigation and Last Win Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add wheel-style navigation to the slot header and preserve the latest credited positive win through non-winning outcomes.

**Architecture:** Extract pure helpers for positive-only last-win replacement and slot navigation entries so behavior is directly testable. Render the navigation entries in a shared header action component used by desktop and mobile slot headers.

**Tech Stack:** React, JavaScript, Node test runner, Vite

---

### Task 1: Lock navigation and last-win rules

**Files:**
- Create: `src/slotUiModel.js`
- Create: `src/slotUiModel.test.js`

- [ ] Write failing tests for base-aware `Start` and `Glücksrad` links.
- [ ] Write failing tests proving zero credited wins preserve the previous value and positive wins replace it.
- [ ] Run `node --test src/slotUiModel.test.js` and confirm failure because the module is absent.

### Task 2: Implement and integrate the UI model

**Files:**
- Create: `src/slotUiModel.js`
- Modify: `src/App.jsx`
- Modify: `src/styles.css`

- [ ] Implement the pure helpers required by Task 1.
- [ ] Add a shared slot header action component with `Start`, `Glücksrad`, and sound controls.
- [ ] Replace zero-value last-win writes with positive-only updates.
- [ ] Run `node --test src/slotUiModel.test.js` and confirm success.

### Task 3: Verify the complete app

**Files:**
- Verify: `src/*.test.js`

- [ ] Run `node --test src/*.test.js`.
- [ ] Run `npm run build`.
- [ ] Inspect `/slot` in the in-app browser and verify navigation targets, responsive layout, and console output.
