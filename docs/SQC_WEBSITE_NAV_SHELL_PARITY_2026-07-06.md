# SQC website nav shell parity - 2026-07-06

Source of truth: `apps/mobile/App.tsx`.

This slice preserves existing user changes and focuses on the shared website navigation shell. The native app's visible bottom tabs remain `Home`, `Side Quests`, `Multiplayer Side Quests`, `Trophy Cabinet`, and `Account`; the hamburger menu starts with `Home`, `Solo Side Quests`, `Multiplayer Side Quests`, `Trophy Cabinet`, then custom/create/account/support actions.

## Parity matrix

| Mobile app surface | Native label/source | Website route/nav | Status |
| --- | --- | --- | --- |
| Bottom tab | `Home` | `/` primary nav and mobile-web dock | Matched |
| Bottom tab | `Side Quests` | `/solo` primary nav and mobile-web dock | Matched |
| Hamburger item | `Solo Side Quests` | `/solo` desktop primary label | Improved |
| Bottom tab + hamburger | `Multiplayer Side Quests` | `/multiplayer` desktop primary label and mobile-web dock | Improved |
| Bottom tab + hamburger | `Trophy Cabinet` | `/trophy-cabinet` primary nav and mobile-web dock | Matched |
| Bottom tab + hamburger | `Account` / `My Account` / `Sign in / Account` | `/account` primary nav and mobile-web dock | Matched |
| Hamburger action | `My Custom Side Quests` | `/custom` mobile-web menu and desktop More | Matched |
| Hamburger action | `Create Custom Side Quest` | `/custom#custom-side-quest-builder` mobile-web menu and desktop More | Matched |
| Hamburger action | `Create Multiplayer Side Quest` | `/groupquests/create` mobile-web menu and desktop More | Matched |
| Hamburger action | `Help & Support` | `/support` mobile-web menu and desktop More | Matched |
| Web companion routes | Community, Official Leaderboards, Settings | Desktop/mobile-web overflow routes | Preserved |

## Slice changes

- Updated `src/components/site-nav.tsx` so the desktop primary row leads with the native shell destinations: Home, Solo Side Quests, Multiplayer Side Quests, Trophy Cabinet, Account.
- Moved Community, Official Leaderboards, Custom, Settings, and Support into desktop `More` while keeping their active state visible.
- Reordered the mobile-web hamburger menu to match the native hamburger sequence before web companion routes.
- Left mobile app files, route aliases, data flows, and page content untouched.

## Proof

- Desktop screenshot: `artifacts/sqc-nav-shell-parity-2026-07-06/home-desktop.png`
- Desktop More screenshot: `artifacts/sqc-nav-shell-parity-2026-07-06/home-desktop-more-open.png`
- Mobile-web screenshot: `artifacts/sqc-nav-shell-parity-2026-07-06/home-mobile-web.png`
- Mobile-web menu screenshot: `artifacts/sqc-nav-shell-parity-2026-07-06/home-mobile-menu-open.png`

## Verification

- `pnpm lint -- src/components/site-nav.tsx` passed.
- `pnpm exec tsc --noEmit --pretty false` passed.
- `pnpm --dir apps/mobile exec tsc --noEmit --pretty false` passed.
- `pnpm build` passed with the existing Next workspace-root warning.
- Screenshot server: `pnpm exec next start -p 3069` after `pnpm build`.
