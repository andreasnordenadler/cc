# SQC canonical wax seal asset — 2026-05-06

## Scope
Andreas provided the final wax seal image and asked to use it as the wax seal and keep the file because it will be reused a lot.

## Files kept

- Original/source copy preserved exactly as provided:
  - `public/stamps/sqc-wax-seal-canonical-source.png`
- UI-ready transparent/cropped asset:
  - `public/stamps/sqc-wax-seal-canonical.png`

## Changes made

- Copied Andreas-provided seal into the project as the canonical source asset.
- Created a transparent 1024×1024 UI-ready version by removing the baked checkerboard/grey preview background.
- Updated completed quest CSS to use `sqc-wax-seal-canonical.png`.

## Verification

- Visual preview confirmed the grey/checkerboard background is removed cleanly, seal remains intact, and `SIDE QUEST CHESS` is readable.
- `pnpm lint` passed with only existing accepted warnings.
- `pnpm build` passed.
