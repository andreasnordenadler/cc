# SQC home badge preview remove active indicator — 2026-05-06

## Scope
Andreas pointed at the homepage coat-of-arms preview section and said this specific section should not show the active quest indicator.

## Changes made

- Removed the active quest stamp/green active treatment from the `Every bad idea deserves a coat of arms` badge preview row on the homepage.
- Kept active quest treatment elsewhere intact.

## Verification

- `pnpm lint` passed with only existing accepted warnings.
- `pnpm build` passed.
