# SQC account connected accounts cleanup — 2026-05-06

## Scope
Andreas pointed at the My Quest Log / account connected-accounts panel and asked to remove:

- `Ready for proof.` text
- `2/2 connected` pill
- `Update accounts` button

## Changes made

- Removed the connected-state `Ready for proof.` headline from the connected accounts card.
- Removed the connected-count pill entirely.
- Removed the connected-state `Update accounts` button.
- Kept `Connect chess account` available only when no chess identity is connected.
- Kept `Edit profile` available.

## Verification

- `pnpm lint` passed with only existing accepted warnings.
- `pnpm build` passed.
