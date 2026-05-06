# SQC completed quest pill below seal — 2026-05-06

## Scope
Andreas shared a screenshot showing the `Quest completed...` pill was not visually centered under the seal and was covering the bottom part of the wax seal. He asked for it to sit below the seal instead.

## Changes made

- Removed rotation from the `.completed-quest-award` wrapper.
- Rotated only the wax seal image layer.
- Kept the date pill horizontal in the unrotated wrapper so it centers visually under the seal.
- Moved the pill down below the seal using `top: calc(100% + ...)` instead of anchoring it to the seal's bottom edge.

## Verification

- `pnpm lint` passed with only existing accepted warnings.
- `pnpm build` passed.
