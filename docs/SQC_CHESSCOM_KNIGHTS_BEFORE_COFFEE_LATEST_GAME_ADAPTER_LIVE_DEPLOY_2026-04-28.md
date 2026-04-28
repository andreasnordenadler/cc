# SQC Chess.com Knights Before Coffee latest-game adapter live deploy — 2026-04-28

## What changed

- Added Chess.com latest-game verification for `Knights Before Coffee`, the first beginner quest to become dual-host after `No Castle Club`.
- The adapter fetches public Chess.com archives, selects the latest normalizable public game, parses PGN SAN move text, derives the first four player move piece types, and returns honest pass/fail/pending receipts without pasted game URLs.
- Wired `/account` active challenge checks so `Knights Before Coffee` uses Lichess first when present, then Chess.com when only a Chess.com username is saved.
- Updated verifier status copy so `/verifiers` and the challenge detail page show `Live-backed Lichess + Chess.com latest-game verifier` with Chess.com PGN evidence.

## Public test account probe

- Username: `and72nor` (provided by Andreas for Chess.com API testing)
- Latest normalizable public game used by the adapter: `https://www.chess.com/game/live/100214634859`
- Honest verdict for that latest game: `failed` because `and72nor` lost as Black; the adapter still proved the path can fetch, normalize, and evaluate the latest Chess.com game without a pasted URL.

## Verification

- `pnpm exec node --experimental-strip-types --test tests/chesscom-knights-before-coffee-fixtures.mjs tests/chesscom-no-castle-club-fixtures.mjs tests/knights-before-coffee-fixtures.mjs` ✅
- `pnpm exec node --experimental-strip-types --test tests/*.mjs` ✅ (`26` tests)
- `pnpm lint` ✅
- `pnpm build` ✅
- Direct adapter smoke: `checkLatestChessComKnightsBeforeCoffee('and72nor')` returned `failed` for `https://www.chess.com/game/live/100214634859` ✅
- Production deploy: `vercel --prod --yes` ✅
  - Deployment: `https://cc-4p1onupdw-andreas-nordenadlers-projects.vercel.app`
  - Alias: `https://sidequestchess.com`
- Production smoke ✅
  - `https://sidequestchess.com/verifiers` returned `200` and contained `Live-backed Lichess + Chess.com latest-game verifier`, `Chess.com PGN moves`, and `Knights Before Coffee`.
  - `https://sidequestchess.com/challenges/knights-before-coffee` returned `200` and contained the dual-host verifier copy.
  - `https://sidequestchess.com/account` returned `200`.
  - Deploy URL `/verifiers` returned `200`.
- Vercel production error scan: `pnpm exec vercel logs --environment production --level error --since 10m --no-follow --limit 20` returned no logs ✅

## Notes

This keeps the private-beta hardening path moving from Lichess-only toward dual-host support one verifier at a time. `Knights Before Coffee` is a good Chess.com target because PGN SAN is enough to classify the first four player moves without full legal move replay.
