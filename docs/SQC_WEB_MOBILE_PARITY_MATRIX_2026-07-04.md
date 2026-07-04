# SQC Web/Mobile Parity Matrix - 2026-07-04

## Source of Truth

- Mobile entry point inspected: `apps/mobile/App.tsx`.
- Mobile primary tabs: `Home`, `Side Quests`, `Multiplayer Side Quests`, `Trophy Cabinet`, `Account`.
- Mobile hamburger additions: `Solo Side Quests`, `My Custom Side Quests`, `Create Custom Side Quest`, `Support & FAQ`, `Sign in / Account`.
- Website routes inspected: `src/app/page.tsx`, `src/components/site-nav.tsx`, and top-level aliases for `/solo`, `/custom`, `/community`, `/multiplayer`, `/account`, `/settings`, `/support`.

## Parity Matrix

| Product area | Mobile source label/screen | Web route/status | 2026-07-04 slice |
| --- | --- | --- | --- |
| Home entry | `Home` / today dashboard | `/` exists with active Solo, Multiplayer, Trophy Cabinet summaries | Added an app-map section that names the same top-level product areas and links to the matching web routes. |
| Solo | `Side Quests`, hamburger `Solo Side Quests` | `/solo` aliases `/challenges`; `/challenges` has official deck and links to community/multiplayer | Updated shared nav label from `Solo` to `Solo Side Quests`. |
| Custom | `My Custom Side Quests`, `Create Custom Side Quest` | `/custom` aliases `/account/custom-side-quests` | Updated shared nav label from `Custom` to `My Custom Side Quests`; app-map calls out build/publish. |
| Community | `Community Side Quests` inside Solo catalog | `/community` aliases `/challenges/community` | Updated shared nav label from `Community` to `Community Side Quests`; app-map makes this a Solo Side Quest community area. |
| Multiplayer | `Multiplayer Side Quests` | `/multiplayer` aliases `/groupquests` | Updated shared nav label from `Multiplayer` to `Multiplayer Side Quests`. |
| Trophy | `Trophy Cabinet` | `/trophy-cabinet` exists | Already aligned in nav; app-map keeps Trophy Cabinet in the mobile-style product map. |
| Account/profile | `Account`, `Sign in / Account` | `/account`, `/profile`, `/connect`; signed-out nav uses auth buttons | App-map links Account when signed in and Sign in / Account when signed out. |
| Settings/support | `Support & FAQ` in hamburger | `/support` exists; `/settings` exists | No route change in this slice; support remains a primary nav action. |

## Implemented Proof

- Changed the shared website top nav vocabulary to the mobile app labels.
- Added a home app-map panel so signed-in and signed-out users see the same product hierarchy the mobile app exposes.
- Kept existing route aliases intact to avoid disrupting mobile API references or deeper flow URLs.

## Remaining Gaps

- Mobile has in-screen segmented controls for Official vs Community inside Solo and Multiplayer; web has separate pages/links rather than the same tabbed interaction.
- Mobile Account combines identity, chess usernames, Solo progress, trophies, and support modal in one screen; web splits these across `/account`, `/profile`, `/connect`, and `/support`.
- Mobile custom creation is inline within the Side Quests screen; web routes through account custom controls.
