# Slot Navigation and Last Win Design

## Goal

Make navigation from `/slot` match the wheel game and keep the last credited positive win visible until another positive win replaces it.

## Header Navigation

The desktop and mobile slot title utility rows show one right-aligned action group containing:

1. `Start`, linking to the app root.
2. `Glücksrad`, linking to `/wheel`.
3. The existing sound toggle.

The links reuse the wheel's `audio-toggle wheel-nav-link` styling and the existing base-aware `buildAppPath` helper.

## Last Win Behavior

`lastWin` starts at zero. Losses, open risk decisions, and lost risk decisions leave it unchanged. Any positive credited payout replaces it, including normal wins, safe sheep decisions, and successful lion decisions.

## Verification

Tests cover the positive-only replacement rule and base-aware navigation destinations. Browser verification checks desktop navigation visibility, link targets, and that a loss does not clear an existing last-win display.
