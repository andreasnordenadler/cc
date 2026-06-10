# SQC Any Game Counts Transparent Quality Fix — 2026-06-10

## Trigger
Andreas flagged that the refreshed `Any Game Counts` / `finish-any-game` coat of arms did not match the quality of the other SQC coats and that the background was not transparent.

## Fix
- Replaced `public/badges/v6/proof-loop-test-badge.png` with a higher-quality no-text/no-letter SQC-style crest.
- Mirrored the same corrected asset to `apps/mobile/assets/badges/v6/proof-loop-test-badge.png`.
- Used edge-connected chroma-key removal so only the outside background is transparent and internal crest/shield details remain intact.

## Transparency proof
Both web and mobile assets are `1024x1024 RGBA` PNGs with alpha extrema `(0, 255)` and transparent corner samples `[0, 0, 0, 0, 0, 0]`.

## Visual QA
Generated checker/magenta/black previews in `artifacts/badge-fix-2026-06-10/` and ran strict visual QC against existing SQC v6 badge references. Result: ship — clean outside transparency, no accidental internal holes, no readable text/letters/numbers, and quality/style aligns with the reference badge set.

## Verification
- `pnpm build` passed.
- `pnpm quest:release-gate` passed.

## Deployment
- Commit: `88e28d8` (`Fix Any Game Counts badge transparency`).
- Production deploy: `https://cc-iltevfrl2-andreas-nordenadlers-projects.vercel.app`, aliased to `https://sidequestchess.com`.
- Live smoke passed for `/challenges/finish-any-game`, `/badges`, and `/badges/v6/proof-loop-test-badge.png`.
- Live image proof: `200 image/png`, `1024x1024 RGBA`, alpha extrema `(0, 255)`, transparent corners `[0, 0, 0, 0, 0, 0]`, transparent pixels `47.63%`.
