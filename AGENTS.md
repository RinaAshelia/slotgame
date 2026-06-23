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
- The balanced mode uses three fixed horizontal paylines (top, middle, bottom) with no line selector or diagonal payouts.
- Jackpot wins stay exclusive to the middle row even though the other two horizontal rows also pay normally.
- Wins are routed into `Schaf oder Loewe` once they are worth at least `4x` the current stake, starting at `Turri` and above on the base ladder.
- The risk choice appears as a blocking overlay, keeps the win uncredited until resolved, and also applies to jackpot wins.
- The risk overlay should show both sheep and lion motifs already in the question state, then keep a visible result state with the matching motif until the player closes it.
- Premium-casino audio should be synthesized in-browser first, with a visible mute toggle and initial cues for spin start, reel stop, regular win, feature trigger, risk resolution, and jackpot.
- The sound toggle should live as a right-aligned utility control in the hero/header rather than centered in the title stack.
- Live metrics (balance, round stake, last win) should stay visually above the round status; the status block stays visible but compact instead of becoming collapsible.
- The `Schaf` and `Löwe` overlay buttons should each fire their own animal-flavored click cue before the later risk outcome sound resolves.
- The visual atmosphere should use a subtle jackpot-character hero backdrop with gold spotlights and premium glow accents instead of a flat background, keeping the UI readable while making the birthday jackpot motif more present.
- The jackpot-character backdrop should stay visible in the initial above-the-fold hero area on load rather than sitting lower in the scrollable payout section.
- The desktop jackpot motif should live beside the reels as a dedicated full-body character stage rather than as a floating background figure, so the birthday jackpot motif feels anchored and intentional.
- The wheel game is a separate prize flow from the slot game. Its results never change an in-app balance and do not reuse the slot game's stake or payout logic.
- Wheel players receive exactly three spins per day/session. After the third result, the game stays closed and must not offer a new-round action.
- Wheel prizes are fixed labels for later fulfillment in Final Fantasy XIV: Turri = Glam-Item; Alucard = Chocobo-Sattel (Auswahl 100er Trials); Eden = 33 Flasks nach Wahl; Ashelia = 50 Bufffood; Poly = 100.000 GIL; Schaf = Niete; Löwe = 333.000 GIL; Jackpot = 1.250.000 GIL.
- Every wheel result overlay should show the matching symbol, character name, and exact prize. The session should retain all three results, including sheep losses.
- The wheel result history should sit directly below the spin button, keeping the action and its outcomes together.
- The wheel and spin button should form one left-hand unit, with the jackpot stage positioned immediately beside it on desktop.
- The wheel status panel should span the same usable width as the header through the right edge of the audio utility.
- The wheel's lion segment uses a red background and the jackpot segment uses a gold background.
- The wheel audio utility uses action labels: `Ton einschalten` while muted and `Ton ausschalten` while sound is active.
- Wheel grid children must allow shrinking with `min-width: 0`; on mobile the wheel is capped at `calc(100vw - 32px)`.
