# SQC Web Custom Solo recipe starter polish — 2026-06-11

## Slice
Continued the SQC website UX parity sprint on Andreas's flagged Custom Solo builder surface.

## What changed
- Added an SQC-styled `Recipe starters` panel before the Custom Solo form.
- Translated the detailed proof-rule controls into three player-facing patterns: `Clean finish`, `Opening dare`, and `Piece story`.
- Kept the panel focused on visible clarity and product language, helping runners choose the quest vibe before they touch verifier fields.
- Preserved the existing SQC look and feel, mobile stacking, saved rule schema, lifecycle behavior, and verifier paths.

## Proof
- `pnpm lint -- src/app/account/custom-side-quests/page.tsx src/app/globals.css` (CSS ignored-file warning only)
- `pnpm build`
- committed/pushed `1d2719c`
- `pnpm deploy:prod` including `pnpm quest:release-gate`
- production deploy `https://cc-l8isvb1j9-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`
- live smoke returned signed-out `307` to `/sign-in` for production `/account/custom-side-quests?recipeStarterSmoke=20260611`, deploy sign-in content, 200 Community Solo content, and 200 Public Multiplayer content

## Files
- `src/app/account/custom-side-quests/page.tsx`
- `src/app/globals.css`
