# SQC Chess.com Early King Walk latest-game adapter — live deploy proof

Date: 2026-04-28 17:40-17:55 Europe/Stockholm
Project: CC / Side Quest Chess

## Shipped

Promoted `Early King Walk` from Lichess-only to dual-host latest-game verification.

- Added Chess.com PGN normalization for `Early King Walk`.
- The adapter checks the saved Chess.com username's latest public games, normalizes SAN move text, and detects the first non-castling player king move.
- Castling is tracked but does not count as a king walk.
- Kept the existing SQC quest canon: standard chess, bullet/blitz/rapid posture, and player win required.
- Wired `/account` latest-game checks to use Chess.com when a Chess.com username is saved and no Lichess username is present.
- Updated verifier copy so `/verifiers` marks `Early King Walk` as `Live-backed Lichess + Chess.com latest-game verifier`.

## Verification

Local:

- `pnpm exec node --experimental-strip-types --test tests/chesscom-early-king-walk-fixtures.mjs` ✅ — 3/3 tests passed
- `pnpm exec node --experimental-strip-types --test tests/*.mjs` ✅ — 31/31 tests passed
- `pnpm lint` ✅
- `pnpm build` ✅
- Direct adapter smoke for Andreas Chess.com test account `and72nor` ✅
  - Result: latest observed Chess.com game normalized successfully and returned honest `failed` because the Early King Walk player did not win.

Deploy:

- `vercel --prod --yes` ✅
- Production deployment: `https://cc-bil366uw1-andreas-nordenadlers-projects.vercel.app`
- Alias: `https://sidequestchess.com` ✅

Live smoke:

- `https://sidequestchess.com/verifiers` HTTP 200 ✅
- `https://sidequestchess.com/challenges/early-king-walk` HTTP 200 ✅
- `https://sidequestchess.com/account` HTTP 200 ✅
- `https://cc-bil366uw1-andreas-nordenadlers-projects.vercel.app/verifiers` HTTP 200 ✅
- Live `/verifiers` contains `Early King Walk`, `Live-backed Lichess + Chess.com latest-game verifier`, and `Chess.com PGN` ✅
- Live `/challenges/early-king-walk` contains `Early King Walk`, `Live-backed`, and `non-castling king move` ✅
- Live `/account` contains `Early King Walk`, `Quest launcher`, and `Chess.com:` ✅
- Vercel production error-log scan: no production error-level logs returned in the last 30 minutes ✅

## Notes

All three beginner quests (`Knights Before Coffee`, `Bishop Field Trip`, and `Early King Walk`) now support both Lichess and Chess.com latest-game checks. The private-beta verifier path now has four dual-host quests including `No Castle Club`.
