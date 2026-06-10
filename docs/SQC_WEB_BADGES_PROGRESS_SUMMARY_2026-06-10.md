# SQC Web Badges Progress Summary — 2026-06-10

Closed a small Coat of Arms parity gap versus mobile-v251: the mobile Coat of Arms shelf showed earned/live progress context, while the website `/badges` route only rendered the coat roster and heraldry explanations.

## Shipped

- Added a `Trophy Cabinet status` summary panel to `/badges` using existing website card/fact styles.
- Signed-in visitors now see earned live coats, passed proof receipt count, total SQC points, and a direct `Open Trophy Cabinet` action.
- Signed-out visitors get the same route structure with safe sign-in copy instead of account/private metadata.
- Left the existing badge roster, heraldry cards, navigation, and visual language unchanged.

## Verification

- `pnpm lint -- src/app/badges/page.tsx`
- `pnpm build`
