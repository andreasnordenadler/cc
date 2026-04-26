# SQC dare-link social metadata live deploy — 2026-04-27

## Scope

Added challenge-specific metadata for Side Quest Chess challenge and friend-dare URLs so shared links preview as the exact dare/challenge instead of a generic homepage pitch.

## Changed files

- `src/app/dare/[id]/page.tsx`
  - Added `generateStaticParams()` for starter challenge dare pages.
  - Added dynamic `generateMetadata()` with canonical URL, Open Graph title/description, and Twitter summary metadata.
- `src/app/challenges/[id]/page.tsx`
  - Added matching challenge-specific canonical, Open Graph, and Twitter metadata.

## Verification

- `pnpm lint` ✅
- `pnpm build` ✅
  - Build generated 23 app pages and prerendered starter `/dare/[id]` paths.
- Local metadata smoke via `python3 urllib` on running local dev server ✅
  - `http://localhost:3011/dare/queen-never-heard-of-her` contained `og:title`, `twitter:title`, canonical URL, `Side Quest Chess`, and `Queen? Never Heard of Her`.
  - `http://localhost:3011/challenges/queen-never-heard-of-her` contained `og:title`, `twitter:title`, canonical URL, `Side Quest Chess`, and `Queen? Never Heard of Her`.

## Production deploy

- Command: `vercel --prod --yes` ✅
- Deployment: `https://cc-pe7m0hy3j-andreas-nordenadlers-projects.vercel.app`
- Alias: `https://sidequestchess.com` ✅

## Production smoke

Checked with `python3 urllib` and browser-like user agent:

- `https://sidequestchess.com/dare/queen-never-heard-of-her` → HTTP 200, challenge-specific metadata present ✅
- `https://sidequestchess.com/challenges/queen-never-heard-of-her` → HTTP 200, challenge-specific metadata present ✅
- `https://sidequestchess.com/dare/no-castle-club` → HTTP 200, challenge-specific metadata present ✅

## Vercel log scan

- `vercel logs https://cc-pe7m0hy3j-andreas-nordenadlers-projects.vercel.app --no-follow --since 30m --status-code 500 --json` → 0 lines ✅

## Notes

This keeps the viral loop small and concrete: every copied friend-dare link now has a direct public page plus metadata that names the exact bad idea, reward, and badge. No PGN upload, engine-analysis, or training-product framing was added.
