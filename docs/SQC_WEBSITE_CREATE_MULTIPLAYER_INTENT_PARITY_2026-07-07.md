# SQC website create Multiplayer intent parity - 2026-07-07

Source of truth: `apps/mobile/App.tsx`.

## Mobile behavior mapped

- Hamburger menu exposes `Create Multiplayer Side Quest`.
- Multiplayer Side Quests screen exposes a create action for signed-in players.
- Signed-out players are told to sign in before creating.
- Create flow includes name/invite copy, up to four Side Quests, provider rules, proof window, and invite visibility.

## Web slice

- `/create-multiplayer-side-quest` is no longer a silent redirect.
- Signed-out users now get a mobile-app-style create intent screen with the Multiplayer tab switcher, max-four quest framing, and the same create flow fields.
- Signed-in users still land on the existing builder at `/groupquests/create`.
- A `quest` query parameter is preserved when handing off to `/groupquests/create`.

## Proof

- `pnpm build` run after this slice.
- Screenshots:
  - `artifacts/sqc-create-multiplayer-intent-parity-2026-07-07/mobile.png`
  - `artifacts/sqc-create-multiplayer-intent-parity-2026-07-07/desktop.png`
- Local screenshot note: the known Clerk refresh-loop warning appeared in the Next server logs during anonymous page views, but the signed-out route rendered and screenshots were captured.
