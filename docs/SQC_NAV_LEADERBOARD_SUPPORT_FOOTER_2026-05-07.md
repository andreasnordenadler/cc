# SQC nav cleanup — Leaderboard removed, Support moved to footer — 2026-05-07

## Request
Andreas asked to remove Leaderboard for now and suggested moving Support to a quieter bottom footer link.

## Change
- Removed `Leaderboard` from the primary top navigation.
- Removed `Support` from the primary top navigation.
- Added a global bottom footer with a simple `Support` link to `/support`.
- Kept the existing `/scoreboard` and `/support` routes available directly; this only changes navigation prominence.

## Verification
- `pnpm lint` passed with warnings only.
- `pnpm build` passed.
