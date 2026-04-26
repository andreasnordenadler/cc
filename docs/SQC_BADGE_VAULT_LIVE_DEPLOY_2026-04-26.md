# SQC badge vault live deploy

Date: 2026-04-26 23:40 Europe/Stockholm  
Project: CC / Side Quest Chess

## What changed

Added a new `/badges` badge-vault route for Side Quest Chess.

User-visible additions:

- top navigation now includes **Badges**
- homepage primary secondary CTA now opens the badge vault
- `/badges` presents every starter challenge as an SQC coat-of-arms collection
- each badge card shows the heraldic motto, shield, charge, meaning, quest, reward, and earned/unearned state
- signed-in users see earned badge count and current reward points from saved metadata

## Files changed

- `src/app/badges/page.tsx`
- `src/app/page.tsx`
- `src/components/site-nav.tsx`
- `ROADMAP.md`

## Verification

Local:

- `pnpm lint` ✅
- `pnpm build` ✅
- local route smoke on `http://localhost:3011` ✅
  - `/`
  - `/badges`
  - `/challenges`
  - `/result`

Production deploy:

- `vercel --prod --yes` ✅
- deployment: `https://cc-659ab1nun-andreas-nordenadlers-projects.vercel.app`
- aliased: `https://sidequestchess.com`

Production smoke:

- `https://sidequestchess.com/` returned 200 and Side Quest Chess content ✅
- `https://sidequestchess.com/badges` returned 200 and badge-vault content including `Every bad idea deserves a coat of arms`, `Queenless Gremlin`, and `SQC badge vault` ✅
- `https://sidequestchess.com/challenges` returned 200 ✅
- `https://sidequestchess.com/result` returned 200 ✅

Vercel 500 scan:

- `vercel logs https://cc-659ab1nun-andreas-nordenadlers-projects.vercel.app --no-follow --status-code 500 --since 10m`
- Result: no logs found ✅

## Next good step

Make badge completion feel more alive by showing earned badges in `/account` as a compact vault strip next to active challenge progress.
