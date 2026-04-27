# SQC Dare Link OG Image Cards — Live Deploy

Date: 2026-04-27 02:44 Europe/Stockholm
Project: CC / Side Quest Chess

## What shipped

Added challenge-specific Open Graph image cards for Side Quest Chess friend-dare and challenge links.

- New dynamic image endpoint: `/api/og/dare/[id]`
- Dare pages now emit `summary_large_image` Twitter cards and `og:image` pointing at the challenge-specific SQC card.
- Challenge detail pages reuse the same challenge-specific image endpoint so both accepted links and dare links preview the exact badge/reward/challenge instead of a generic product card.

## Files changed

- `src/app/api/og/dare/[id]/route.tsx`
- `src/app/dare/[id]/page.tsx`
- `src/app/challenges/[id]/page.tsx`

## Verification

Local:

- `pnpm lint` ✅
- `pnpm build` ✅
- Local smoke on `http://localhost:3028` ✅
  - `/api/og/dare/queen-never-heard-of-her` → `200 image/png`
  - `/dare/queen-never-heard-of-her` → `200 text/html`
  - `/challenges/queen-never-heard-of-her` → `200 text/html`
  - metadata includes `og:image`, `twitter:card=summary_large_image`, and `twitter:image`

Production deploy:

- `vercel --prod --yes` ✅
- Deployment: `https://cc-803lzzur6-andreas-nordenadlers-projects.vercel.app`
- Aliased: `https://sidequestchess.com` ✅

Production smoke:

- `https://sidequestchess.com/api/og/dare/queen-never-heard-of-her` → `200 image/png` ✅
- `https://sidequestchess.com/dare/queen-never-heard-of-her` → `200 text/html` ✅
- `https://sidequestchess.com/challenges/queen-never-heard-of-her` → `200 text/html` ✅
- `https://sidequestchess.com/dare/no-castle-club` → `200 text/html` ✅
- Dare metadata includes `https://sidequestchess.com/api/og/dare/queen-never-heard-of-her` as `og:image` and `twitter:image` ✅
- Challenge metadata includes the same challenge-specific image endpoint and `summary_large_image` ✅

Recent error scan:

- Checked deployment logs for status codes `500`, `501`, `502`, `503`, and `504` since `30m`; no matching entries returned. ✅

## Notes

Initial attempt used a dynamic `opengraph-image.tsx` metadata route, but Next.js rejected combining `runtime = "edge"` with `generateStaticParams`. The implementation was switched to an API route image endpoint, which is easier to smoke-test and avoids the metadata-route constraint.
