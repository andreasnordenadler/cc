# SQC Daily Dare Social Preview Live Deploy — 2026-04-27

## Change

Added challenge-specific social preview metadata to `/today` so the shared daily Side Quest Chess ritual previews the current daily dare, reward, and badge instead of a generic daily page.

## Files changed

- `src/app/today/page.tsx`
  - Replaced static metadata with `generateMetadata()`.
  - Pulls the current deterministic daily challenge from `getDailyChallenge()`.
  - Adds challenge-specific title/description plus Open Graph and Twitter image tags that reuse `/api/og/dare/[id]`.

## Verification

- `pnpm lint` ✅
- `pnpm build` ✅
- Local production server smoke on `http://localhost:3111` ✅
  - `/today` returned `200` and included `og:image`, `twitter:image`, `/api/og/dare/`, and `Today’s dare`.
  - `/api/og/dare/queen-never-heard-of-her` returned `200 image/png`.
  - `/challenges/queen-never-heard-of-her` returned `200`.
- Production deploy ✅
  - Deploy URL: `https://cc-c5epbz50k-andreas-nordenadlers-projects.vercel.app`
  - Aliased to: `https://sidequestchess.com`
- Production smoke ✅
  - `https://sidequestchess.com/today` returned `200` and included `og:image`, `twitter:image`, `/api/og/dare/`, and `Today’s dare:`.
  - `https://sidequestchess.com/api/og/dare/queen-never-heard-of-her` returned `200 image/png`.
  - `https://sidequestchess.com/challenges/queen-never-heard-of-her` returned `200`.
  - `https://sidequestchess.com/dare/queen-never-heard-of-her` returned `200`.
- Vercel 5xx scan ✅
  - `vercel logs cc-c5epbz50k-andreas-nordenadlers-projects.vercel.app --no-follow --since 10m --status-code 500/501/502/503/504` returned no logs for all checked 5xx codes.

## Notes

- No PGN upload, engine-analysis, manual import, or serious training framing added.
- This is a small viral-loop polish pass on top of the newly shipped daily dare surface.
