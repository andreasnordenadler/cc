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
