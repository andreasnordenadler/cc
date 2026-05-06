# SQC completed quest red wax seal — 2026-05-06

## Scope
Andreas clarified that the completed quest stamp should be an all-red photorealistic wax seal, like the reference image, with the Side Quest Chess coat/crest embossed into the wax.

## Changes made

- Generated a new red wax seal using the SQC/Proof Loop Test coat-of-arms asset as the central embossed reference.
- Removed the magenta generation background locally and cleaned edge haloing.
- Added cache-busting asset `public/stamps/quest-complete-red-wax-sqc-v3.png`.
- Updated completed quest CSS to use the new all-red wax seal asset.

## Verification

- Visual preview checked on dark background: all-red wax, photorealistic highlights/shadows, embossed chess/coat-of-arms motif, no readable text, no visible magenta fringe.
- `pnpm lint` passed with only existing accepted warnings.
- `pnpm build` passed.
