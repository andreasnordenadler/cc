# SQC website My Custom Side Quests alias parity - 2026-07-07

Source of truth: `apps/mobile/App.tsx`, `GlobalHamburgerMenu`.

## Slice shipped

- Added `/my-custom-side-quests` as a direct web alias for the mobile hamburger item `My Custom Side Quests`.
- Pointed the web hamburger and Side Quests hub `My Custom Side Quests` entries at that same-name route.
- Kept `/custom`, `/custom-side-quests`, and `/account/custom-side-quests` working as compatibility routes to the same account-backed custom library.

## Verification

- `pnpm build` passed on 2026-07-07. Next.js still prints the existing workspace-root warning about multiple lockfiles.
