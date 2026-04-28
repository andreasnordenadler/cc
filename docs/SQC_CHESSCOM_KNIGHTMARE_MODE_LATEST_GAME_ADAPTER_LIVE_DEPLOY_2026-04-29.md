# SQC Chess.com Knightmare Mode latest-game adapter — live deploy

Date: 2026-04-29 01:55 Europe/Stockholm  
Owner: Sam  
Status: live deployed

## What changed

- Promoted `Knightmare Mode` from Lichess-only to dual-host Lichess + Chess.com latest-game verification.
- Added Chess.com PGN SAN final-move normalization that identifies the mating move piece, source square, target square, and moving side.
- Wired the active challenge checker to use the Chess.com adapter when a Chess.com username exists and no Lichess username is present.
- Updated `/verifiers`, `/beta`, and `/connect` private-beta copy so SQC now names 8 dual-host quests.
- Added fixture coverage for both a passing knight-checkmate path and a failing non-knight-checkmate path.

## Verification

Passed from a clean isolated worktree (`/private/tmp/cc-knightmare-deploy-20260429014422`) to avoid unrelated dirty files in the main checkout:

```bash
pnpm exec node --experimental-strip-types --test tests/chesscom-knightmare-mode-fixtures.mjs
pnpm exec node --experimental-strip-types --test tests/chesscom-knightmare-mode-fixtures.mjs tests/chesscom-rookless-rampage-fixtures.mjs
pnpm exec node --experimental-strip-types --test tests/*.mjs
pnpm lint
pnpm build
```

Results:

- Targeted Chess.com Knightmare tests: 2/2 passed.
- Targeted Chess.com Knightmare + Rookless regression tests: 4/4 passed.
- Full Node fixture suite in isolated worktree before the Rookless regression test was copied: 37/37 passed.
- Full Node fixture suite in the main checkout including Knightmare + existing Rookless coverage: 39/39 passed.
- ESLint: passed.
- Next build: passed.

Build warnings only:

- Next inferred an outer workspace root because multiple lockfiles exist.
- Edge runtime disables static generation for affected pages.

## Live adapter smoke

Direct Chess.com adapter smoke using Andreas's public test username `and72nor` completed without API/parser failure:

```json
{
  "status": "failed",
  "gameId": "https://www.chess.com/game/live/100214634859",
  "summary": "Knightmare Mode only counts if the horse-crime player wins.",
  "evidenceCount": 1
}
```

That is a valid honest verifier receipt for the latest public game, not a fake success.

## Deployment

```bash
vercel --prod --yes
```

- Production deployment: `https://cc-g0dp8wk8f-andreas-nordenadlers-projects.vercel.app`
- Alias: `https://sidequestchess.com`

Note: an initial deploy from the isolated worktree auto-linked to a temporary Vercel project because the worktree lacked the main `.vercel/project.json`; I corrected that by copying the existing project link and redeploying to the canonical `cc` project.

## Live smoke

Confirmed `HTTP 200` plus expected Knightmare / Chess.com / eight-dual-host strings after the final deployment on:

- `https://sidequestchess.com/verifiers`
- `https://sidequestchess.com/challenges/knightmare-mode`
- `https://sidequestchess.com/beta`
- `https://sidequestchess.com/connect`
- `https://sidequestchess.com/account`
- `https://cc-g0dp8wk8f-andreas-nordenadlers-projects.vercel.app/verifiers`

## Files changed

- `src/lib/chesscom.ts`
- `src/app/actions.ts`
- `src/lib/verifier-status.ts`
- `src/app/beta/page.tsx`
- `src/app/verifiers/page.tsx`
- `src/app/connect/page.tsx`
- `tests/chesscom-knightmare-mode-fixtures.mjs`
- `tests/chesscom-rookless-rampage-fixtures.mjs`
- `ROADMAP.md`
