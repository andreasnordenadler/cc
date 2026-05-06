# SQC proof details simplification — 2026-05-06

## Scope
Andreas asked to simplify the completed proof details area shown below the victory scroll.

## Changes made

- Removed the proof-details grid of separate data cards.
- Replaced it with one short receipt line: quest, completion date, and receipt label.
- Shortened action labels to `Copy proof` and `Share proof`.
- Kept secondary links as compact `Proof page` and `Proof log` buttons.
- Removed the completed active quest status dashboard from completed quest pages so the page does not repeat receipt/checker data below the scroll.

## Verification

- `pnpm lint` passed with only existing accepted warnings.
- `pnpm build` passed.
