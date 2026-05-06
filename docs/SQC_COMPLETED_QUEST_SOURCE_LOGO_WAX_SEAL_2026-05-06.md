# SQC completed quest source-logo wax seal — 2026-05-06

## Scope
Andreas provided the exact Side Quest Chess coat-of-arms/logo source image for the completed quest stamp and clarified that this is the source of the stamp he wants.

## Changes made

- Converted the provided SQC source logo directly into a single-material red wax relief instead of reinterpreting it as a new crest.
- Preserved the source logo silhouette and identity: crowned horse/knight crest, shield, rook/tower, side scrollwork, and `SIDE QUEST CHESS` banner.
- Added cache-busting asset `public/stamps/quest-complete-red-wax-sqc-logo-v5.png`.
- Updated completed quest CSS to use the source-logo wax seal asset.

## Verification

- Visual preview checked on dark background: all-red wax treatment, strong source-logo preservation, readable banner, no non-red logo colors.
- `pnpm lint` passed with only existing accepted warnings.
- `pnpm build` passed.
