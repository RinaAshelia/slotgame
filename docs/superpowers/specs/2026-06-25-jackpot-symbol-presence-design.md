# Jackpot Symbol Presence Design

## Goal

Make the jackpot feel visually reachable while preserving the existing jackpot probability, hit rate, payout, and RTP.

## Behavior

Only losing `mixed` outcomes receive visual jackpot teasers. Their internal thresholds are calibrated against the `67%` mixed-outcome rate so the overall spin rates are:

- `8%` of mixed outcomes contain exactly one jackpot symbol.
- `1%` of mixed outcomes contain exactly two jackpot symbols on the middle row.
- The remaining mixed outcomes contain no jackpot symbols.

The two-symbol result remains non-winning. Three jackpots are still produced only by the existing real jackpot outcome and pay only on the middle row.

## Architecture

Move final-reel construction into `slotReels.js`. The model accepts injected random values for deterministic tests. `App.jsx` keeps only symbol display data and calls the model for resolved reels.

## Verification

Tests verify teaser thresholds, exact jackpot counts, no accidental payline wins, and unchanged jackpot math in `gameMath.js`.
