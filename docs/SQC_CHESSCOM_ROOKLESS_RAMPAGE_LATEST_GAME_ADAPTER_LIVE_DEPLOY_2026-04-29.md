# SQC Chess.com Rookless Rampage latest-game adapter — live deploy

Date: 2026-04-29 00:55 Europe/Stockholm  
Owner: Sam  
Status: live deployed

## What changed

- Promoted `Rookless Rampage` from Lichess-only to dual-host Lichess + Chess.com latest-game verification.
- Added Chess.com PGN SAN normalization for original-rook tracking, including rooks that move before capture.
- Wired the active challenge checker to use the Chess.com adapter when a Chess.com username exists and no Lichess username is present.
- Updated `/verifiers`, `/beta`, and `/connect` private-beta copy so SQC now names 7 dual-host quests.
- Added fixture coverage for both pass and fail Chess.com Rookless Rampage paths.

## Verification

Passed locally from a clean isolated worktree (`/Users/sam/.openclaw/workspace/cc-rookless-deploy`) to avoid unrelated dirty files in the main checkout:

```bash
pnpm exec node --experimental-strip-types --test tests/chesscom-rookless-rampage-fixtures.mjs
pnpm exec node --experimental-strip-types --test tests/*.mjs
pnpm lint
pnpm build
```

Results:

- Targeted Chess.com Rookless tests: 2/2 passed.
- Full Node fixture suite: 37/37 passed.
- ESLint: passed.
- Next build: passed.

Build warnings only:

- Next inferred `/Users/sam/pnpm-lock.yaml` as workspace root because multiple lockfiles exist.
- Edge runtime disables static generation for affected pages.

## Deployment

```bash
vercel --prod --yes
```

- Production deployment: `https://cc-o1gkctylh-andreas-nordenadlers-projects.vercel.app`
- Alias: `https://sidequestchess.com`

## Live smoke

Confirmed `HTTP 200` plus expected Rookless / dual-host / beta-copy strings on:

- `https://sidequestchess.com/verifiers`
- `https://sidequestchess.com/challenges/rookless-rampage`
- `https://sidequestchess.com/beta`
- `https://sidequestchess.com/connect`
- `https://sidequestchess.com/account`
- `https://cc-o1gkctylh-andreas-nordenadlers-projects.vercel.app/verifiers`

## Files changed

- `src/lib/chesscom.ts`
- `src/app/actions.ts`
- `src/lib/verifier-status.ts`
- `src/app/beta/page.tsx`
- `src/app/verifiers/page.tsx`
- `src/app/connect/page.tsx`
- `tests/chesscom-rookless-rampage-fixtures.mjs`
