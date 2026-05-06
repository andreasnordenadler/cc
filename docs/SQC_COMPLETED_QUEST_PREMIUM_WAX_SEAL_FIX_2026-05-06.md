# SQC completed quest premium wax seal fix — 2026-05-06

## Scope
Andreas corrected the previous source-logo red treatment: it still did not look like a wax seal. The goal is a genuinely photorealistic red wax seal, with the SQC coat/logo as an embossed stamp impression.

## Changes made

- Replaced the deterministic red logo-style asset with a premium photorealistic wax-seal render.
- New cache-busted asset: `public/stamps/quest-complete-premium-red-wax-sqc-v9.png`.
- The seal now prioritizes physical wax realism: irregular melted edge, glossy red wax, pits, dents, thick shadows, and embossed crest impression.
- Added a radial CSS mask on the award seal layer so the dark matte asset does not read as a square image on the card.

## Verification

- Visual inspection selected the candidate that reads most like real red wax rather than a red-tinted logo.
- `pnpm lint` passed with only existing accepted warnings.
- `pnpm build` passed.
