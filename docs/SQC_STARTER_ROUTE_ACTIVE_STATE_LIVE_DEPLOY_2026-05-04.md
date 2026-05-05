# SQC starter route active state live deploy — 2026-05-04

## Change

Extended the stronger quest-state treatment from the full `/challenges` deck into the recommended starter route at the top of the page.

This keeps the first-run ladder honest and easier to scan:

- the active starter quest now gets the same clear `Active quest` callout
- active starter cards get a green highlight/glow instead of blending into the route list
- completed starter cards show a completed badge directly in the starter route
- the starter-route card uses `aria-current` when it points at the active quest

## Files changed

- `src/app/challenges/page.tsx`
- `src/app/globals.css`
- `ROADMAP.md`
- `.learnings/ERRORS.md` (logged the fresh-worktree missing-dependencies lint retry)

## Verification

Local:

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅

Deploy:

- `vercel --prod --yes` ✅
- Deployment: `https://cc-hxypbged6-andreas-nordenadlers-projects.vercel.app` ✅
- Alias: `https://sidequestchess.com` ✅
- `vercel inspect https://cc-hxypbged6-andreas-nordenadlers-projects.vercel.app --logs` shows status `Ready` ✅

Live smoke:

- `https://cc-hxypbged6-andreas-nordenadlers-projects.vercel.app/challenges` → HTTP 200 ✅
- `https://sidequestchess.com/challenges` → HTTP 200 ✅
- `https://sidequestchess.com/path` → HTTP 200 ✅
- Live `/challenges` HTML contains `starter-route-card`, `Recommended starter route`, and `Full quest deck` ✅
- Anonymous live `/challenges` correctly does not show `Active quest` because active state requires a signed-in saved quest ✅
