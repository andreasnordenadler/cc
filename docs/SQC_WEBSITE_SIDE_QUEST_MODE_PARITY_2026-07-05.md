# SQC website Side Quest mode parity - 2026-07-05

Source of truth: `apps/mobile/App.tsx`.

This cron slice keeps the mobile app as the product source and narrows the website parity work to the Side Quest family. Existing unrelated user changes in `ROADMAP.md` and `docs/research/SQC_MONETIZATION_RESEARCH_RECOMMENDATIONS_2026-07-01.md` were not touched.

## Parity matrix

| Mobile destination | Mobile source | Website coverage after slice | Status |
| --- | --- | --- | --- |
| Home | bottom tab `Home`, hamburger `Home` | `/`, primary nav, mobile-web app menu | Covered |
| Solo Side Quests | tab `Side Quests`, hamburger `Solo Side Quests`, official catalog mode | `/solo` / `/challenges` includes a Side Quest mode switcher and mobile-web app menu entry | Improved |
| Community Side Quests | Solo catalog community/discover mode | `/community` / `/challenges/community` includes the same mode switcher and mobile-web app menu entry | Improved |
| My Custom Side Quests | hamburger `My Custom Side Quests`, custom catalog mine mode | `/custom` / `/account/custom-side-quests` includes the same mode switcher and mobile-web app menu entry | Improved |
| Create Custom Side Quest | hamburger `Create Custom Side Quest`, `create-custom` intent | switcher and mobile-web app menu deep-link to `/custom#custom-side-quest-builder` | Improved |
| Multiplayer Side Quests | tab and hamburger `Multiplayer Side Quests` | `/multiplayer` / `/groupquests`; mobile-web app menu entry added this slice | Improved |
| Trophy Cabinet | tab and hamburger `Trophy Cabinet` | `/trophy-cabinet`; unchanged this slice | Covered |
| Account / profile | tab `Account`, hamburger `My Account` | `/account`, `/profile`, `/connect`, `/settings`; account and settings are in the mobile-web app menu | Improved |
| Help & Support | hamburger `Help & Support`, account support modal | `/support`; mobile-web app menu entry added this slice | Improved |

## Implemented proof

- Added `SideQuestModeSwitcher`, a shared route-level switcher for Official, Community, My Custom, and Create Custom Side Quest modes.
- Placed it on `/solo`, `/community`, and `/custom` so the web Side Quest family mirrors the mobile app's in-shell catalog modes without changing existing URLs.
- Added responsive styles: four columns on desktop, two on tablet, and a horizontal scroll rail on phone-width web.
- Added a mobile-web app menu to `SiteNav` that mirrors the mobile app hamburger destinations: Home, Solo, Community, My Custom, Create Custom, Multiplayer, Create Multiplayer, Trophy Cabinet, Official Leaderboards, Account, Settings, and Help & Support.

## Verification

- Desktop screenshot: `artifacts/sqc-side-quest-mode-parity-2026-07-05/solo-desktop-static.png`.
- Mobile-web screenshot: `artifacts/sqc-side-quest-mode-parity-2026-07-05/solo-mobile-web-static.png`.
- Desktop web screenshot after the app-menu slice: `artifacts/sqc-side-quest-mode-parity-2026-07-05/solo-desktop-web-menu.png`.
- Mobile-web menu screenshot: `artifacts/sqc-side-quest-mode-parity-2026-07-05/mobile-web-menu-static.png`.
- Screenshot note: earlier switcher screenshots used a static Playwright render because local Next dev was blocked by a Clerk session-token redirect loop. The app-menu slice screenshots above were captured from local Next dev at `/solo`.
- `pnpm lint -- src/components/side-quest-mode-switcher.tsx src/app/challenges/page.tsx src/app/challenges/community/page.tsx src/app/account/custom-side-quests/page.tsx src/app/globals.css` passed; ESLint warned that `src/app/globals.css` is ignored by the config.
- `pnpm lint -- src/components/site-nav.tsx src/app/globals.css` passed; ESLint warned that `src/app/globals.css` is ignored by the config.
- `pnpm --dir apps/mobile typecheck` passed.
- `pnpm build` passed with the existing Next workspace-root warning.

## Remaining gaps

- The website still uses separate routes where the mobile app uses in-shell tab and intent state.
- Multiplayer has a similar Official/Community segmented catalog on mobile; website route coverage exists, but the browse UI is not identical.

## 2026-07-05 continuation - signed-out Account entry route parity

Source check: mobile `AccountTrackerDashboard` stays a first-class Account screen when signed out. The web `/account` route already mirrors that screen, but two home/settings shortcuts still bypassed it and went straight to Clerk sign-in.

| Mobile Account entry | Mobile source | Website coverage after slice | Status |
| --- | --- | --- | --- |
| Account tab while signed out | bottom tab `Account` opens Account screen | home App Map `Sign in / Account` now links to `/account` | Improved |
| Settings account action while signed out | account/settings support routes keep Account as the readiness hub | Settings primary CTA now opens `/account` instead of bypassing the hub | Improved |
| Account sign-in action | signed-out Account screen contains the actual sign-in CTA | `/account` remains the single signed-out Account handoff before auth | Covered |

Implemented proof:

- Updated the Home App Map signed-out `Sign in / Account` tile to enter `/account`.
- Updated the Settings signed-out primary action to `Open Sign in / Account`, also entering `/account`.

Verification:

- `pnpm lint -- src/app/page.tsx src/app/settings/page.tsx` passed.
- `pnpm --dir apps/mobile typecheck` passed.
- `pnpm build` passed with the existing Next workspace-root warning.
- Desktop screenshot: `artifacts/sqc-account-entry-route-parity-2026-07-05/home-desktop.png`.
- Mobile-web screenshot: `artifacts/sqc-account-entry-route-parity-2026-07-05/home-mobile-web.png`.

## 2026-07-05 continuation - signed-out Multiplayer browse parity

Source check: `apps/mobile/App.tsx` opens `MultiplayerSideQuestsScreen` with `multiplayerCatalogTab` defaulting to `official`, a two-way Official/Community switch, signed-out official/community browse rows, and create/private-invite actions after the catalog lanes.

| Mobile Multiplayer surface | Mobile source | Website coverage after slice | Status |
| --- | --- | --- | --- |
| Official Multiplayer Side Quests | `multiplayerCatalogTab === "official"` | `/multiplayer` now fetches public group quests for signed-out visitors and renders official rows before sign-in | Improved |
| Community Multiplayer Side Quests | `multiplayerCatalogTab === "community"` | `/multiplayer` now renders public community rows before sign-in plus `/groupquests/public` filters | Improved |
| Create Multiplayer Side Quest | mobile create modal and hamburger create action | `/groupquests/create` remains exposed from the switcher and logged-out action cards | Covered |
| My active Multiplayer Side Quests | mobile community active/joined/hosted lane | `/multiplayer` keeps the signed-in active/joined/hosted overview | Covered |

Implemented proof:

- Updated `MultiplayerModeSwitcher` ordering and labels to match the mobile mental model: Official, Community, Create, then My active.
- Moved public Multiplayer listing fetches outside the signed-in-only branch so signed-out web visitors can inspect official and community public tables, matching the mobile signed-out browse behavior.
- Added a signed-out `/multiplayer` browse section with separate Official SQC and Community lanes before private invite and create actions.

Verification:

- `pnpm lint -- src/components/multiplayer-mode-switcher.tsx src/app/groupquests/page.tsx` passed.
- `pnpm --dir apps/mobile typecheck` passed.
- `pnpm build` passed with the existing Next workspace-root warning.
- Desktop screenshot: `artifacts/sqc-multiplayer-signedout-parity-2026-07-05/multiplayer-desktop.png`.
- Mobile-web screenshot: `artifacts/sqc-multiplayer-signedout-parity-2026-07-05/multiplayer-mobile-web.png`.

## 2026-07-05 continuation - signed-out Account entry parity

Source check: mobile `AccountTrackerDashboard` keeps Account as a first-class screen before authentication, with the copy "Sign in, then go make terrible chess decisions.", a primary sign-in action, a Browse Side Quests action, and an Account sync checklist.

| Mobile Account surface | Mobile source | Website coverage after slice | Status |
| --- | --- | --- | --- |
| Account tab while signed out | bottom tab `Account` opens Account screen | `/account` now renders a signed-out Account screen instead of redirecting immediately to `/sign-in` | Improved |
| Sign-in/account hamburger item | `Sign in / Account` opens Account screen | web mobile-app menu now links signed-out `Sign in / Account` to `/account` | Improved |
| Bottom Account tab | bottom tab `Account` opens Account screen | web mobile dock Account now links signed-out users to `/account` | Improved |
| Browse before sign-in | mobile account screen secondary `Browse Side Quests` action | signed-out `/account` includes `Browse Side Quests` and an account sync checklist | Improved |

Implemented proof:

- Removed the signed-out `/account` hard redirect so the web Account route behaves like the mobile Account tab.
- Added a compact signed-out Account screen with mobile-matched headline, sign-in CTA, browse CTA, and sync/readiness checklist.
- Updated `SiteNav` account destinations so the mobile-web menu and bottom dock both enter `/account` before auth.

Verification:

- `pnpm lint -- src/components/site-nav.tsx src/app/account/page.tsx` passed.
- `pnpm --dir apps/mobile typecheck` passed.
- `pnpm build` passed with the existing Next workspace-root warning.
- Desktop screenshot: `artifacts/sqc-account-signedout-parity-2026-07-05/account-desktop-static.png`.
- Mobile-web screenshot: `artifacts/sqc-account-signedout-parity-2026-07-05/account-mobile-web-static.png`.
- Screenshot note: local Next `/account` rendering is still blocked by the existing Clerk session-token redirect loop, so these screenshots use a static Playwright render of the changed Account markup and production CSS.

## 2026-07-06 continuation - mobile tab dock parity

Source check: mobile `apps/mobile/App.tsx` defines the bottom app tabs as `Home`, `Side Quests`, `Multiplayer Side Quests`, `Trophy Cabinet`, and `Account`. The website had the matching routes and hamburger/menu entry points, but phone-width web still lacked the app-like bottom tab structure.

| Mobile tab | Mobile source | Website coverage after slice | Status |
| --- | --- | --- | --- |
| Home | `TABS` id `home` | fixed phone-width web dock links to `/` and marks Home active | Improved |
| Side Quests | `TABS` id `sideQuests` | fixed phone-width web dock links to `/solo` and marks Solo/Side Quest routes active | Improved |
| Multiplayer Side Quests | `TABS` id `multiplayerSideQuests` | fixed phone-width web dock links to `/multiplayer` and marks Multiplayer routes active | Improved |
| Trophy Cabinet | `TABS` id `coatOfArms` | fixed phone-width web dock links to `/trophy-cabinet` and marks trophy/badge routes active | Improved |
| Account | `TABS` id `account` | fixed phone-width web dock links to `/account`, including signed-out Account entry parity | Improved |

Implemented proof:

- Added a phone-width `mobile-tab-dock` to `SiteNav` with the same five primary app tabs and active state mapping.
- Kept desktop navigation unchanged; the dock only appears under the existing phone-width media query and uses the existing mobile bottom padding.
- Reused existing SQC image assets for Side Quests and Trophy Cabinet, with compact text glyphs for Home, Multiplayer, and Account.

Verification:

- `pnpm lint -- src/components/site-nav.tsx src/app/globals.css` passed; ESLint warned that `src/app/globals.css` is ignored by the config.
- `pnpm --dir apps/mobile typecheck` passed.
- `pnpm build` passed with the existing Next workspace-root warning.
- Desktop screenshot: `artifacts/sqc-mobile-tab-dock-parity-2026-07-06/home-desktop.png`.
- Mobile-web screenshot: `artifacts/sqc-mobile-tab-dock-parity-2026-07-06/home-mobile-viewport-tab-dock.png`.
- Active Side Quest tab screenshot: `artifacts/sqc-mobile-tab-dock-parity-2026-07-06/solo-mobile-viewport-active-tab.png`.

## 2026-07-06 continuation - top-level route visibility parity

Source check: mobile `apps/mobile/App.tsx` still centers the app around `Home`, `Side Quests`, `Multiplayer Side Quests`, `Trophy Cabinet`, and `Account`, with menu actions for custom creation, multiplayer creation, and support. The website already had route coverage for Solo, Custom, Community, Multiplayer, Account, Settings, Support, and Official Leaderboards, but several parity destinations were only discoverable through `More` or absent from the app-style web menu.

| Mobile / parity destination | Website coverage after slice | Status |
| --- | --- | --- |
| Solo Side Quests | Primary nav links directly to `/solo` as `Solo` | Covered |
| My Custom Side Quests | Primary nav links directly to `/custom` as `Custom`; app-style menu includes `My Custom Side Quests` | Improved |
| Community Side Quests | Primary nav links directly to `/community`; app-style menu includes `Community Side Quests` | Improved |
| Multiplayer Side Quests | Primary nav links directly to `/multiplayer` as `Multiplayer`; app-style menu remains direct | Covered |
| Official Leaderboards | Primary nav links directly to `/leaderboards`; app-style menu includes `Official Leaderboards` | Improved |
| Trophy Cabinet | Primary nav and phone dock keep `/trophy-cabinet` | Covered |
| Account / Settings / Support | App-style menu now includes `Settings`, `Sign in / Account` or `My Account`, and `Help & Support` | Improved |

Implemented proof:

- Promoted `Custom`, `Community`, and `Official Leaderboards` into the desktop primary nav so mandatory parity lanes are visible without opening `More`.
- Expanded the mobile-web app menu to include Community, Official Leaderboards, and Settings alongside the existing mobile app menu destinations.
- Kept the five-item phone bottom dock unchanged because it already matches the mobile app tab bar.

Verification:

- `pnpm lint -- src/components/site-nav.tsx` passed.
- `pnpm --dir apps/mobile typecheck` passed.
- `pnpm build` passed with the existing Next workspace-root warning.
- Desktop screenshot: `artifacts/sqc-top-level-route-visibility-parity-2026-07-06/solo-desktop-primary-nav.png`.
- Mobile-web app-menu screenshot: `artifacts/sqc-top-level-route-visibility-parity-2026-07-06/solo-mobile-app-menu-expanded.png`.

## 2026-07-06 continuation - Side Quest tab active-state parity

Source check: mobile `apps/mobile/App.tsx` keeps Solo, Community discover, My Custom, and Create Custom inside the single `sideQuests` tab via `pendingSideQuestCatalogIntent`. The website already had route coverage and switchers for those modes, but the phone-width web bottom dock only marked `Side Quests` active on Solo/official routes.

| Mobile Side Quest mode | Mobile source | Website coverage after slice | Status |
| --- | --- | --- | --- |
| Official Solo Side Quests | `activeTab === "sideQuests"` with official/default catalog | `/solo`, `/challenges`, `/random`, and `/path` keep the Side Quests dock tab active | Covered |
| Community Side Quests | `pendingSideQuestCatalogIntent` / community discover mode inside `sideQuests` | `/community` and `/challenges/community` now keep the Side Quests dock tab active | Improved |
| My Custom Side Quests | hamburger action sets `activeTab: "sideQuests"` and `pendingSideQuestCatalogIntent: "my-custom"` | `/custom` and `/account/custom-side-quests` now keep the Side Quests dock tab active | Improved |
| Create Custom Side Quest | hamburger action sets `activeTab: "sideQuests"` and `pendingSideQuestCatalogIntent: "create-custom"` | `/custom#custom-side-quest-builder` remains in the Side Quests family and shares the same dock active state | Improved |

Implemented proof:

- Updated the web phone dock active-state mapping so `Side Quests` is selected for Solo, Community, and Custom website routes, matching the mobile app's single Side Quest shell tab.
- Left desktop navigation destinations unchanged.

Verification:

- `pnpm lint -- src/components/site-nav.tsx` passed.
- `pnpm --dir apps/mobile typecheck` passed.
- `pnpm build` passed with the existing Next workspace-root warning.
- Desktop screenshot: `artifacts/sqc-sidequest-tab-active-parity-2026-07-06/community-desktop.png`.
- Mobile-web Community screenshot: `artifacts/sqc-sidequest-tab-active-parity-2026-07-06/community-mobile-sidequest-tab-active.png`.
- Mobile-web Custom screenshot: `artifacts/sqc-sidequest-tab-active-parity-2026-07-06/custom-mobile-sidequest-tab-active.png`.
- Screenshot note: local Next route rendering is still blocked by the existing Clerk session-token redirect loop, so these screenshots use a static Playwright render of the changed dock state; both mobile captures reported the active dock item as `Side Quests`.

## 2026-07-06 continuation - Multiplayer leaderboard dock parity

Source check: mobile `apps/mobile/App.tsx` defines the bottom tab family as Home, Side Quests, Multiplayer Side Quests, Trophy Cabinet, and Account. It also has an `officialLeaderboards` shell screen for official multiplayer results, but no separate bottom tab for leaderboards.

| Mobile top-level area | Mobile source | Website route coverage after slice | Status |
| --- | --- | --- | --- |
| Home / onboarding entry | `activeTab === "home"` / `TodayDashboard` | `/` keeps the Home dock item active | Covered |
| Solo, Community, Custom | `activeTab === "sideQuests"` plus `pendingSideQuestCatalogIntent` | `/solo`, `/community`, `/custom`, `/challenges`, `/random`, `/path`, and `/account/custom-side-quests` keep the Side Quests dock item active | Covered |
| Multiplayer Side Quests | `activeTab === "multiplayerSideQuests"` / `MultiplayerSideQuestsScreen` | `/multiplayer`, `/groupquests`, `/groupquests/public`, `/groupquests/create`, and detail/edit pages keep the Multiplayer dock item active | Covered |
| Official multiplayer leaderboards | `activeTab === "officialLeaderboards"` / `OfficialMultiplayerLeaderboardsScreen` | `/leaderboards` and `/scoreboard` now keep the Multiplayer dock item active instead of leaving the phone dock with no selected tab | Improved |
| Trophy Cabinet | `activeTab === "coatOfArms"` | `/trophy-cabinet` and `/badges` keep the Trophy Cabinet dock item active | Covered |
| Account / profile / settings | `activeTab === "account"` / `AccountTrackerDashboard` | `/account`, `/profile`, `/connect`, and `/settings` keep the Account dock item active | Covered |
| Support | hamburger `Help & Support` opens support flow | `/support` remains reachable from the web app menu; no bottom dock tab, matching mobile's non-tab support entry | Covered |

Implemented proof:

- Updated the web phone dock active-state mapping so Official Leaderboards and Scoreboard remain inside the Multiplayer Side Quests top-level tab family.
- Left desktop navigation destinations unchanged; the Official Leaderboards top nav item still highlights independently on desktop.

Verification:

- `pnpm lint -- src/components/site-nav.tsx` passed.
- `pnpm --dir apps/mobile typecheck` passed.
- `pnpm build` passed with the existing Next workspace-root warning.
- Desktop screenshot: `artifacts/sqc-multiplayer-leaderboard-dock-parity-2026-07-06/leaderboards-desktop.png`.
- Mobile-web Leaderboards screenshot: `artifacts/sqc-multiplayer-leaderboard-dock-parity-2026-07-06/leaderboards-mobile-multiplayer-tab-active.png`.
- Screenshot note: the local route rendered and the Playwright assertion confirmed the mobile dock active item as `Multiplayer Side Quests`; the dev server still logged the existing Clerk development-key session-token redirect warning.

## 2026-07-06 continuation - Community detail nav parity

Source check: mobile `apps/mobile/App.tsx` renders Community Solo Side Quest discovery and detail handoff inside `activeTab === "sideQuests"` via `QuestBoardDashboard`. The website community detail route already used the Side Quest shell, but desktop navigation highlighted the generic official challenge family instead of Community.

| Mobile Side Quest surface | Mobile source | Website route coverage after slice | Status |
| --- | --- | --- | --- |
| Community catalog | `sideQuestCatalogTab === "community"` / discover mode | `/community` and `/challenges/community` keep Community selected | Covered |
| Community detail | community detail opened from the Side Quest shell | `/challenges/community/[id]` now keeps Community selected in the desktop nav and Side Quests selected in the phone dock | Improved |
| Missing community detail | same Community Side Quest family fallback | `/challenges/community/[id]` not-found now keeps Community selected instead of falling back to official challenges | Improved |

Implemented proof:

- Updated the Community Solo Side Quest detail and not-found pages to pass `active="community"` into `SiteNav`.
- Kept official `/challenges/[id]` and dare routes unchanged so official Solo Side Quest details still highlight the Solo/Side Quests family.

Verification:

- `pnpm lint -- 'src/app/challenges/community/[id]/page.tsx' 'src/app/challenges/community/[id]/not-found.tsx'` passed.
- `pnpm --dir apps/mobile typecheck` passed.
- `pnpm build` passed with the existing Next workspace-root warning.
- Desktop screenshot: `artifacts/sqc-community-detail-nav-parity-2026-07-06/community-detail-desktop-static.png`.
- Mobile-web screenshot: `artifacts/sqc-community-detail-nav-parity-2026-07-06/community-detail-mobile-static.png`.
- Screenshot note: screenshots use the Community detail not-found route because the populated detail view depends on live Clerk-backed public custom quest data; Playwright assertions confirmed active nav labels `Community` and `Side Quests`.
