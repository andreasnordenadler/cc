# SQC completed quest pill centered under seal — 2026-05-06

## Scope
Andreas approved the canonical wax seal and asked to simplify the `Quest completed...` pill: place it centered directly under the seal and make it horizontal/no slant.

## Changes made

- Kept the canonical wax seal placement unchanged.
- Moved the completed-date pill slightly lower so it sits directly under the seal.
- Counter-rotated the pill against the rotated seal group so the pill appears horizontal.
- Adjusted the mobile pill offset consistently.

## Verification

- `pnpm lint` passed with only existing accepted warnings.
- `pnpm build` passed.
