# SQC web Multiplayer proof choice polish — 2026-06-11

Sprint: SQC website UX parity review (2026-06-10 20:18 → 2026-06-11 20:18 Europe/Stockholm)

## User-facing change

- Polished the joined Multiplayer proof area so it reads like the upgraded Solo proof checker instead of a loose refresh button.
- Reframed the panel as `Check the table without leaving the page` with two SQC-styled cards:
  - `Fastest check` / `Judge my latest table game` for the actual latest-game verifier action.
  - `What SQC checks` to explain objective, provider, finished-game, time-window, leaderboard, receipt, and Trophy Cabinet behavior.
- Cleaned up Multiplayer onboarding/rules copy so it no longer promises a paste-game-link path that this surface does not yet support.
- Preserved existing verifier behavior, leaderboard updates, proof-board receipts, account proof sync, and SQC visual language.

## Files changed

- `src/components/group-quest-proof-controls.tsx`
- `src/app/groupquests/[id]/page.tsx`
- `src/app/globals.css`

## Checks

- `pnpm lint -- 'src/app/groupquests/[id]/page.tsx' src/components/group-quest-proof-controls.tsx src/app/globals.css`
  - Passed with the existing CSS ignored-file warning only.
- `pnpm build`
  - Passed.

## Production smoke

Pending deployment/smoke in this tick.
