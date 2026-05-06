# SQC completed card seal centering — 2026-05-06

## Scope
Andreas shared a completed quest card screenshot and asked to move the wax seal to the center of the card.

## Changes made

- Updated `.card-completed-award` positioning from fixed left/top offsets to true card-centering:
  - `left: 50%`
  - `top: 50%`
  - `transform: translate(-50%, -50%)`
- Kept the compact seal size and pill placement intact.

## Verification

- `pnpm lint` passed with only existing accepted warnings.
- `pnpm build` passed.
