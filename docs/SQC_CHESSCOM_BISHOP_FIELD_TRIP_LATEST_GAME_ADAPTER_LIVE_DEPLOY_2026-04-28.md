# SQC Chess.com Bishop Field Trip latest-game adapter — live deploy proof

Date: 2026-04-28 16:40-16:55 Europe/Stockholm
Project: CC / Side Quest Chess

## Shipped

Promoted `Bishop Field Trip` from Lichess-only to dual-host latest-game verification.

- Added Chess.com PGN normalization for `Bishop Field Trip`.
- The adapter checks the saved Chess.com username's latest public games, normalizes SAN move text, and detects whether both original bishops left home before the player queen moved.
- Kept the existing SQC quest canon: standard chess, bullet/blitz/rapid posture, and player win required.
- Wired `/account` latest-game checks to use Chess.com when a Chess.com username is saved and no Lichess username is present.
- Updated verifier copy so `/verifiers` marks `Bishop Field Trip` as `Live-backed Lichess + Chess.com latest-game verifier`.

## Verification

Local:

- `pnpm exec node --experimental-strip-types --test tests/chesscom-bishop-field-trip-fixtures.mjs tests/chesscom-knights-before-coffee-fixtures.mjs tests/chesscom-no-castle-club-fixtures.mjs` ✅
- `pnpm exec node --experimental-strip-types --test tests/*.mjs` ✅ — 28/28 tests passed
- `pnpm lint` ✅
- `pnpm build` ✅
- Direct adapter smoke for Andreas Chess.com test account `and72nor` ✅
  - Result: latest observed Chess.com game normalized successfully and returned honest `failed` because the bishop-tour player did not win.

Deploy:

- `vercel --prod --yes` ✅
- Production deployment: `https://cc-744n97yoe-andreas-nordenadlers-projects.vercel.app`
- Alias: `https://sidequestchess.com` ✅

Live smoke:

- `https://sidequestchess.com/verifiers` HTTP 200 ✅
- `https://sidequestchess.com/challenges/bishop-field-trip` HTTP 200 ✅
- `https://sidequestchess.com/account` HTTP 200 ✅
- `https://cc-744n97yoe-andreas-nordenadlers-projects.vercel.app/verifiers` HTTP 200 ✅
- Live `/verifiers` contains `Bishop Field Trip` and `Live-backed Lichess + Chess.com latest-game verifier` ✅
- Deployment error-log check: no logs found / no deployment error logs returned ✅

## Notes

`Bishop Field Trip` is now the third dual-host SQC verifier after `No Castle Club` and `Knights Before Coffee`. `Early King Walk` remains Lichess-only and is the next obvious dual-host promotion candidate.
