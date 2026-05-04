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
- Pending live deploy/smoke: production `/challenges` should render `Recommended starter route` before `Full quest deck`, with `/account` and `/result` still returning 200.

## Files

- `src/app/challenges/page.tsx`
- `ROADMAP.md`
