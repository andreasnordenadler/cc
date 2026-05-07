# SQC dated Coming Soon release queue — 2026-05-07

## Request
Andreas agreed to schedule Coming Soon quest releases and show the release date in the stamp, with Sam developing and testing each quest before its public date.

## Public schedule
Visible Coming Soon quests now use weekly Thursday dates:

1. Pawn-Only Picnic — 2026-05-14
2. Back Rank Goblin — 2026-05-21
3. Late Castle Lifestyle — 2026-05-28
4. Rook Lift Internship — 2026-06-04

## Change
- Added `releaseDate` metadata to scheduled Coming Soon quests.
- Updated Coming Soon stamp from generic `COMING SOON` to `Coming <date>`.
- Kept visible cap at four scheduled Coming Soon quests.

## Readiness rule
A scheduled quest should not become live unless these pass before release:
- verifier implemented for supported providers,
- latest-game flow tested,
- reset/repeat behavior tested,
- proof receipt/image tested,
- production smoke passed.

## Verification
- `pnpm lint` passed with warnings only.
- `pnpm build` passed.
