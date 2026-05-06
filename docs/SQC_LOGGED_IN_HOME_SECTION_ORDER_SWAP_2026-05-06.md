# SQC logged-in homepage section order swap — 2026-05-06

## User request

Andreas sent a logged-in homepage screenshot and asked to switch the positions of the `Every bad idea deserves a coat of arms.` badge-vault section and the `Current run` dashboard card.

## Change

Updated `src/app/page.tsx` so signed-in users see the `Current run` card before the coat-of-arms badge vault. Signed-out homepage copy/ordering remains untouched.

## Verification

- `pnpm lint` passed with existing warnings only.
- `pnpm build` passed.
