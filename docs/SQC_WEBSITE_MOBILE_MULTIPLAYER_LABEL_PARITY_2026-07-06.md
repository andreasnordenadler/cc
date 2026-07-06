# SQC website/mobile multiplayer label parity - 2026-07-06

Source of truth: `apps/mobile/App.tsx`.

This slice preserves existing user changes and focuses only on the website Multiplayer entry route. Mobile consistently presents this surface as `Multiplayer Side Quests`; `cleanMultiplayerTitle` also normalizes old `room`/`rooms` wording into `Multiplayer Side Quest` labels.

## Parity matrix

| Mobile app surface | Native label/source | Website route | Status |
| --- | --- | --- | --- |
| Bottom tab | `Multiplayer Side Quests` in `TABS` | `/multiplayer` -> `/groupquests` | Matched |
| Hamburger item | `Multiplayer Side Quests` | `/multiplayer` and top nav | Matched |
| Hamburger create action | `Create Multiplayer Side Quest` | `/groupquests/create` | Matched |
| Detail/share text | `cleanMultiplayerTitle` replaces `room(s)` with `Multiplayer Side Quest(s)` | `/groupquests` visible hub copy | Improved |
| Public/private/hosted entry choices | Join, create, and inspect Multiplayer Side Quests | `/groupquests`, `/groupquests/public`, `/groupquests/create` | Improved |

## Slice changes

- Updated `src/app/groupquests/page.tsx` visible copy from table/room framing to `Multiplayer Side Quest` framing on the `/multiplayer` entry route.
- Kept implementation names, CSS classes, route aliases, and data structures untouched to avoid unrelated churn.
- Verified the rendered `/multiplayer` page no longer contains the stale labels `Host a table`, `Join a public table`, `Browse Public Tables`, `Your Multiplayer table room`, or `Choose your table`.

## Proof

- Desktop screenshot: `artifacts/sqc-multiplayer-label-parity-2026-07-06/multiplayer-desktop.png`
- Mobile-web screenshot: `artifacts/sqc-multiplayer-label-parity-2026-07-06/multiplayer-mobile-web.png`
- Screenshot server: `pnpm exec next start -p 3057` after `pnpm build`

## Verification

- `pnpm lint -- src/app/groupquests/page.tsx` passed.
- `pnpm exec tsc --noEmit --pretty false` passed.
- `pnpm --dir apps/mobile exec tsc --noEmit --pretty false` passed.
- `pnpm build` passed with the existing Next workspace-root warning.
