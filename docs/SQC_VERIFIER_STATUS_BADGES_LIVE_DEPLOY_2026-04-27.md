# SQC verifier status badges live deploy — 2026-04-27

## Change

Surfaced the public verifier truth state directly where players choose and inspect dares:

- Extracted verifier status copy into `src/lib/verifier-status.ts` so `/verifiers`, `/challenges`, and challenge detail pages share one source of truth.
- Added `Live-backed`, `Next adapter`, and `Specified` verifier badges to challenge hub cards.
- Added the same honest verifier state to challenge detail hero rows.
- Replaced generic verifier-direction copy on challenge detail pages with the exact verifier summary, evidence note, promise, and a link back to `/verifiers`.

## Why

The public verifier board was useful, but players still had to visit a separate page to know which dares are actually live-backed. This makes the proof promise visible at the moment a player chooses a quest, without pretending every starter challenge already has automated verification.

## Verification

- `pnpm lint` ✅
- `pnpm build` ✅
- Local production smoke on `127.0.0.1:3047` ✅
  - `/challenges` contained `Live-backed`, `Next adapter`, `Specified`, and the live-backed promise text.
  - `/challenges/queen-never-heard-of-her` contained `Live-backed`, `Live-backed Lichess latest-game verifier`, and `Open verifier board`.
  - `/verifiers` still contained the verifier-board headline and live-backed verifier summary.
- Production deploy ✅
  - Deployment: `https://cc-nymyueqmx-andreas-nordenadlers-projects.vercel.app`
  - Alias: `https://sidequestchess.com`
- Production smoke ✅
  - `https://sidequestchess.com/challenges`
  - `https://sidequestchess.com/challenges/queen-never-heard-of-her`
  - `https://sidequestchess.com/verifiers`
  - `https://sidequestchess.com/rules`
- Vercel log scan ✅
  - Bounded `vercel logs` check produced no detected 5xx/error output in `/tmp/cc-verifier-status-log-scan.txt`.

## Notes

During verification I corrected two smoke-check assumptions: `/rules` says `no PGN homework` with lowercase copy, and the Vercel logs CLI follows by default unless bounded with `timeout`.
