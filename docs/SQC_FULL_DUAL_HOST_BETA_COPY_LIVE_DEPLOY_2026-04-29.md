# SQC full dual-host beta-copy live deploy — 2026-04-29

## Summary

Tightened the private-beta status copy now that every current Side Quest Chess starter-deck verifier supports both Lichess and Chess.com latest-game receipts.

## Changed

- `/beta`: replaced stale partial-parity wording with full dual-host starter-deck language.
- `/verifiers`: replaced the confusing `Lichess-only next: 0 quests` posture with a clear `Full deck parity / 0 left` status when no Lichess-only verifiers remain.
- Kept the page logic dynamic so future Lichess-only quests still render the old parity-queue framing honestly.

## Verification

- `pnpm lint` ✅
- `pnpm build` ✅
- Production deploy ✅
  - Deploy URL: `https://cc-q8lcnn2u3-andreas-nordenadlers-projects.vercel.app`
  - Alias: `https://sidequestchess.com`
- Live smoke ✅
  - `https://sidequestchess.com/beta` returned `200` and contained:
    - `full dual-host deck`
    - `All ten current starter-deck quests`
    - `Every current starter-deck quest now works on Lichess or Chess.com`
  - `https://sidequestchess.com/verifiers` returned `200` and contained:
    - `Full deck parity`
    - `0 left`
    - `Every current starter-deck dare can read either Lichess UCI evidence or Chess.com PGN evidence today.`

## Notes

- Smoke checks used Python `urllib.request` because `curl` was unavailable in this shell.
- A bounded plain `vercel logs` watch produced no output before timeout; deployment build itself completed successfully and live route smoke passed.
