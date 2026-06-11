# SQC Web Community Solo detail polish — 2026-06-11

## Slice
Continued the SQC website UX parity sprint on Community Solo detail-page clarity and visible polish.

## What changed
- Reworked Community Solo detail hero content so runners see the public quest promise, custom crest, quick facts, and update context before choosing an action.
- Added a hero-level `Rule preview` card and `Next step` panel so start/Multiplayer/share/report actions feel deliberate instead of floating beneath dense explanatory copy.
- Replaced the separate repetitive rule-summary block with a compact `Run checklist` that frames the public rule, verifier shape, and SQC account handoff in player-facing language.
- Preserved existing Community Solo data boundaries, account handoff behavior, share/report paths, verifier behavior, and SQC visual language.

## Proof
- `pnpm lint -- 'src/app/challenges/community/[id]/page.tsx' src/app/globals.css` (CSS ignored-file warning only)
- `pnpm build`
- `pnpm quest:release-gate` via `pnpm deploy:prod`
- committed/pushed `f548197`
- production deploy `https://cc-2qeks7rec-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`
- live smoke returned 200 for production and deploy `/challenges/community/seed-opening-hipster-32-1?detailPolishSmoke=20260611` with `Rule preview`, `Run checklist`, `Next step`, and `Community Solo`
- live smoke returned 200 for production `/challenges/community?detailPolishSmoke=20260611` with Community Solo browse content and 200 for `/groupquests/public?detailPolishSmoke=20260611` with Public Multiplayer content

## Files
- `src/app/challenges/community/[id]/page.tsx`
- `src/app/globals.css`
