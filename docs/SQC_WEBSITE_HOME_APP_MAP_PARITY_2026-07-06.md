# SQC website/mobile home app-map parity - 2026-07-06

Source of truth: `apps/mobile/App.tsx`.

This slice preserves existing user changes and focuses on the website home entry structure. The native signed-in shell exposes a compact hamburger order after Home: Solo Side Quests, Multiplayer Side Quests, Trophy Cabinet, My Custom Side Quests, Create Custom Side Quest, Create Multiplayer Side Quest, Account, and Help & Support. Web companion routes still exist, but should not interrupt that primary route family.

## Parity matrix

| Mobile app surface | Native label/source | Website route/home entry | Status |
| --- | --- | --- | --- |
| Home quick start | Solo, Multiplayer, random Solo, browse path | Home quick-start actions | Matched |
| Hamburger item | `Solo Side Quests` | `/solo` app-map card | Matched |
| Hamburger item | `Multiplayer Side Quests` | `/multiplayer` app-map card | Matched |
| Hamburger item | `Trophy Cabinet` | `/trophy-cabinet` app-map card | Improved order |
| Hamburger item | `My Custom Side Quests` | `/custom` app-map card | Matched |
| Hamburger item | `Create Custom Side Quest` | `/custom#custom-side-quest-builder` app-map card | Matched |
| Hamburger item | `Create Multiplayer Side Quest` | `/groupquests/create` app-map card | Matched |
| Hamburger item | `My Account` / `Sign in / Account` | `/account` app-map card | Matched |
| Hamburger item | `Help & Support` | `/support` app-map card | Matched |
| Web companion routes | Community, Official Leaderboards, Settings | Companion app-map cards after primary entries | Preserved |

## Slice changes

- Reordered the website home app-map cards so the primary route sequence follows the native hamburger route family before web companion routes.
- Replaced meta parity copy with product-facing onboarding copy in the Quick start and App map sections.
- Removed stale, unused website bottom-dock render data and CSS from `SiteNav`/global styles after the previous nav-chrome parity slice stopped rendering the dock.
- Left mobile app files, deep detail routes, aliases, and data flows untouched.

## Proof

- Desktop screenshot: `artifacts/sqc-home-app-map-parity-2026-07-06/home-desktop-full.png`
- Mobile-web screenshot: `artifacts/sqc-home-app-map-parity-2026-07-06/home-mobile-full.png`
- Screenshot server: `pnpm exec next start -p 3068` after `pnpm build`.

## Verification

- `pnpm lint -- src/app/page.tsx src/components/site-nav.tsx` passed.
- `pnpm exec tsc --noEmit --pretty false` passed.
- `pnpm --dir apps/mobile exec tsc --noEmit --pretty false` passed.
- `pnpm build` passed with the existing Next workspace-root warning.
- Screenshot capture used `pnpm exec playwright screenshot --full-page --viewport-size=1440,1800 http://localhost:3068 artifacts/sqc-home-app-map-parity-2026-07-06/home-desktop-full.png`.
- Screenshot capture used `pnpm exec playwright screenshot --full-page --viewport-size=390,1400 http://localhost:3068 artifacts/sqc-home-app-map-parity-2026-07-06/home-mobile-full.png`.
- Note: `pnpm exec playwright screenshot --device-scale-factor=2` was not supported by the local Playwright CLI, so the mobile-web screenshot was retried with viewport sizing only.
