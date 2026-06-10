# SQC Web Account Readiness Panel — 2026-06-10

## Slice

Closed a small account-readiness parity gap versus mobile-v251 on the signed-in website account page.

## Shipped

- Added an `Account readiness` panel to `/account` using the existing mission-card/account styling.
- Shows profile display-name readiness, brag-line readiness, Lichess username, and Chess.com username with direct links to `/profile` or `/connect`.
- Added a compact account progress summary for completed Solo quests, passed proof receipts, Custom Solo library state, and active Multiplayer hosted/joined counts.
- Keeps private data boundaries: no email address, raw custom quest configs, invite codes, or private participant metadata are rendered in the new panel.

## Verification

- `pnpm lint -- src/app/account/page.tsx`
- `pnpm build`

## Live smoke

Pending production deploy in the sprint log.
