# SQC completed quest wax seal opaque/text polish — 2026-05-06

## Scope
Andreas shared a screenshot and requested four polish fixes: remove transparency in the top of the seal where underlying text shows through, move the seal slightly higher, slant the `Quest completed...` pill to match the seal better, and make the `Side Quest Chess` text on the seal more visible.

## Changes made

- Created `public/stamps/quest-complete-premium-red-wax-sqc-v12.png`.
- Filled internal transparent/low-alpha cut-throughs in the wax seal with red wax so underlying text no longer shows through the top.
- Boosted the seal's `SIDE QUEST CHESS` lettering as red-on-red embossed text, keeping the all-wax look.
- Updated CSS to reference the cache-busted v12 seal asset.
- Moved the seal higher in the completed hero.
- Adjusted the completion pill rotation so it follows the seal angle more closely instead of visually cancelling the slant.

## Verification

- Visual preview confirmed the seal is opaque with no obvious text-through holes, and `SIDE QUEST CHESS` is more visible while remaining red-on-red.
- `pnpm lint` passed with only existing accepted warnings.
- `pnpm build` passed.
