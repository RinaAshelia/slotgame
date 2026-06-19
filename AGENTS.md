# Prototype Instructions

Run the local server yourself and open the preview in the in-app browser. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## Current Prototype Decisions

- Selected source visual: `src/assets/reference-selected.png`.
- Visual direction: `Loewe Slots` desktop hero in red, gold, black with a premium casino look.
- Motif set: blonde cat girl, pink elf girl, white wolf boy, blonde heart girl, full dark wolf/cat character, lion, sheep.
- Jackpot motif: gold-suited white wolf/cat boy with top hat and cash.
- Interaction expectation: fully interactive 3-reel slot machine with spin animation, win logic, adjustable bet, and jackpot state on a single visible middle payline.
- Desktop should expose the same adjustable bet and round metrics (balance, last win, total stake) already shown on tablet/mobile.
- Start balance should stay tight to the default round stake, targeting roughly 30-35 default spins instead of a very long session.
- All player-facing currency and stake displays should use `GIL`, not `€`.
- Jackpot display and jackpot payout stay fixed at `1.250.000,00 GIL`, independent of the current bet.
- The regular bet ladder should support higher-risk values above `10 GIL`; current target ladder is `2.5 / 5 / 10 / 25 / 50 / 100 GIL`.
- Non-jackpot payouts should scale directly with the current stake from a shared payout helper; sheep must always return exactly the full current stake.
- The `Linien` control is removed entirely for simplicity; payout board and win logic should track only the current bet.
- The dedicated `All in` button is removed in favor of a post-win `Schaf oder Loewe` decision.
- Base payout ladder is tuned to the expanded stake ladder with stronger high-tier separation: jackpot 1,250,000, lion 100, white wolf 50, dark wolf 25, pink elf 15, blonde cat 10, blonde heart 5, sheep returns the exact current stake.
- The game UI should keep a visible rules and status block near the controls so inexperienced players immediately understand the single payline, sheep return, fixed jackpot, and `Schaf oder Loewe` risk choice.
- The payout board should be grouped into top hits, solid wins, and sheep return, and it should always show values for the current bet with the most recent winning symbol visually highlighted.
- Metrics hierarchy should prioritize current balance and round stake over last win.
- Wins are only routed into `Schaf oder Loewe` when they are worth at least `10x` the current stake.
- The risk choice appears as a blocking overlay, keeps the win uncredited until resolved, and also applies to jackpot wins.
