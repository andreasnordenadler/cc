# BlunderCheck v1 — Lichess latest-game queenless adapter

Date: 2026-04-26 13:40 Europe/Stockholm  
Owner: Sam

## What changed

Moved the canonical `Queen? Never Heard of Her` active checker one step closer to real automatic verification:

- added a Lichess latest-games adapter for the queenless challenge path;
- normalized Lichess NDJSON game exports into the existing provider-neutral `QueenChallengeGame` shape;
- added a small UCI move replayer that records captured pieces, including queen-capture evidence;
- wired `/account` active-check server action to use the real Lichess latest-game lookup when a Lichess username is saved;
- kept deterministic fixture fallback when no Lichess username is present, so the prototype remains reviewable without credentials;
- added fixture coverage proving UCI moves become queen-capture evidence and pass the queenless rule.

## Files touched

- `src/lib/queen-never-heard-of-her.ts`
- `src/app/actions.ts`
- `tests/queen-never-heard-of-her-fixtures.mjs`
- `.learnings/ERRORS.md` — logged the absolute-path smoke command recovery

## Verification

- `node --experimental-strip-types --test tests/queen-never-heard-of-her-fixtures.mjs` ✅
- `pnpm lint` ✅
- `pnpm build` ✅
- Local route smoke on the running dev server (`http://localhost:3011`) ✅
  - `/` → 200
  - `/challenges` → 200
  - `/challenges/queen-never-heard-of-her` → 200
  - `/connect` → 200
  - `/account` → 200
  - `/result` → 200

## Limitations / next adapter step

- This is a Lichess latest-game path only; Chess.com latest-game normalization for queenless proof is still pending.
- The adapter evaluates the newest normalizable public bullet/blitz/rapid game. A follow-up should scan several recent games and report the best candidate rather than only the newest game.
- The UCI replayer is intentionally small and focused on capture evidence needed for v1 side-quest verification; it is not an engine or analysis layer.
