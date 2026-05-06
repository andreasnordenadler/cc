# SQC completed proof scroll layout fix — 2026-05-06

## Scope
Andreas liked the victory scroll direction, but the date/points pills at the bottom were not visible in the Completed Proof scroll. He suggested making the scroll wider and compacting the text to the left.

## Changes made

- Rebalanced the Completed Proof card layout:
  - left copy column is now narrower/compact
  - scroll column is wider
  - card aligns from the top instead of vertically centering the scroll
- Increased the proof scroll width and height.
- Reduced scroll text width/font slightly to reduce wrapping.
- Added bottom spacing so the date/points pills sit visibly above the wax seal.
- Slightly reduced/repositioned the seal within the proof scroll.

## Verification

- `pnpm lint` passed with only existing accepted warnings.
- `pnpm build` passed.
