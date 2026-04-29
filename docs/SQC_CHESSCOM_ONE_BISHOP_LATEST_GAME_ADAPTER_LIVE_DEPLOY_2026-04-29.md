# Side Quest Chess — Chess.com One Bishop latest-game adapter live deploy

Date: 2026-04-29 03:46 Europe/Stockholm
Scope: bounded autonomous CC / Side Quest Chess verifier-parity burst

## What shipped

Promoted `One Bishop to Rule Them All` from Lichess-only to dual-host Lichess + Chess.com latest-game verification and deployed it to production.

## Implementation

- Added Chess.com PGN final-minor-piece normalization in `src/lib/chesscom.ts`.
- Added `checkLatestChessComOneBishopToRuleThemAll(...)` using the existing Chess.com public archive flow.
- Wired active challenge checks in `src/app/actions.ts` so saved Chess.com usernames can verify the quest when no Lichess username is stored.
- Updated verifier status and beta/connect/verifier copy to show 9 dual-host quests.
- Added fixture coverage in `tests/chesscom-one-bishop-fixtures.mjs` for pass/fail PGN cases.

## Verification

- `pnpm exec node --experimental-strip-types --test tests/chesscom-one-bishop-fixtures.mjs` — pass, 2/2 tests.
- `pnpm lint` — pass.
- `pnpm build` — pass.
- `vercel --prod --yes` — deployed `https://cc-jcb9av65i-andreas-nordenadlers-projects.vercel.app` and aliased `https://sidequestchess.com`.
- Live smoke:
  - `https://sidequestchess.com/verifiers` — 200; confirmed `One Bishop to Rule Them All`, `Live-backed Lichess + Chess.com latest-game verifier`, `9 quests`, and One Bishop dual-host copy.
  - `https://sidequestchess.com/challenges/one-bishop-to-rule-them-all` — 200; confirmed One Bishop live-backed verifier copy and rule text.
  - `https://sidequestchess.com/account` — 200; confirmed One Bishop and Chess.com strings.
  - `https://sidequestchess.com/beta` — 200; confirmed `9 dual-host quests` and One Bishop copy.
  - `https://sidequestchess.com/connect` — 200; confirmed One Bishop Chess.com support copy.
- Bounded Vercel logs check after deploy returned no output.

## User-visible impact

The private-beta verifier path now has nine dual-host latest-game quests: the three beginner quests, `No Castle Club`, `Queen? Never Heard of Her`, `Pawn Storm Maniac`, `Knightmare Mode`, `Rookless Rampage`, and `One Bishop to Rule Them All`.
