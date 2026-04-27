# SQC random dare machine live deploy — 2026-04-27

## Summary

Added a first-class `/random` random-dare machine to Side Quest Chess so visitors can spin the starter challenge deck, accept the selected quest, or send the exact friend-dare link without browsing the whole hub.

## User-visible changes

- New route: `/random`
- Nav exposes **Random** as a first-class surface.
- Signed-out nav CTA changed from generic browse to **Spin**.
- Homepage hero now includes **Spin a bad idea**.
- Homepage product-surface grid now includes the random dare machine.
- Random page shows the selected challenge's reward, difficulty, coat-of-arms badge, rules context, and friend-dare copy/native-share actions.

## Files changed

- `src/app/random/page.tsx`
- `src/components/challenge-roulette.tsx`
- `src/components/site-nav.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`

## Verification

- `pnpm lint` ✅
- `pnpm build` ✅
- Local production smoke via `pnpm exec next start -p 3012` ✅
  - `GET /random` → 200 and contained `Random dare machine`, `Spin another bad idea`, and `/dare/`
  - `GET /` → 200 and contained `Spin a bad idea` + `/random`
  - `GET /challenges` → 200 and contained `Pick your next bad idea`
  - `GET /api/og/dare/queen-never-heard-of-her` → 200 `image/png`
- Production deploy ✅
  - `vercel --prod --yes`
  - Deployment: `https://cc-4p4vzgdv8-andreas-nordenadlers-projects.vercel.app`
  - Aliased: `https://sidequestchess.com`
- Production smoke ✅
  - `https://sidequestchess.com/random` → 200 and contained random-dare content
  - `https://sidequestchess.com/` → 200 and contained random CTA content
  - `https://sidequestchess.com/challenges` → 200
  - `https://sidequestchess.com/dare/queen-never-heard-of-her` → 200
  - `https://sidequestchess.com/api/og/dare/queen-never-heard-of-her` → 200 `image/png`
- Vercel recent production error scan ✅
  - `500`, `501`, `502`, `503`, and `504` filtered logs for the new deployment returned no logs.

## Notes

This keeps the product centered on playful side quests and exact shareable dare links. It does not add PGN upload, engine-analysis, or training-dashboard framing.
