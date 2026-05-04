# SQC challenge hub live-backed count clarity — live deploy — 2026-05-04

## What changed

- Clarified `/challenges` hero copy so testers pick from the live-backed deck, not the future/coming-soon cards.
- Changed the quest-filter count from a combined total to an honest live-backed count.
- Added a secondary coming-soon count only when future cards are visible.

## Why

The challenge hub had live quest cards and foggy coming-soon cards on the same surface. Counting both together made the first-run path feel less clear than it needed to be. This makes the live deck obvious before users choose a quest.

## Verification

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅
- Production deploy ✅
  - Deploy URL: `https://cc-c9r44q3y8-andreas-nordenadlers-projects.vercel.app`
  - Canonical alias: `https://sidequestchess.com`
- Live smoke ✅
  - Deploy `/challenges` returned HTTP 200 and rendered `live-backed deck`, `10 live quests`, and `coming soon`.
  - Canonical `/challenges` returned HTTP 200 and rendered `live-backed deck`, `10 live quests`, and `coming soon`.
- Vercel runtime log watch ✅
  - Started stream for the new deployment; no runtime errors appeared during the bounded watch window.

## Files changed

- `src/app/challenges/page.tsx`
- `src/components/challenge-deck-browser.tsx`
- `src/app/globals.css`
