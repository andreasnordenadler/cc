# SQC homepage active-quest check CTA live deploy — 2026-05-04

## Change

Tightened the signed-in homepage current-run card so an active quest now points directly to the next useful tester action:

- active quest present: primary CTA is **Run latest-game check** to `/account`
- active quest present: secondary CTA is **Review active rules** to the active challenge route
- no active quest: primary CTA remains **Choose a quest**, with account details as the secondary route

This keeps the private-beta loop moving from homepage → account check after a tester has already chosen a quest.

## Verification

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅
- Production deploy ✅ `https://cc-p8u73oo1e-andreas-nordenadlers-projects.vercel.app`
- Canonical alias ✅ `https://sidequestchess.com`
- Live smoke ✅
  - deploy `/` returned HTTP 200 and contained `Chess, but with stupidly hard side quests` + `Friend quest loop`
  - canonical `/` returned HTTP 200 and contained `Chess, but with stupidly hard side quests` + `Friend quest loop`
  - canonical `/account` returned HTTP 200 and contained `Private beta preflight` + `Quest launcher`
  - canonical `/challenges` returned HTTP 200 and contained `Recommended starter route` + `Full quest deck`
- Vercel production error-log check ✅ `vercel logs --project cc --environment production --level error --since 30m --no-branch --limit 20 --json` returned no error entries

## Notes

The first smoke attempt over-asserted signed-in-only `/challenges` content from a signed-out request; the final smoke uses signed-out-visible content assertions.
