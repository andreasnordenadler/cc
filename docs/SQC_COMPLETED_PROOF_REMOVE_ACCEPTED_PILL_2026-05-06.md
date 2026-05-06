# SQC completed proof remove accepted pill — 2026-05-06

## Scope
Andreas asked to remove the `accepted` pill from the Completed Proof / Victory proof section header.

## Changes made

- Removed the green `accepted` badge from `src/app/challenges/[id]/page.tsx` in the completed proof header.
- Kept the proof/scroll content unchanged.

## Verification

- `pnpm lint` passed with only existing accepted warnings.
- `pnpm build` passed.
