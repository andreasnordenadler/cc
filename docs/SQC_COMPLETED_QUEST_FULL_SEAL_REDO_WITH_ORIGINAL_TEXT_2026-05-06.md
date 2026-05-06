# SQC completed quest full seal redo with original text — 2026-05-06

## Scope
Andreas rejected the patched seal text and asked to redo the whole seal, making sure to include the text present in the original SQC coat of arms.

## Changes made

- Regenerated the wax seal from scratch using the original Side Quest Chess coat-of-arms as the source reference.
- New cache-busted asset: `public/stamps/quest-complete-premium-red-wax-sqc-v15.png`.
- The lower banner text `SIDE QUEST CHESS` is now part of the generated wax-seal composition, not a post-added overlay.
- Removed the magenta generation background and cleaned the edge fringe locally.
- Updated completed quest CSS to reference the new v15 seal asset.

## Verification

- Visual inspection confirmed the new seal reads as a cohesive red wax seal and includes readable `SIDE QUEST CHESS` text integrated into the lower banner area.
- `pnpm lint` passed with only existing accepted warnings.
- `pnpm build` passed.
