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
