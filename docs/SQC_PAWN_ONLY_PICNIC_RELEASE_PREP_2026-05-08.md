# Pawn-Only Picnic release prep — 2026-05-08

Status: release-prep slice complete; quest remains Coming Soon for the scheduled 2026-05-14 release.

## Implemented

- Added reusable `src/lib/pawn-only-picnic.ts` verifier logic.
- Rule: player must win a standard bullet/blitz/rapid game after making the first eight player moves with pawns only.
- Added Lichess latest-game adapter using public NDJSON UCI move text.
- Added Chess.com latest-game adapter using public archive PGN move text.
- Wired `buildLatestGameCheck` for `pawn-only-picnic` so the existing latest-game/checker path is ready when the quest is promoted from Coming Soon into the live deck.

## Tested locally

- Fixture pass: eight opening pawn moves + win.
- Fixture fail: a knight/non-pawn appears before player move eight.
- Fixture fail: pawn-only opening but the player does not win.
- Lichess UCI normalization: extracts first eight player move pieces.
- Proof receipt/image support: `buildProofPositionFromUciMoves` returns a final FEN + last move for a Pawn-Only Picnic proof candidate.

## Reset/repeat behavior

No new reset-specific code was required. The existing latest-game flow already gates passed checks through activation time in `buildLatestGameCheckPayload`; after reset/restart, a game completed before the new `startedAt` is downgraded to pending. Pawn-Only Picnic uses that same path once live.

## Release-day checklist — 2026-05-14

1. Move `pawn-only-picnic` from the Coming Soon queue into `CHALLENGES` (or otherwise expose it in the live quest deck).
2. Add its verifier status to `/verifiers` as live/verified if the public page should advertise it.
3. Run `pnpm lint` and `pnpm build`.
4. Production smoke after deploy: `/challenges`, `/challenges/pawn-only-picnic`, `/verifiers`, `/result` proof receipt/image path.
5. Only then make it live on `sidequestchess.com`.

## Notes

The quest was intentionally not made live in this slice because the public release date is 2026-05-14 and the current launch-candidate baseline should not be disturbed before then.
