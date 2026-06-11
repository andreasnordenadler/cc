# SQC web Community Custom coat pool polish — 2026-06-11

Sprint: `sqc-website-ux-parity-review-24h`

## User-facing change

- Upgraded the Custom Solo / Community Solo coat assignment pool from the small clean placeholder set to 48 dedicated community coat-of-arms assets.
- New Custom Solo Side Quests now draw from `/badges/custom/community/community-coat-01.png` through `community-coat-48.png`.
- Existing custom/public quest display stays deterministic: older or missing badge metadata is still mapped to a stable approved coat from the new pool instead of exposing fallback/generic art.
- Updated the community-coat reassignment script to use the same 48-asset pool for any future safe rerolls.

## Visual QA

- Generated contact sheet: `tmp/community-coat-pool-contact-sheet-20260611.png`.
- Contact-sheet review found no visible text, letters, numbers, broken renders, or transparency failures in the assets.
- Local PNG inspection confirmed 48 files, each `512x512 RGBA` with alpha range `(0, 255)`.

## Checks

- `pnpm lint -- src/lib/custom-side-quests.ts scripts/randomize-community-coats.mjs`
- `pnpm build`
- `pnpm quest:release-gate`

## Production

- Pending focused commit/deploy at the time this proof doc was written.
