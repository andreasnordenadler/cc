# SQC Knights Before Coffee Lichess verifier live deploy — 2026-04-28

## Change

Promoted the first beginner quest, **Knights Before Coffee**, from specified-only to a live-backed Lichess latest-game verifier.

The checker normalizes Lichess UCI move feeds, tracks piece movement from the starting board, confirms the player’s first four moves were all knight moves, requires a player win, and keeps the existing standard-chess / bullet-blitz-rapid eligibility posture.

## Files changed

- `src/lib/knights-before-coffee.ts`
- `tests/knights-before-coffee-fixtures.mjs`
- `src/app/actions.ts`
- `src/lib/verifier-status.ts`
- `ROADMAP.md`

## Verification

- Fixture verifier test ✅
  - `pnpm --dir /Users/sam/.openclaw/workspace/cc exec node --experimental-strip-types --test tests/knights-before-coffee-fixtures.mjs`
- `pnpm lint` ✅
- `pnpm build` ✅
- Production deploy: `vercel --prod --yes` ✅
  - Deployment: `https://cc-aeb041pe2-andreas-nordenadlers-projects.vercel.app`
  - Aliased: `https://sidequestchess.com`
- Live smoke ✅
  - `https://cc-aeb041pe2-andreas-nordenadlers-projects.vercel.app/verifiers` returned HTTP 200 and contained `Knights Before Coffee`, `Live-backed`, and `first four player moves`.
  - `https://sidequestchess.com/verifiers` returned HTTP 200 and contained `Knights Before Coffee`, `Live-backed`, and `first four player moves`.
  - `https://sidequestchess.com/challenges/knights-before-coffee` returned HTTP 200 and contained `Knights Before Coffee`, `Live-backed`, and `First four player moves`.
  - `https://sidequestchess.com/account` returned HTTP 200 and contained `Knights Before Coffee` and `Live-backed`.
  - `https://sidequestchess.com/path` returned HTTP 200 and contained `Knights Before Coffee`.
- Vercel deployment log stream opened for `dpl_9UPp9gssapuWERgDRxE8G3oWZZC9`; no fresh error output appeared during the bounded post-deploy watch window.

## User-visible effect

The easiest starter quest is now honest-to-goodness live-backed: a signed-in runner with a Lichess username can use the account latest-game check for the first beginner quest instead of seeing it as a manual/spec-only contract.
