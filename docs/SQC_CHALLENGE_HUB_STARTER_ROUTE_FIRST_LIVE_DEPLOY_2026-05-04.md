# SQC challenge hub starter-route-first polish — 2026-05-04

## Change

Reordered `/challenges` so the recommended three-step starter route appears before the full ten-quest deck, then added a short `Full quest deck` bridge before the complete list.

## Why

Private beta testers should not hit the whole chaos deck before seeing the guided first-run path. The page now answers “where do I start?” before “what else exists?” while keeping all ten live-backed quests available immediately below.

## Verification

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅
- Local runtime smoke attempted but blocked by missing Clerk publishable key in the isolated shell; production env smoke is required after deploy.
- Production deploy ✅ `https://cc-386fr0677-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`
- Live smoke ✅ deploy `/challenges` returned 200 and rendered `Recommended starter route` before `Full quest deck`
- Live smoke ✅ canonical `/challenges` returned 200 and rendered `Recommended starter route` before `Full quest deck`
- Live smoke ✅ canonical `/account` returned 200
- Live smoke ✅ canonical `/result` returned 200
- Bounded Vercel log watch: no runtime log lines emitted during a 25s post-deploy stream before the intentional tool timeout.

## Files

- `src/app/challenges/page.tsx`
- `ROADMAP.md`
