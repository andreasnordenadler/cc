# SQC Web missing-page next-step polish — 2026-06-11

## Slice
Continued the SQC website UX parity sprint by replacing the generic root 404 experience with an SQC-styled missing-page recovery route.

## User-visible changes
- Added a global `/not-found` surface for mistyped, old, private, or cleaned-up links.
- Kept the established SQC hero/card look instead of a plain framework error page.
- Added a `Next step` panel that routes runners back to Solo Side Quests, Public Multiplayer tables, or Support when a proof/Community link should still exist.
- Preserved the correct HTTP 404 status while making recovery paths clear and product-facing.

## Checks
- `pnpm lint -- src/app/not-found.tsx`
- `pnpm build`
- `pnpm deploy:prod` including `pnpm quest:release-gate`

## Commit / deploy
- Commit: `da056cd` (`Polish missing page UX`)
- Production deploy: `https://cc-q9f27mmra-andreas-nordenadlers-projects.vercel.app`
- Alias: `https://sidequestchess.com`

## Live smoke
- `https://sidequestchess.com/definitely-missing-side-quest?missingPageSmoke=20260611` returned expected 404 with `Lost Side Quest`, `This page slipped off the tavern wall`, and `Pick up the run from a safe room`.
- Deploy URL for the same missing route returned expected 404 with the same SQC recovery copy.
- `https://sidequestchess.com/challenges?missingPageSmoke=20260611` returned 200 with `Official Solo finder`.
- `https://sidequestchess.com/groupquests/public?missingPageSmoke=20260611` returned 200 with `Find a table`.
