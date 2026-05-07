# SQC trophy card hover tilt removal — 2026-05-07

## Request
Andreas noticed the completed quest trophy card tilted on hover and asked whether it was intentional.

## Change
- Removed the hover rotation from `.trophy-card`.
- Kept the subtle vertical lift and glow/border hover treatment.

## Verification
- `pnpm lint` passed with warnings only.
- `pnpm build` passed.
