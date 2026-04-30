# SQC challenge hub proof-loop guidance — live deploy proof

Date: 2026-04-30 16:44 Europe/Stockholm  
Owner: Sam  
Project: CC / Side Quest Chess

## Change

Added a `Latest-game proof loop` section to `/challenges` so private-beta testers understand the full SQC loop before choosing a dare:

1. Accept one challenge.
2. Play and win a normal public game on Lichess or Chess.com.
3. Return to Account to run latest-game verification and get a passed/failed/pending receipt.

The copy explicitly says there is no PGN upload, engine dashboard, or fake sandbox game required.

## Files changed

- `src/app/challenges/page.tsx`
- `.learnings/ERRORS.md` — recorded the fresh-worktree missing-dependencies lint gotcha.
- `ROADMAP.md`

## Verification

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅
- Production deploy: `https://cc-l2tycn21b-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com` ✅
- Live smoke: preview/canonical `/challenges`, canonical `/account`, and canonical `/beta` returned HTTP 200 ✅
- Content smoke: live `/challenges` contains `Latest-game proof loop`, `Accept, play, prove`, `no PGN homework`, and `No PGN upload` ✅
- Bounded Vercel log stream: no emitted runtime error lines before timeout ✅

## User-visible impact

The challenge hub now reduces route-hunting and explains the proof loop in one place, strengthening the private-beta first-run path from challenge selection to account verification.
