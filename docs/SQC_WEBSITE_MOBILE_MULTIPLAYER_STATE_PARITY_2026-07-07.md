# SQC website/mobile Multiplayer state parity - 2026-07-07

Source of truth: `apps/mobile/App.tsx`, especially `MultiplayerSideQuestsScreen`.

## Slice shipped

- Added an app-style Official / Community tab rail to the web Multiplayer mode switcher.
- Added a Multiplayer state summary strip on `/multiplayer` and `/multiplayer-side-quests` covering:
  - Official Multiplayer Side Quests
  - Community Multiplayer Side Quests
  - My active joined/hosted Multiplayer Side Quests
  - Finished/proof-result states
  - Create Multiplayer Side Quest
  - Join by private invite code
- Kept existing APIs and group quest proof/account logic untouched.

## Parity note

The mobile app opens Multiplayer on the official catalog, offers a Community switch, and keeps create/join/proof states in the same destination. The web Multiplayer route now exposes that same state map above the existing signed-in and signed-out lanes, while preserving route aliases and existing detail/create/public routes.

## Verification

- `pnpm build` passed on 2026-07-07. Next.js still prints the existing workspace-root warning about multiple lockfiles.
- Screenshot attempt: local dev server started on `http://127.0.0.1:3017`, but OpenClaw browser `target="host"` blocked navigation with `browser navigation blocked by policy`; `target="sandbox"` was unavailable. Dev server was stopped cleanly.
