# Slot Fun Profile Design

## Goal

Make `/slot` feel substantially more rewarding without changing its payout ladder, fixed jackpot amount, risk feature, bet ladder, or `400 GIL` starting balance.

## Outcome Model

- Every supported stake targets exactly `24%` total hits.
- Sheep remains a push and returns the current stake.
- Profitable hits target roughly `16%`.
- Near misses drop from `15.5%` to `9%`.
- Mixed losing outcomes fill the remaining probability.
- The theoretical RTP targets `92%` for every supported stake.

## Jackpot Treatment

The jackpot remains fixed at `1,250,000 GIL`. Its probability scales linearly with the stake so its RTP contribution remains constant across the bet ladder. The base-stake jackpot probability is reduced to keep the huge fixed prize from consuming too much of the return budget and to move that budget into visible regular wins.

## Implementation

`getOutcomeProfile(stake)` computes the jackpot, blonde-cat, and sheep probabilities needed to preserve both the hit-rate and RTP constraints. The other symbol probabilities remain fixed and readable. The old high-stake premium boost is removed because it makes RTP depend on stake.

The `400 GIL` initial balance moves to an exported game constant so the retained decision is covered by a regression test.

## Verification

Automated tests verify:

- `400 GIL` starting balance.
- `24%` hit rate and `9%` near-miss rate.
- Roughly `16%` profitable-hit rate.
- `92%` RTP at every supported stake.
- Constant jackpot RTP contribution across stakes.
- Existing payouts, paylines, and risk behavior remain unchanged.
