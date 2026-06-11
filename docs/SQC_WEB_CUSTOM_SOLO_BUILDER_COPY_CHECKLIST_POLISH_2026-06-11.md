# SQC Web Custom Solo builder copy/checklist polish — 2026-06-11

## Slice
Continued the SQC website UX parity sprint on the flagged Custom Solo builder surface.

## What changed
- Replaced harsher library/hero wording like “suspicious shelf” and “saved bad ideas” with player-facing Custom Solo shelf/recipe language.
- Renamed save-state choices to clearer player actions: `Draft (private)`, `Playable privately`, and `Publish to Community Solo`.
- Added an SQC-styled builder quality checklist between the creation guide and form so runners see the product expectation before filling six proof slots.
- Kept the existing SQC visual treatment, verifier behavior, lifecycle values, and private/public data boundaries unchanged.

## Proof
- `pnpm lint -- src/app/account/custom-side-quests/page.tsx src/app/globals.css` (CSS ignored-file warning only)
- `pnpm build`
- committed/pushed `8e71b2a`
- `pnpm deploy:prod` including `pnpm quest:release-gate`
- production deploy `https://cc-llqw7rsqp-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`
- live smoke returned signed-out sign-in content for production/deploy `/account/custom-side-quests?copyChecklistSmoke=20260611`, plus 200 SQC content for `/challenges/community?copyChecklistSmoke=20260611` and `/groupquests/public?copyChecklistSmoke=20260611`

## Files
- `src/app/account/custom-side-quests/page.tsx`
- `src/app/globals.css`
