# SQC Chess.com No Castle latest-game adapter live deploy — 2026-04-28

## What changed

- Added the first Chess.com latest-game adapter for a win-required Side Quest Chess verifier: `No Castle Club`.
- The adapter fetches public Chess.com archives with the SQC User-Agent, selects the latest normalizable public game, parses PGN SAN move text, detects castling, normalizes side/result/rules/time class, and returns an honest pass/fail/pending receipt without requiring a pasted game URL.
- Wired `/account` active challenge checks so `No Castle Club` uses Lichess first when present, then Chess.com when only a Chess.com username is saved.
- Updated `/verifiers` copy/status so No Castle Club is clearly the first dual-host latest-game verifier.

## Public test account probe

- Username: `and72nor` (provided by Andreas for Chess.com API testing)
- Chess.com public archives found: `2023/04`, `2024/01`
- Latest normalizable public game used by the adapter: `https://www.chess.com/game/live/100214634859`
- Honest verdict for that latest game: `failed` because `and72nor` lost as Black; the adapter still proved the path can fetch, normalize, and evaluate the latest Chess.com game without a pasted URL.

## Verification

- `pnpm exec node --experimental-strip-types --test tests/chesscom-no-castle-club-fixtures.mjs` ✅
- `pnpm exec node --experimental-strip-types --test tests/*.mjs` ✅ (`22` tests)
- `pnpm lint` ✅
- `pnpm build` ✅
- Direct adapter smoke: `checkLatestChessComNoCastleClub('and72nor')` returned `failed` for `https://www.chess.com/game/live/100214634859` ✅
- Production deploy: `vercel --prod --yes` ✅
  - Deployment: `https://cc-41g7wl377-andreas-nordenadlers-projects.vercel.app`
  - Alias: `https://sidequestchess.com`
- Production smoke ✅
  - `https://sidequestchess.com/verifiers` returned `200` and contained the dual-host verifier copy.
  - `https://sidequestchess.com/challenges/no-castle-club` returned `200`.
  - `https://sidequestchess.com/account` returned `200` and contained Chess.com account copy.
  - Deploy URL `/verifiers` returned `200` and contained the dual-host verifier copy.
- Bounded Vercel deployment log stream opened successfully and showed no new runtime log lines during the watch window.

## Notes

The first dual-host implementation is intentionally scoped to `No Castle Club` because Chess.com PGN SAN is enough to verify castling/no-castling reliably without introducing a full legal move replay parser. More complex quests should get Chess.com adapters one at a time with fixture coverage for their exact evidence needs.
