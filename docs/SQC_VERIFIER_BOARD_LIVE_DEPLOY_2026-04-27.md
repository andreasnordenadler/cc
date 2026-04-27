# SQC verifier board live deploy — 2026-04-27

## What shipped

Added a public `/verifiers` board for Side Quest Chess so players can see which starter-deck dares have live-backed proof today and which verifier adapters are still rule contracts.

## Product impact

- Makes the proof loop more trustworthy before every challenge has automation.
- Separates `Live-backed`, `Next adapter`, and `Specified` states so the product does not imply fake success.
- Highlights the current live-backed `Queen? Never Heard of Her` Lichess checker.
- Links the homepage, nav, and rulebook into the verifier board.

## Files changed

- `src/app/verifiers/page.tsx`
- `src/components/site-nav.tsx`
- `src/app/page.tsx`
- `src/app/rules/page.tsx`
- `ROADMAP.md`

## Verification

- `pnpm lint` ✅
- `pnpm build` ✅
- Local production-mode route smoke with `pnpm exec next start -p 3123` ✅
  - `/` → 200
  - `/verifiers` → 200 and contained `Verifier board`, `Queen? Never Heard of Her`, `Live-backed`
  - `/rules` → 200
  - `/share-kit` → 200
- Production deploy ✅
  - Deployment: `https://cc-akx1rr4ir-andreas-nordenadlers-projects.vercel.app`
  - Aliased: `https://sidequestchess.com`
- Production smoke ✅
  - `https://sidequestchess.com/` → 200
  - `https://sidequestchess.com/verifiers` → 200 and contained `Every weird dare needs an honest receipt`, `Live-backed`
  - `https://sidequestchess.com/rules` → 200
  - `https://sidequestchess.com/share-kit` → 200
  - `https://sidequestchess.com/api/og/dare/queen-never-heard-of-her` → 200
- Vercel production 500/501/502/503/504 scan for last 30m ✅
  - No logs found for those error status codes.

## Follow-up

The next high-value verifier implementation is still `No Castle Club`: normalize provider move history and prove a win with no castling.
