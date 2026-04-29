# SQC Chess.com Blunder Gambit latest-game adapter — live deploy proof

Date: 2026-04-29 04:40 Europe/Stockholm  
Owner: Sam  
Project: CC / Side Quest Chess

## What changed

- Promoted `The Blunder Gambit` from Lichess-only latest-game verification to dual-host Lichess + Chess.com latest-game verification.
- Added Chess.com PGN SAN capture normalization for early player knight/bishop/rook losses, including castling, en passant capture handling, promotion board updates, and latest public archive lookup.
- Wired the saved Chess.com username path into the existing latest-game action fallback after Lichess.
- Updated verifier status copy so `/verifiers` and the challenge detail page describe the quest as live-backed on both Lichess and Chess.com.

## Verification before deploy

- `pnpm exec node --experimental-strip-types --test tests/chesscom-blunder-gambit-fixtures.mjs` — pass, 2/2.
- `pnpm exec node --experimental-strip-types --test tests/*.mjs` — pass, 43/43.
- `pnpm lint` — pass.
- `pnpm build` — pass.
- Direct Chess.com adapter smoke for public username `and72nor` — completed; latest public game normalized and returned an honest failed verdict for `https://www.chess.com/game/live/100214634859` because the player did not win.

## Deployment proof

Production deploy completed via Vercel.

- Preview/production deployment URL: `https://cc-299efwx2j-andreas-nordenadlers-projects.vercel.app`
- Production alias: `https://sidequestchess.com`
- Vercel build completed successfully and aliased the deployment to production.

## Live smoke checklist

- `https://sidequestchess.com/verifiers` — 200; contains `The Blunder Gambit`, `Chess.com PGN`, and `Live-backed Lichess + Chess.com latest-game verifier`.
- `https://sidequestchess.com/challenges/the-blunder-gambit` — 200; contains `The Blunder Gambit`, `Chess.com`, and early material-hang copy.
- `https://sidequestchess.com/account` — 200.
