# SQC starter path live deploy — 2026-04-27

## Change

Added a new Side Quest Chess `/path` onboarding surface: a three-dare starter ladder that turns first-time choice paralysis into a clear progression.

The path orders the first run as:

1. `No Castle Club` — simple restriction
2. `The Blunder Gambit` — deliberate chaos
3. `Queen? Never Heard of Her` — signature cursed badge chase

The homepage and nav now expose `Path` as a first-class entry point, while the page reflects signed-in progress from saved challenge metadata and keeps the existing proof loop framing: pick → play elsewhere → check latest games.

## Files changed

- `src/app/path/page.tsx` — new starter path route with metadata, progress-aware CTA, and three step cards.
- `src/components/site-nav.tsx` — added `Path` navigation state/link.
- `src/app/page.tsx` — added homepage hero CTA and starter-path card.
- `ROADMAP.md` — recorded Phase 19 completion/proof.

## Verification

- `pnpm lint` ✅
- `pnpm build` ✅
- Production deploy ✅
  - Vercel deployment: `https://cc-i6zroa8nx-andreas-nordenadlers-projects.vercel.app`
  - Aliased to: `https://sidequestchess.com`
- Production smoke ✅
  - `https://cc-i6zroa8nx-andreas-nordenadlers-projects.vercel.app/path` returned 200 and contained `Starter path` + `Three bad ideas`.
  - `https://sidequestchess.com/path` returned 200 and contained `Starter path` + `Three bad ideas`.
  - `https://www.sidequestchess.com/path` redirected to primary and returned 200.
  - `https://sidequestchess.com/` returned 200 and contained `Start the path`.
  - `https://sidequestchess.com/challenges` returned 200 and contained `Pick your next bad idea`.
  - `https://sidequestchess.com/api/og/dare/queen-never-heard-of-her` returned 200 `content-type: image/png`.
- Vercel production log scan ✅
  - Recent deployment log query returned no 500/501/502/503/504 or `Error` entries.

## Notes

A local `next start` smoke attempt hit this environment's self-proxy/connectivity issue after the build succeeded, so verification was completed against the production deployment and canonical domain.
