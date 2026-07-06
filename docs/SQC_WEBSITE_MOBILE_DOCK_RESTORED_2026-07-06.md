# SQC website/mobile dock restored - 2026-07-06

Source of truth: `apps/mobile/App.tsx`.

This slice preserves the existing untracked research note in `docs/research/` and restores the phone-width web dock after the primary-nav refactor. The web desktop nav remains aligned with the mobile shell order, while phone web now again has the same five persistent app tabs as native mobile.

## Parity matrix

| Mobile app surface | Native label/source | Website route/nav | Status |
| --- | --- | --- | --- |
| Bottom tab | `Home` | Phone dock `/` | Restored |
| Bottom tab | `Side Quests` | Phone dock `/solo` | Restored |
| Bottom tab | `Multiplayer Side Quests` | Phone dock `/multiplayer` | Restored |
| Bottom tab | `Trophy Cabinet` | Phone dock `/trophy-cabinet` | Restored |
| Bottom tab | `Account` | Phone dock `/account` | Restored |
| Hamburger menu | Solo, Custom, Create Multiplayer, Account, Support | Existing phone hamburger | Preserved |
| Desktop primary nav | Home, Solo, Multiplayer, Trophy, Account, More | Existing desktop nav | Preserved |

## Slice changes

- Restored `mobile-app-dock` rendering in `src/components/site-nav.tsx`.
- Added dock CSS, active state, icon framing, and phone bottom spacing in `src/app/globals.css`.
- Kept mobile app code untouched and did not change route behavior.

## Proof

- Desktop screenshot: `artifacts/sqc-mobile-dock-restored-2026-07-06/home-desktop.png`
- Mobile-web home screenshot: `artifacts/sqc-mobile-dock-restored-2026-07-06/home-mobile-web.png`
- Mobile-web Multiplayer screenshot: `artifacts/sqc-mobile-dock-restored-2026-07-06/multiplayer-mobile-web.png`
- Screenshot server: `pnpm exec next start -p 3071` after `pnpm build`.

## Verification

- `pnpm lint -- src/components/site-nav.tsx src/app/globals.css` passed with the existing CSS ignored warning.
- `pnpm exec tsc --noEmit --pretty false` passed.
- `pnpm --dir apps/mobile exec tsc --noEmit --pretty false` passed.
- `pnpm build` passed with the existing Next workspace-root warning.
