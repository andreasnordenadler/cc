# SQC website create-intent nav active parity - 2026-07-07

Source of truth: `apps/mobile/App.tsx`.

## Slice

- Mobile hamburger actions expose `Create Custom Side Quest` and `Create Multiplayer Side Quest` as distinct intents.
- Web now treats those intents as first-class active states in `SiteNav`, so the hamburger highlights the exact create action while the bottom dock remains on the parent mobile tab.
- `/create-custom-side-quest` shows `Create Custom Side Quest` in the top chrome and keeps the Side Quests dock item active.
- `/create-multiplayer-side-quest` and `/groupquests/create` show `Create Multiplayer Side Quest` in the top chrome and keep the Multiplayer Side Quests dock item active.

## Files

- `src/components/site-nav.tsx`
- `src/app/create-custom-side-quest/page.tsx`
- `src/app/create-multiplayer-side-quest/page.tsx`
- `src/app/groupquests/create/page.tsx`

## Verification

- `pnpm build` passed on 2026-07-07.
