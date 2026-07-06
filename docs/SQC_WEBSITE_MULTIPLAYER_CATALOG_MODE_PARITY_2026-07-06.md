# SQC website/mobile Multiplayer catalog mode parity - 2026-07-06

Source of truth: `apps/mobile/App.tsx`.

This slice preserves existing user changes and focuses on the top-level Multiplayer Side Quests surface. The mobile app's Multiplayer tab starts with a two-choice catalog split: `Official Side Quests` and `Community Side Quests`. Active/joined/hosted runs and creation remain close by, but they sit inside the Multiplayer area rather than competing with the catalog split.

## Parity matrix

| Mobile app surface | Native label/source | Website route/control | Status |
| --- | --- | --- | --- |
| Bottom tab | `Multiplayer Side Quests` | `/multiplayer` | Preserved |
| Multiplayer catalog tab | `Official Side Quests` | Primary switcher item to `/leaderboards` | Improved hierarchy |
| Multiplayer catalog tab | `Community Side Quests` | Primary switcher item to `/groupquests/public` | Improved hierarchy |
| Community section | Joined/hosted active quests | Secondary switcher item to `/multiplayer` | Preserved |
| Hamburger action | `Create Multiplayer Side Quest` | Secondary switcher item to `/groupquests/create` | Preserved |

## Slice changes

- Updated `src/components/multiplayer-mode-switcher.tsx` so Official and Community are grouped as the primary Multiplayer catalog choice.
- Kept My Multiplayer Side Quests and Create Multiplayer Side Quest as secondary Multiplayer actions.
- Reused the existing Solo catalog switcher layout classes for the Multiplayer hierarchy.
- Left mobile app code, APIs, route aliases, account flows, and proof flows untouched.

## Proof

- Desktop Multiplayer screenshot: `artifacts/sqc-multiplayer-catalog-mode-parity-2026-07-06/multiplayer-desktop.png`
- Mobile-web Multiplayer screenshot: `artifacts/sqc-multiplayer-catalog-mode-parity-2026-07-06/multiplayer-mobile.png`
- Screenshot server: `pnpm exec next start -p 3072` after `pnpm build`.
- Screenshot note: anonymous page loads rendered, but the local server logged the existing Clerk key mismatch warning: `Refreshing the session token resulted in an infinite redirect loop`.

## Verification

- `pnpm lint -- src/components/multiplayer-mode-switcher.tsx` passed.
- `pnpm exec tsc --noEmit --pretty false` passed.
- `pnpm --dir apps/mobile exec tsc --noEmit --pretty false` passed.
- `pnpm build` passed with the existing Next workspace-root warning.
