# SQC account top grid compaction — 2026-05-07

## Request
Andreas asked to remove the coat-of-arms display from the left My Side Quest hero section because the page already has another completed-quest section for coats of arms. He also asked to make the Current Quest coat of arms smaller so the two top sections are more compact.

## Change
- Removed the left hero coat-of-arms rack from `/account`.
- Reduced the left hero section padding and title scale.
- Reduced the Current Quest coat-of-arms size and spacing.
- Centered the smaller Current Quest card content to keep the top grid balanced.

## Verification
- `pnpm lint` passed with warnings only.
- `pnpm build` passed.
