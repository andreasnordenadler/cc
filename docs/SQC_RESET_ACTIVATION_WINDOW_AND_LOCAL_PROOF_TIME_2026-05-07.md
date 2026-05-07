# SQC reset activation window and local proof time — 2026-05-07

## Report
Andreas verified reset mostly worked, but reactivating the same quest could immediately complete it again. He also noticed proof time did not account for the user's timezone.

## Root cause
- Reset removed saved completion state, but latest-game verification could still evaluate the same latest game that finished before the new quest activation.
- Latest-game payloads were also dropping `completedGameAt` before metadata writes, making activation-window checks and proof timing less reliable.
- Proof labels were rendered with server/default date formatting and often date-only labels.

## Change
- Latest-game checks now receive the current activation timestamp.
- A passed latest-game result is downgraded to pending if its `completedGameAt` is missing or is not after the active quest `startedAt`.
- Manual submitted-game verification applies the same activation-window rule when a quest is active/restarted.
- Latest-game payloads now preserve proof receipt fields such as `completedGameAt`, final FEN, and last move.
- Added browser-local `ProofTime` rendering for visible proof labels.
- Share image fetching appends the browser timezone (`tz`) to the proof image URL.
- The proof image route validates and uses `tz` to render the generated scroll timestamp with local time and timezone abbreviation.

## Verification
- `pnpm lint` passed with pre-existing warnings only.
- `pnpm build` passed.
