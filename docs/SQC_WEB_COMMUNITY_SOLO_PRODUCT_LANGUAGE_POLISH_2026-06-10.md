# SQC Web Community Solo Product Language Polish — 2026-06-10

## Scope

Follow-up slice in the 24h SQC website UX parity review. Andreas objected to internal/product-hostile wording such as “website creator,” so this slice cleaned up visible Community Solo and Custom Solo management language without changing verifier semantics or releasing quests.

## Changes

- Replaced Community Solo browse/detail copy that said “website or app — same product, different layout” with player-facing SQC account language.
- Changed the Community Solo parity card from “Equal on app and website” / “Shared surface” to “Ready wherever you play” / “Community guide.”
- Reworked detail-page next-action cards from “Website-first players” and “App-first players” into “Roomy web view” and “Compact mobile flow.”
- Removed remaining visible “on website” management wording in Custom Solo cards by changing “Edit on website” to “Edit recipe” and tightening the builder aria label.
- Verified no remaining matches for the flagged phrase family: `website creator`, `website or app`, `website social`, `Website-first`, `App-first`, `on website`, `Edit on website`, `the website supports`, `without needing the website`, or `same product, different layout` in `src/app`, `src/components`, and `src/lib`.

## Checks

- `pnpm lint -- src/app/account/custom-side-quests/page.tsx src/app/challenges/community/page.tsx 'src/app/challenges/community/[id]/page.tsx'`
- `pnpm build`
- `pnpm deploy:prod` (includes `pnpm quest:release-gate` and production deploy guard)

## Deploy

- Production deploy: `https://cc-bjv8gf54h-andreas-nordenadlers-projects.vercel.app`
- Aliased: `https://sidequestchess.com`

## Live smoke

- `https://sidequestchess.com/challenges/community?languageSmoke=20260610b` → 200 with `Inspect the rules`
- `https://sidequestchess.com/challenges/community/seed-opening-hipster-32-1?languageSmoke=20260610b` → 200 with `Review the recipe before you run it`
- `https://sidequestchess.com/account/custom-side-quests?languageSmoke=20260610b` → 200 signed-out sign-in content with `Sign in to Side Quest Chess`
