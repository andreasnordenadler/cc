# SQC Website Multiplayer State Switcher Parity - 2026-07-07

## Source of truth

- `apps/mobile/App.tsx` defines the top-level tab as `multiplayerSideQuests`.
- `apps/mobile/App.tsx` defines `MultiplayerCatalogTab = "official" | "community"`.
- The mobile help copy says Multiplayer Side Quests let players "Join an official challenge, join a community challenge, or create one for friends."
- The mobile detail/action flow includes joined/open rooms, refresh/proof actions, finished results, and private/invite entry points.

## Web parity slice

- `src/components/multiplayer-mode-switcher.tsx` now exposes the mobile Multiplayer model as:
  - Official Side Quests
  - Community Side Quests
  - My active
  - Proof states
  - Create Multiplayer Side Quest
  - Join by code
- `src/app/groupquests/page.tsx` now describes the same Community, create, join, and proof states in the signed-in and signed-out guide cards.

## Verification

- `pnpm build` passed on 2026-07-07.
- Build warning only: Next.js inferred `/Users/sam/pnpm-lock.yaml` as workspace root because multiple lockfiles exist.
