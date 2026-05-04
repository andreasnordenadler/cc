# SQC challenge detail active-check CTA live deploy proof — 2026-05-04

## Burst

Polished the challenge-detail hero action for active quests. When a signed-in tester is already on their active quest, the primary hero CTA now runs `Check latest games` instead of offering `Restart this bad idea` as the main action. Restart remains available as a secondary action.

## Why

Private/friends beta testers should not accidentally restart or feel sent backward after making a quest active. The challenge detail page should point active runners directly into the proof loop: play the real game, then check the latest public Lichess/Chess.com game.

## Changed

- `src/app/challenges/[id]/page.tsx`
  - Active signed-in quest: primary hero action is now `Check latest games` via `checkActiveChallenge`.
  - Restart is preserved as a secondary action.
  - Inactive signed-in quest behavior stays `Start this bad idea`.
  - Signed-out behavior stays `Connect to start`.

## Local verification

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅

## Deployment

- Commit: `05b52ae` (`Polish active quest detail CTA`)
- Pushed to `origin/main`.
- Production deploy: `https://cc-af9moz8bq-andreas-nordenadlers-projects.vercel.app`
- Aliased to: `https://sidequestchess.com` and `https://www.sidequestchess.com`
- Vercel inspect: deployment `dpl_97oWM88PpHySJ3o29QuvvMuQqBdQ`, status `Ready`.

## Live smoke checklist

- `https://cc-af9moz8bq-andreas-nordenadlers-projects.vercel.app/challenges/knights-before-coffee` returned 200 ✅
- `https://sidequestchess.com/challenges/knights-before-coffee` returned 200 ✅
- `https://sidequestchess.com/challenges` returned 200 ✅
- `https://sidequestchess.com/result` returned 200 ✅
- Challenge detail content assertions passed for `Connect to start`, `Preview proof card`, `Friend quest page`, `Before you start`, and `Check latest games` ✅
- Deployment challenge content assertions passed for `Connect to start`, `Preview proof card`, `Friend quest page`, and `Before you start` ✅
- Vercel production error log scan over the recent deploy window returned `No logs found` ✅

## Manual authenticated note

The active-state hero CTA is authenticated metadata-dependent, so the live signed-out smoke confirms the route and public fallback. The signed-in active branch is covered by TypeScript/build and by wiring the existing `checkActiveChallenge` server action as the primary button whenever `activeChallenge?.id === challenge.id`.
