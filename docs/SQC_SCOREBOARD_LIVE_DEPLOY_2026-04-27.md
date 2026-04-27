# SQC Scoreboard Live Deploy — 2026-04-27

## Summary

Added a public `/scoreboard` surface for Side Quest Chess so players can see their starter-deck points, earned coat-of-arms badge count, difficulty spread, and recommended next dare.

## Product impact

- New route: `https://sidequestchess.com/scoreboard`
- Homepage now links to the scoreboard from the hero CTA row and product-surface grid.
- Primary nav now exposes `Score` as a first-class SQC surface.
- Signed-in users see saved progress from Clerk public metadata when available.
- Signed-out visitors still get a useful deck-level scoreboard, next-dare recommendation, and challenge scorecards.

## Files changed

- `src/app/scoreboard/page.tsx`
- `src/app/page.tsx`
- `src/components/site-nav.tsx`

## Verification

- `pnpm lint` ✅
- `pnpm build` ✅
- Local route smoke with `pnpm start` ✅
  - `/` → 200
  - `/scoreboard` → 200
  - `/challenges` → 200
  - `/proof-log` → 200
  - `/scoreboard` contained `Quest scoreboard`, `Your bad-idea score`, and `Recommended next dare`
- Production deploy ✅
  - Deployment: `https://cc-cxoaoo4im-andreas-nordenadlers-projects.vercel.app`
  - Aliased: `https://sidequestchess.com`
- Production smoke ✅
  - `https://sidequestchess.com/scoreboard` → 200
  - `https://sidequestchess.com/` → 200
  - `https://sidequestchess.com/challenges` → 200
  - `https://sidequestchess.com/proof-log` → 200
  - live `/scoreboard` contained `Quest scoreboard`, `Your bad-idea score`, and `Recommended next dare`
- Vercel log scan ✅
  - bounded production log capture showed no `500/501/502/503/504` lines

## Notes

The first smoke/log helper commands hit two local CLI/PATH gotchas and were retried successfully with safer commands. Captured in `.learnings/ERRORS.md`.
