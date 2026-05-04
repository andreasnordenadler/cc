# SQC nav/support quest-language launch polish — 2026-05-04

## Scope

Private-beta launch-readiness polish for Side Quest Chess:

- simplified the primary nav around the core first-run surfaces (`Home`, `Starter path`, `Quests`, `Today`, `Badges`, `Support`, plus signed-in `Account`)
- added a dedicated `/support` route with copy/paste support-report fields for wrong receipts, setup friction, and share/badge glitches
- normalized visible product language away from generic “challenge/dare” wording toward “quest” where it clarifies the Side Quest Chess loop
- kept the beta page accurate: all ten current starter-deck quests remain described as dual-host Lichess + Chess.com latest-game backed

## Verification

- `pnpm lint` ✅
- `pnpm build` ✅
  - build included `/support` in the route manifest
  - non-blocking existing warning: Next.js inferred workspace root because of multiple lockfiles

## Deployment

- App commit: `4c72b7e` (`Polish SQC nav and support flow`)
- Clean worktree deploy URL: `https://cc-mmtavvmwq-andreas-nordenadlers-projects.vercel.app`
- Production alias: `https://sidequestchess.com`

## Live smoke

- `https://sidequestchess.com/support` returned 200 and contained `Private beta support`, `Quest:`, and `Receipt status: passed / failed / pending / unclear` ✅
- `https://sidequestchess.com/` returned 200 and contained `Starter path`, `Quests`, `Support`, and `Open today’s quest` ✅
- `https://sidequestchess.com/beta` returned 200 and contained `full dual-host deck`, `All ten current starter-deck quests`, and `Connect a chess identity` ✅
- `https://cc-mmtavvmwq-andreas-nordenadlers-projects.vercel.app/support` returned 200 and contained `Private beta support` plus `Setup friction` ✅

## Notes

A Vercel log filtering command failed because this CLI does not support `--since`/`--limit` on the logs command in this mode; live route smoke passed after deploy.
