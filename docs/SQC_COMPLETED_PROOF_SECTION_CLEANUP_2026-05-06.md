# SQC completed proof section cleanup — 2026-05-06

## Scope
Andreas said the left side of the Completed Proof section no longer made sense. He asked to remove that explanatory column and move links/data into a separate section.

## Changes made

- Converted the Completed Proof section into a scroll-first visual section.
- Removed the left explanatory copy/facts/share actions from `ProofPositionBoard`.
- Added a separate `Proof details` section below the scroll with:
  - quest name
  - receipt/game label
  - last move status
  - checked timestamp
  - sanitized proof summary
  - copy/share actions
  - links to proof page and proof log
- Kept real final-board rendering intact when final FEN exists.
- Updated proof-log usage of `ProofPositionBoard` to the simplified visual-only API.

## Verification

- `pnpm lint` passed with only existing accepted warnings.
- `pnpm build` passed.
