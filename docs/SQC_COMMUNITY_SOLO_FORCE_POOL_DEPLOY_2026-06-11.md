# SQC Community Solo forced full-pool coat assignment — 2026-06-11

## Summary
Fixed Community Solo rendering so public community quests no longer depend on stale/stored Clerk badge metadata. The public Community Solo list/detail/mobile account payload now assigns coats from the intended committed 48-image community-only pool at render/API time.

## Change
- Updated `src/lib/community-side-quests.ts` so `listPublicCommunitySideQuests()` maps the final public list to `CUSTOM_SIDE_QUEST_BADGE_POOL` by list index after filtering/sorting.
- Effect for the current 47 public Community Solo quests: all 47 visible quests use unique assets from:
  - `/badges/custom/community/community-coat-01.png`
  - through `/badges/custom/community/community-coat-47.png`
- This bypasses stale production Clerk metadata without requiring a Clerk metadata mutation.
- Mobile account API uses the same `listPublicCommunitySideQuests()` path, so Community Solo in the app receives the same pool-forced `badgeImageUrl` values.

## Verification
Local gates before deploy:
- `pnpm lint` passed with 0 errors and 3 pre-existing warnings.
- `pnpm build` passed.
- `pnpm deploy:prod` release gates passed:
  - quest release gate passed
  - custom Side Quest launch gate passed
  - production deploy guard passed

Production deploy:
- Commit: `dbf3863` (`Force Community Solo coats to full pool`)
- Production deployment: `https://cc-jhf9lh8sa-andreas-nordenadlers-projects.vercel.app`
- Alias: `https://sidequestchess.com`

Live checks:
- `https://sidequestchess.com/challenges/community?poolfix=...` returned HTTP 200.
- `https://sidequestchess.com/challenges/community/seed-opening-hipster-32-1?poolfix=...` returned HTTP 200.
- `/badges/custom/community/community-coat-01.png` returned HTTP 200.
- `/badges/custom/community/community-coat-47.png` returned HTTP 200.
- Live Community Solo HTML contained 188 total refs to community-pool coat assets.
- Live Community Solo HTML contained 47 unique community-pool refs: `community-coat-01.png` through `community-coat-47.png`.
- Live Community Solo HTML contained no old generic `/badges/custom/custom-side-quest-crest.png` refs.
- Live Community Solo HTML contained no old `/badges/custom/custom-coat-*.png` refs.
- Live Community Solo HTML contained no official badge refs.
- Browser-rendered screenshot confirmed visible cards using `community-coat-01`, `community-coat-02`, and `community-coat-03` from the deployed Next image optimizer.

## Result
Complete. All currently public Community Solo quests are now updated at render/API time to use the intended community-only full coat pool.
