# SQC Scoreboard Beta Handoff — Live Deploy Proof

Date: 2026-05-05 06:44 Europe/Stockholm  
Project: CC / Side Quest Chess  
Scope: private/friends beta launch-polish burst

## What changed

Added a dedicated scoreboard beta handoff on `/scoreboard` so the points/badge page now routes testers directly through the next clean loop:

1. check chess identity setup on `/account`
2. open the recommended unfinished quest
3. review the latest receipt on `/result`
4. report confusing results through `/support`

This keeps the scoreboard from being a passive progress display and turns it into a usable next-action surface for private beta testers.

## Files changed

- `src/app/scoreboard/page.tsx`
- `ROADMAP.md`

## Local verification

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅

## Deployment verification

- Production deploy: `https://cc-49tkzc5lv-andreas-nordenadlers-projects.vercel.app` ✅
- Aliased canonical domain: `https://sidequestchess.com` ✅
- Live smoke: canonical `/scoreboard` 200 with `Scoreboard beta handoff`, `Turn points into the next clean tester loop.`, `Check account setup`, `Open next quest`, `Review receipt`, and `Report confusion` ✅
- Live smoke: preview `/scoreboard` 200 with the same assertions ✅
- Route smoke: canonical `/account`, `/result`, and `/support` returned 200 ✅
- `vercel inspect --logs` ready-status/build log check ✅
