# SQC website Multiplayer community filter parity - 2026-07-07

Source of truth: `apps/mobile/App.tsx`.

## Slice

- Matched the public Multiplayer Side Quest discovery status controls to the mobile `MultiplayerCommunityFilter` states.
- Signed-out web players now see only `Open` and `All`, like the mobile signed-out browse mode.
- Signed-in web players keep `Open`, `All`, `Joined`, `Hosted`, and `Finished`.
- Matched the sort option order and labels to the mobile sort cycle: `Sort: Closing`, `Sort: Liked`, `Sort: New`, `Sort: Players`.

## Files

- `src/app/groupquests/public/page.tsx`

## Proof

- `pnpm build` passed.
- Local screenshot attempt: `pnpm dev --hostname 127.0.0.1 --port 3027` plus Playwright against `/groupquests/public` hit the known local Clerk refresh-loop/internal-server-error path, so no useful screenshot was kept.
