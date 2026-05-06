# SQC completed proof scroll fallback — 2026-05-06

## Scope
Andreas showed the completed quest page still displayed the simple `Proof accepted` panel in the Completed Proof section. The intended good-news share surface should appear there too: coat of arms, quest-relevant lightly mocking copy, and canonical wax seal.

## Changes made

- Reworked `ProofPositionBoard` missing-board fallback from the plain `PROOF ACCEPTED` panel into the same parchment-style victory scroll concept.
- The completed proof fallback now includes:
  - unlocked coat of arms at the top
  - quest-specific Side Quest Chess achievement copy
  - proof accepted line
  - date and points
  - canonical SQC wax seal at the bottom
- Updated `ProofPositionBoard` to receive the full `challenge` object so it can render the coat of arms and use quest-specific tone.
- Updated challenge detail and proof log call sites.
- Kept final-board rendering intact when `finalPositionFen` exists.

## Verification

- `pnpm lint` passed with only existing accepted warnings.
- `pnpm build` passed.
