# SQC Web/Mobile Parity Matrix - 2026-07-04

## Source of Truth

- Mobile entry point inspected: `apps/mobile/App.tsx`.
- Mobile primary tabs: `Home`, `Side Quests`, `Multiplayer Side Quests`, `Trophy Cabinet`, `Account`.
- Mobile hamburger additions: `Solo Side Quests`, `My Custom Side Quests`, `Create Custom Side Quest`, `Create Multiplayer Side Quest`, `Help & Support`, `Sign in / Account`.
- Website routes inspected: `src/app/page.tsx`, `src/components/site-nav.tsx`, and top-level aliases for `/solo`, `/custom`, `/community`, `/multiplayer`, `/account`, `/settings`, `/support`.

## Parity Matrix

| Product area | Mobile source label/screen | Web route/status | 2026-07-04 slice |
| --- | --- | --- | --- |
| Home entry | `Home` / today dashboard | `/` exists with active Solo, Multiplayer, Trophy Cabinet summaries | Added an app-map section that names the same top-level product areas and links to the matching web routes, including Trophy Cabinet and Help & Support. |
| Solo | `Side Quests`, hamburger `Solo Side Quests` | `/solo` aliases `/challenges`; `/challenges` has official deck and links to community/multiplayer | Updated shared nav label from `Solo` to `Solo Side Quests`. |
| Custom | `My Custom Side Quests`, `Create Custom Side Quest` | `/custom` aliases `/account/custom-side-quests`; builder anchor is `/custom#custom-side-quest-builder` | Updated shared nav label from `Custom` to `My Custom Side Quests`; app-map links both the library and the creation entry point. |
| Community | `Community Side Quests` inside Solo catalog | `/community` aliases `/challenges/community` | Updated shared nav label from `Community` to `Community Side Quests`; app-map makes this a Solo Side Quest community area. |
| Multiplayer | `Multiplayer Side Quests`, `Create Multiplayer Side Quest` | `/multiplayer` aliases `/groupquests`; create route is `/groupquests/create` | Updated shared nav label from `Multiplayer` to `Multiplayer Side Quests`; app-map links both browse/join and create-host entry points. |
| Trophy | `Trophy Cabinet` | `/trophy-cabinet` exists | Already aligned in nav; app-map keeps Trophy Cabinet in the mobile-style product map. |
| Account/profile | `Account`, `My Account`, `Sign in / Account` | `/account`, `/profile`, `/connect`; signed-out nav uses auth buttons | App-map links Account when signed in and Sign in / Account when signed out; signed-in nav now uses the mobile hamburger `My Account` label. |
| Settings/support | `Help & Support` in hamburger | `/support` exists; `/settings` aliases support | Top nav and app-map now use `Help & Support`, matching the mobile account/support modal entry. |

## Implemented Proof

- Changed the shared website top nav vocabulary to the mobile app labels, including `My Account` and `Help & Support`.
- Added a home app-map panel so signed-in and signed-out users see the same product hierarchy the mobile app exposes, including create Custom, create Multiplayer, Trophy Cabinet, and Help & Support.
- Kept existing route aliases intact to avoid disrupting mobile API references or deeper flow URLs.

## Remaining Gaps

- Mobile has in-screen segmented controls for Official vs Community inside Solo and Multiplayer; web has separate pages/links rather than the same tabbed interaction.
- Mobile Account combines identity, chess usernames, Solo progress, trophies, and support modal in one screen; web splits these across `/account`, `/profile`, `/connect`, and `/support`.
- Mobile custom creation is inline within the Side Quests screen; web now deep-links to the web builder but still routes through account custom controls.

## 2026-07-05 Navigation Shortcut Slice

| Mobile hamburger action | Website route | 2026-07-05 status |
| --- | --- | --- |
| `Create Custom Side Quest` | `/custom#custom-side-quest-builder` | Added a persistent top-nav action shortcut, preserving the signed-in builder route and signed-out sign-in redirect. |
| `Create Multiplayer Side Quest` | `/groupquests/create` | Added a persistent top-nav action shortcut, preserving the existing host-table builder route and signed-out sign-in redirect. |

Proof captured for this slice:

- Screenshots: `artifacts/sqc-parity-2026-07-05/desktop-home-nav-static.png` and `artifacts/sqc-parity-2026-07-05/mobile-home-nav-static.png`.
- Screenshot note: local Next dev serving `/` was blocked by a Clerk session-token redirect loop in the environment, so the screenshot proof uses the actual CSS and updated nav markup in a static Playwright render.
- Verification: `pnpm lint -- src/components/site-nav.tsx src/app/globals.css` passed with existing warnings only; `pnpm build` passed; `pnpm --dir apps/mobile typecheck` passed.
