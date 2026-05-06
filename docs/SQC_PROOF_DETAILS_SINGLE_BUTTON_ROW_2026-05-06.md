# SQC proof details single button row — 2026-05-06

## Scope
Andreas asked to put all proof details buttons on one row.

## Changes made

- Let `ShareProofActions` accept extra action children in the same button row.
- Moved `Proof page` and `Proof log` links into the same row as `Copy proof` and `Share proof`.
- Kept mobile wrapping available for narrow screens.

## Verification

- `pnpm lint` passed with only existing accepted warnings.
- `pnpm build` passed.
