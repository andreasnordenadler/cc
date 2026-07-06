# SQC website/mobile primary nav parity - 2026-07-06

Source of truth: `apps/mobile/App.tsx`.

This slice preserves existing user changes and focuses on the shared website navigation shell. The mobile app's first-level navigation is intentionally tight: `Home`, `Side Quests`, `Multiplayer Side Quests`, `Trophy Cabinet`, and `Account`, with create/custom/support actions in the hamburger menu.

## Parity matrix

| Mobile app surface | Native label/source | Website route/nav | Status |
| --- | --- | --- | --- |
| Bottom tab | `Home` | Primary nav `Home` | Matched |
| Bottom tab + hamburger | `Side Quests` / `Solo Side Quests` | Primary nav `Solo Side Quests` | Matched |
| Bottom tab + hamburger | `Multiplayer Side Quests` | Primary nav `Multiplayer Side Quests` | Matched |
| Bottom tab + hamburger | `Trophy Cabinet` | Primary nav `Trophy Cabinet` | Matched |
| Bottom tab + hamburger | `Account` / `My Account` / `Sign in / Account` | Primary nav account entry | Improved |
| Hamburger actions | Custom/create/support actions | Mobile-web hamburger | Matched |
| Web companion routes | Community, Official Leaderboards, Settings | Desktop `More` overflow | Preserved without crowding primary nav |

## Slice changes

- Updated `src/components/site-nav.tsx` so the desktop primary route order mirrors the mobile shell: Home, Solo Side Quests, Multiplayer Side Quests, Trophy Cabinet, Account.
- Moved web companion links into a compact desktop `More` overflow instead of keeping Community and Official Leaderboards as peer primary links.
- Tightened the mobile-web hamburger list to match the app hamburger actions from `GlobalHamburgerMenu`.
- Added scoped CSS for the desktop overflow menu in `src/app/globals.css`.

## Proof

- Desktop screenshot: `artifacts/sqc-primary-nav-parity-2026-07-06/home-desktop.png`
- Desktop overflow screenshot: `artifacts/sqc-primary-nav-parity-2026-07-06/home-desktop-more-open.png`
- Mobile-web screenshot: `artifacts/sqc-primary-nav-parity-2026-07-06/home-mobile-web.png`
- Mobile-web hamburger screenshot: `artifacts/sqc-primary-nav-parity-2026-07-06/home-mobile-menu-open.png`
- Screenshot server: `pnpm exec next start -p 3067` after `pnpm build`.
- Screenshot note: anonymous page loads rendered, but the local server logged the existing Clerk key mismatch warning: `Refreshing the session token resulted in an infinite redirect loop`.

## Verification

- `pnpm lint -- src/components/site-nav.tsx` passed.
- `pnpm exec tsc --noEmit --pretty false` passed.
- `pnpm --dir apps/mobile exec tsc --noEmit --pretty false` passed.
- `pnpm build` passed with the existing Next workspace-root warning.
