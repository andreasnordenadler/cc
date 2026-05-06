# SQC global completed seal treatment — 2026-05-06

## Scope
Andreas pointed out that completed quest cards still used the old yellow `Completed quest` stamp. He asked for the canonical wax seal plus `Quest completed...` pill treatment to be used there too, and said this should be true everywhere.

## Changes made

- Replaced the completed quest card yellow stamp in `ChallengeCard` with the canonical completed award markup:
  - canonical SQC wax seal asset
  - horizontal `Quest completed` pill beneath it
- Added compact card-specific completed-award CSS so the seal/pill fits quest cards without covering too much of the content.
- Kept the larger completed quest detail hero treatment intact.

## Verification

- `pnpm lint` passed with only existing accepted warnings.
- `pnpm build` passed.
