# SQC remove current quest proof CTA — 2026-05-07

## Request
Andreas asked to remove the “View victory proof” button from the Current Quest card on My Side Quest, noting that the target page is not needed there.

## Change
- Removed the `/result?challengeId=...` CTA from the completed current quest card on `/account`.
- The current quest card now stays focused on the coat of arms/title without sending users to the result target page.

## Verification
- `pnpm lint` passed with warnings only.
- `pnpm build` passed.
