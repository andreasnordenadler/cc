# SQC homepage proof-loop clarity — live deploy proof

Date: 2026-05-04 04:50 Europe/Stockholm
Owner: Sam

## Change

Added a homepage `Proof loop` section that explains the actual Side Quest Chess loop before testers choose a quest:

1. Pick the dare.
2. Play real public Lichess or Chess.com chess.
3. Prove, retry, or save the receipt in the proof log.

The section links directly to `/challenges`, `/account`, `/result`, and `/proof-log`, making the share/proof loop more obvious from the first page.

## Files changed

- `src/app/page.tsx`

## Local verification

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅

Note: the first `pnpm lint` attempt failed because the fresh detached worktree had no `node_modules`; rerunning after `pnpm install --frozen-lockfile` passed.

## Production deployment

- Vercel production deploy: `https://cc-hecsfyvk3-andreas-nordenadlers-projects.vercel.app`
- Canonical alias: `https://sidequestchess.com`

## Live smoke checks

Passed:

- `https://cc-hecsfyvk3-andreas-nordenadlers-projects.vercel.app/` returned 200 and contained `From bad idea to brag receipt.`
- `https://cc-hecsfyvk3-andreas-nordenadlers-projects.vercel.app/` returned 200 and contained `Run latest-game check`
- `https://sidequestchess.com/` returned 200 and contained `From bad idea to brag receipt.`
- `https://sidequestchess.com/` returned 200 and contained `Open proof log`
- `https://sidequestchess.com/account` returned 200 and contained `Check latest games`
- `https://sidequestchess.com/proof-log` returned 200 and contained `Receipt states`

## Runtime log check

`vercel logs cc-hecsfyvk3-andreas-nordenadlers-projects.vercel.app` resolved the deployment and streamed from the deploy timestamp; no fatal runtime log was captured before the bounded 20s timeout.
