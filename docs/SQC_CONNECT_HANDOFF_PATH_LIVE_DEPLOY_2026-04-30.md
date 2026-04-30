# SQC Connect handoff path live deploy — 2026-04-30

## Summary
Added a `Connection handoff` block to `/connect` so saving a chess identity no longer feels like a dead-end setup step. The page now points the runner straight into the core launch loop: save one public username, choose a live-backed quest, play and win one eligible public Lichess/Chess.com game, then read the latest-game receipt.

## Changed
- `src/app/connect/page.tsx`
  - Added saved-identity state handling via `hasChessIdentity`.
  - Added a post-connection proof path with three visible steps: save identity, start a quest, check receipt.
  - Added direct CTAs to `/challenges` and `/result`.
  - Kept the no-password/no-upload/no-PGN trust framing intact.

## Verification
- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅
- Production deploy ✅
  - Deploy URL: `https://cc-ftop1c4m8-andreas-nordenadlers-projects.vercel.app`
  - Canonical alias: `https://sidequestchess.com`
- Live smoke ✅
  - `https://cc-ftop1c4m8-andreas-nordenadlers-projects.vercel.app/connect` returned 200 and contained `Connection handoff`, `Save one username, then choose a quest.`, `Choose a quest`, and `View latest receipt`.
  - `https://sidequestchess.com/connect` returned 200 and contained `Connection handoff`, `Save one username, then choose a quest.`, and `No password, upload, or PGN chore.`
  - `https://sidequestchess.com/challenges` returned 200 and retained `Recommended starter route`.
  - `https://sidequestchess.com/result` returned 200 and retained receipt copy.
- Bounded Vercel log scan ✅
  - No `500`, `error`, `exception`, `traceback`, or `failed` strings in the bounded deployment log sample.

## Impact
The first-run path is clearer from the account-connection step itself, which removes a launch-readiness friction point without adding more beta-tester/admin functionality.
