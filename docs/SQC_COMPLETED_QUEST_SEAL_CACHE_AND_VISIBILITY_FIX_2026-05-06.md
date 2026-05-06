# SQC completed quest seal cache and visibility fix — 2026-05-06

## Scope
Andreas reported he could not see that the completed quest seal had updated. Screenshots showed the prior update was either cached or still not visually distinct enough.

## Changes made

- Added a new cache-busting asset filename: `public/stamps/quest-complete-seal-sqc-v2.png`.
- Updated CSS to reference the new filename instead of reusing `quest-complete-seal.png`.
- Rebuilt the seal so the actual SQC/Proof Loop Test coat of arms is much larger and clearer in the center.
- Kept the red/gold wax-stamp/seal direction from the reference images.

## Verification

- Visual preview checked on dark background.
- `pnpm lint` passed with only existing accepted warnings.
- `pnpm build` passed.
