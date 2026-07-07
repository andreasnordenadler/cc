# SQC website Create Multiplayer route entry parity - 2026-07-07

Source of truth: `apps/mobile/App.tsx`.

## Slice

- Mobile exposes `Create Multiplayer Side Quest` as a distinct hamburger/action-card intent.
- Web already has `/create-multiplayer-side-quest` as the app-style intent screen and `/groupquests/create` as the underlying builder route.
- This slice routes visible app-navigation entries through `/create-multiplayer-side-quest`:
  - Home app map
  - Settings mobile-menu shortcut
  - Multiplayer overview create step
  - signed-out Multiplayer host action
  - Multiplayer table guide host card
  - Public Multiplayer create button
  - Public Multiplayer empty state
  - Custom Side Quest library "Use one in Multiplayer"
  - shared Multiplayer mode switcher create action
- `/groupquests/create` is preserved as the builder alias so existing links and API/proof/account behavior continue working.

## Verification

- `pnpm build` passed on 2026-07-07. Next.js still reports the existing workspace-root warning because multiple lockfiles are present.
