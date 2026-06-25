# Wheel Prize Board Design

## Goal

Make all eight fixed wheel prizes discoverable before the first spin without competing with the wheel or extending the mobile page unnecessarily.

## Approved layout

- Desktop shows a compact premium-casino prize board below the status panel and above the wheel cluster.
- Mobile uses the same board as a native expandable section labelled `Alle Preise ansehen`, placed before the wheel and collapsed initially.
- Each entry displays its existing motif, character name, and exact fixed prize.
- Entries are ordered by prize prominence: Jackpot, Löwe, Poly, Turri, Alucard, Eden, Ashelia, Schaf.
- The most recently landed segment is highlighted after a spin.

## Behavior

- Prize data is derived from one exported wheel-prize configuration shared by the wheel, prize board, and result logic.
- Desktop content is always visible.
- Mobile content is keyboard-accessible through a native `details`/`summary` control.
- The spin counter uses singular grammar for one remaining spin.
- Existing wheel odds, spin behavior, overlays, history, and jackpot stage remain unchanged.

## Accessibility

- The board is a semantic list and provides the text alternative currently missing from the decorative SVG wheel.
- Decorative motif images use empty alternative text because the adjacent labels contain the meaning.
- The native expandable control exposes its open state without custom ARIA scripting.

## Verification

- Model tests cover prize-board ordering and the remaining-spin label.
- Existing test suite and production build pass.
- Desktop and 390px mobile screenshots verify placement, density, collapsed state, expansion, and active-result highlighting.
