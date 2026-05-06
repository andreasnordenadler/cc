# SQC completed quest wax seal ribbon text and angle fix — 2026-05-06

## Scope
Andreas clarified that `Side Quest Chess` should be part of the wax seal itself, like the original SQC coat-of-arms banner, and that the `Quest completed...` pill was just a little too slanted.

## Changes made

- Created `public/stamps/quest-complete-premium-red-wax-sqc-v14.png`.
- Rebuilt the `SIDE QUEST CHESS` lettering as debossed red-on-red text inside the lower ribbon/banner area of the seal.
- Kept the lettering integrated into the wax material instead of a brighter floating overlay.
- Updated CSS to reference the cache-busted v14 seal asset.
- Reduced the completion pill slant by changing the pill's counter-rotation from `-1deg` to `3deg` relative to the rotated seal group.

## Verification

- Visual preview confirmed `SIDE QUEST CHESS` reads as part of the wax ribbon/banner and not a floating overlay.
- `pnpm lint` passed with only existing accepted warnings.
- `pnpm build` passed.
