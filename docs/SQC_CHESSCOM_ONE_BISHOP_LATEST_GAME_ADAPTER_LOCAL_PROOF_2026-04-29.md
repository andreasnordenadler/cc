# Side Quest Chess — Chess.com One Bishop latest-game adapter local proof

Date: 2026-04-29 02:50 Europe/Stockholm
Scope: bounded autonomous CC / Side Quest Chess verifier-parity burst

## What changed

Promoted `One Bishop to Rule Them All` from Lichess-only to dual-host Lichess + Chess.com latest-game verification in the local checkout.

## Implementation proof

- Added Chess.com PGN final-minor-piece normalization in `src/lib/chesscom.ts`.
- Added `checkLatestChessComOneBishopToRuleThemAll(...)` using the existing Chess.com public archive flow and the same honest pass/fail/pending shape as other dual-host latest-game adapters.
- Wired active challenge checks in `src/app/actions.ts` so a saved Chess.com username can verify `one-bishop-to-rule-them-all` when no Lichess username is stored.
- Updated `src/lib/verifier-status.ts` copy to mark the quest as `Live-backed Lichess + Chess.com latest-game verifier`.
- Added fixture coverage in `tests/chesscom-one-bishop-fixtures.mjs` for:
  - a passing Chess.com PGN where exactly one final player bishop remains;
  - a failing PGN where extra minor pieces remain.

## Verification run

- `node --test tests/chesscom-one-bishop-fixtures.mjs` — pass, 2/2 tests.
- `pnpm lint` — pass.
- `pnpm build` — pass. Next.js production build compiled, typechecked, and generated all routes successfully.

## Deployment status

Not deployed from this dirty shared checkout. The repo already contains many unrelated modified/untracked files, including badge/logo assets and prior docs, so shipping directly from this worktree would risk bundling unrelated work. This burst stops at local build proof.

## User-visible impact after safe deploy

The private-beta verifier path will increase from seven to eight dual-host latest-game quests: the three beginner quests, `No Castle Club`, `Queen? Never Heard of Her`, `Pawn Storm Maniac`, `Rookless Rampage`, and `One Bishop to Rule Them All`.

## Recommended next step

Deploy this adapter from a clean isolated worktree or after reconciling the existing dirty checkout, then smoke `/verifiers`, `/challenges/one-bishop-to-rule-them-all`, and `/account` on `https://sidequestchess.com`.
