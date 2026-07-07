# SQC website Multiplayer Community shortcut parity - 2026-07-07

Source of truth: `apps/mobile/App.tsx`, especially `MultiplayerSideQuestsScreen`.

## Slice

- Added mobile Community filter shortcuts on `/multiplayer`: `Open`, `All`, `Joined`, `Hosted`, and `Finished`.
- Added mobile Community sort shortcuts on `/multiplayer`: `Sort: Closing`, `Sort: Liked`, `Sort: New`, and `Sort: Players`.
- Preserved guest parity: signed-out web users see the mobile guest filters `Open` and `All`, while signed-in users get the full mobile filter set.
- Kept the existing `/groupquests/public` filter implementation and proof/account logic intact.

## Proof

- `pnpm build` passed after the slice.
- Local screenshot attempt was blocked before UI render by the existing Clerk environment error:
  `Clerk: Refreshing the session token resulted in an infinite redirect loop. This usually means that your Clerk instance keys do not match`.
