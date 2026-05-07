# SQC homepage coat-of-arms card link — 2026-05-07

## Request
Andreas pointed at the homepage coat-of-arms preview section and asked that clicking anywhere on the section should take the user to the coat-of-arms page.

## Change
- Changed the whole homepage coat-of-arms preview card into a single link to `/badges`.
- Removed nested links from individual badge preview images to avoid invalid nested anchors.
- Kept the visual badge previews and added hover/focus affordance to the full card.

## Verification
- `pnpm lint` passed with warnings only.
- `pnpm build` passed.
