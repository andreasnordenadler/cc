# SQC Website-Mobile Navigation Parity Slice — 2026-07-04

Sprint window: 2026-07-04 12:40 Europe/Stockholm to 2026-07-06 12:40 Europe/Stockholm.

## Source-of-truth app surfaces

Mobile `apps/mobile/App.tsx` exposes these primary destinations:

| Mobile surface | Mobile label | Website status after slice |
| --- | --- | --- |
| `home` | Home | Top nav keeps `/` as Home. |
| `sideQuests` | Side Quests / Solo Side Quests | Top nav now labels this lane `Solo` and points to `/solo`, an alias of `/challenges`. |
| `sideQuests` intent `my-custom` / `create-custom` | My Custom Side Quests / Create Custom Side Quest | Top nav now exposes `Custom` and `/custom`, an alias of `/account/custom-side-quests`. |
| Community Solo browse | Community Solo Side Quests | Top nav now exposes `Community` and `/community`, an alias of `/challenges/community`. |
| `multiplayerSideQuests` | Multiplayer Side Quests | Top nav now labels this lane `Multiplayer` and points to `/multiplayer`, an alias of `/groupquests`. |
| `coatOfArms` | Trophy Cabinet | Top nav now uses the mobile label `Trophy Cabinet` and points to `/trophy-cabinet`, an alias of `/badges`. |
| `account` | Account / My Account | Signed-in nav action now says `Account`; profile/connect pages highlight the same account action. |
| Help modal/menu | Help & Support | Nav action now exposes `Support`; `/settings` aliases `/support` for settings/support entry parity. |
| `officialLeaderboards` | Official Leaderboards | `/leaderboards` aliases the existing `/scoreboard` official leaderboard hub. |

## Implemented proof

- Preserved existing route URLs and added mobile-label top-level aliases instead of moving pages.
- Updated the website primary nav hierarchy to lead with app-equivalent lanes: Home, Solo, Custom, Community, Multiplayer, Trophy Cabinet.
- Kept website styling intact and made phone-width nav horizontally scrollable so the additional app-equivalent lanes do not wrap into a tall menu.
- Updated active nav state on the main Solo, Custom, Community, Multiplayer, and Trophy Cabinet pages.

## Verification

- `pnpm lint -- src/components/site-nav.tsx src/app/challenges/page.tsx src/app/challenges/community/page.tsx src/app/account/custom-side-quests/page.tsx src/app/groupquests/page.tsx src/app/badges/page.tsx src/app/solo/page.tsx src/app/custom/page.tsx src/app/community/page.tsx src/app/multiplayer/page.tsx src/app/trophy-cabinet/page.tsx src/app/settings/page.tsx src/app/leaderboards/page.tsx` passed with the pre-existing `<img>` nav-logo warning.
- `pnpm build` passed after the alias pages were adjusted to keep Next route config exports local.
- Local route smoke on `http://localhost:3017`: `/`, `/solo`, `/community`, `/multiplayer`, `/trophy-cabinet`, `/leaderboards`, and `/settings` returned 200; `/custom` returned 307 to `/sign-in` as expected for signed-out users.
- Screenshots captured:
  - `artifacts/sqc-nav-parity-2026-07-04/solo-desktop.png`
  - `artifacts/sqc-nav-parity-2026-07-04/community-mobile.png`

## Remaining parity candidates

- Add mobile-style menu shortcuts inside signed-in account pages for `Create Custom Side Quest`, `Create Multiplayer Side Quest`, and `Help & Support`.
- Review whether `/scoreboard` should be renamed in user-facing copy to `Official Leaderboards` everywhere, now that `/leaderboards` exists.
- Continue route-level screenshot checks on authenticated account/custom flows when a test account is available.
