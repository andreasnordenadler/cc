# SQC Website/Mobile Parity Proof - 2026-07-05

## Source of truth inspected

- Mobile app: `apps/mobile/App.tsx`
- Website nav: `src/components/site-nav.tsx`
- Website entry routes: `src/app/page.tsx`, `src/app/challenges/page.tsx`, `src/app/solo/page.tsx`, `src/app/community/page.tsx`, `src/app/custom/page.tsx`, `src/app/multiplayer/page.tsx`, `src/app/groupquests/page.tsx`, `src/app/account/page.tsx`, `src/app/settings/page.tsx`, `src/app/support/page.tsx`

## Mobile app top-level map

| Mobile surface | Mobile label | Web parity route | Status |
| --- | --- | --- | --- |
| Bottom tab | Home | `/` | Present |
| Bottom tab | Side Quests | `/solo` | Present, aliases `/challenges` |
| Hamburger item | Solo Side Quests | `/solo` | Present |
| Hamburger item | My Custom Side Quests | `/custom` | Present |
| Hamburger item | Create Custom Side Quest | `/custom#custom-side-quest-builder` | Present |
| Bottom tab | Multiplayer Side Quests | `/multiplayer` | Present, aliases `/groupquests` |
| Hamburger item | Create Multiplayer Side Quest | `/groupquests/create` | Present |
| Bottom tab | Trophy Cabinet | `/trophy-cabinet` | Present |
| Bottom tab | Account | `/account` or `/sign-in` | Present |
| Hamburger item | Help & Support | `/support` | Present |
| Account-adjacent web route | Settings | `/settings` | Present |
| Web-only catalog split | Community Side Quests | `/community` | Present, mirrors mobile Side Quest catalog intent |
| Web-only multiplayer split | Official Leaderboards | `/leaderboards` | Present, mirrors mobile multiplayer official catalog tab |

## Slice completed

- Updated home primary CTAs and fallback links from older top-level aliases (`/challenges`, `/groupquests`) to canonical mobile-parity routes (`/solo`, `/multiplayer`).
- Updated Solo hub cross-links to `Community` and `Multiplayer` from older aliases.
- Updated remaining visible browse/back/account links to prefer the canonical mobile-parity entry routes: `/solo`, `/community`, `/custom`, and `/multiplayer`.
- Updated the Community Solo discovery form to submit to `/community`, keeping filter/search URLs on the parity route.
- Left deep route URLs intact where they identify concrete records, public community detail pages, or existing API revalidation paths.

## 2026-07-05 account/menu parity slice

- Re-checked mobile source labels in `apps/mobile/App.tsx`: bottom tabs remain `Home`, `Side Quests`, `Multiplayer Side Quests`, `Trophy Cabinet`, `Account`; hamburger order is `Home`, `Solo Side Quests`, `Multiplayer Side Quests`, `Trophy Cabinet`, `My Custom Side Quests`, `Create Custom Side Quest`, `Create Multiplayer Side Quest`, `My Account`/`Sign in / Account`, `Help & Support`.
- Updated the website mobile menu to follow that mobile hamburger order first, with compact glyph badges so the menu reads closer to the native app list.
- Updated the signed-in web account shortcut panel to follow the same mobile hamburger order first, then separated web companion destinations (`Community Side Quests`, `Official Leaderboards`, `Settings`).
- Swapped remaining account-level browse links from alias routes to canonical mobile-parity entries (`/solo`, `/custom`, `/multiplayer`) while keeping concrete detail URLs such as `/challenges/[id]` and `/groupquests/[id]` intact.
- Screenshot proof: `artifacts/sqc-parity-2026-07-05-account-menu/desktop-home-nav.png` and `artifacts/sqc-parity-2026-07-05-account-menu/mobile-home-menu-open.png`.
- Verification: `pnpm lint -- src/components/site-nav.tsx src/app/account/page.tsx src/app/globals.css` passed with the expected CSS ignore warning; `pnpm exec tsc --noEmit --pretty false` passed; `pnpm --dir apps/mobile exec tsc --noEmit --pretty false` passed; `pnpm build` passed.

## Remaining high-impact parity item

Bring the signed-in website Account home closer to the mobile Account tab by grouping chess username readiness, active Solo proof, Custom Side Quest management, Multiplayer participation, Settings, and Help & Support in the same order as the mobile account/support flow.

## 2026-07-05 profile/account language slice

- Re-checked the mobile Account/profile language in `apps/mobile/App.tsx`: the native account flow talks about public chess usernames, proof checks, Account, Side Quests, Trophy Cabinet, and Help & Support without exposing the older `runner`/`run` framing in top-level profile setup.
- Updated `/profile` visible copy to use player-facing `Player profile`, `Player name`, `Profile line`, `Ready for proof`, and `Side Quest Chess can check public games` language.
- Preserved the existing form field names and user-metadata helpers, since `runnerDisplayName` / `runnerBio` remain internal storage/API concepts.
- Left the unrelated untracked research note `docs/research/SQC_MONETIZATION_RESEARCH_RECOMMENDATIONS_2026-07-01.md` untouched.

Proof:

- Desktop screenshot: `artifacts/sqc-profile-language-parity-2026-07-05/profile-desktop.png`.
- Mobile-web screenshot: `artifacts/sqc-profile-language-parity-2026-07-05/profile-mobile-web.png`.
- `pnpm lint -- src/app/profile/page.tsx` passed.
- `pnpm exec tsc --noEmit --pretty false` passed.
- `pnpm --dir apps/mobile exec tsc --noEmit --pretty false` passed.
- `pnpm build` passed with the existing Next workspace-root warning.
- Screenshot server `pnpm exec next start -p 3047` rendered `/profile`; it also emitted the existing Clerk session-token redirect-loop warning during anonymous loads.

## 2026-07-05 home/onboarding entry slice

- Re-checked the mobile Home source in `apps/mobile/App.tsx`: the first-run choice ladder exposes `Go on a Solo Side Quest`, `Join a Multiplayer Side Quest`, `Surprise me with a random Solo Side Quest`, and `Find your own path`.
- Added a compact website home quick-start band above the signed-out explainer and app map so desktop and mobile web present those same four entry decisions before the larger route catalog.
- Kept the existing hero, app map, signed-in proof controls, and route aliases intact; this slice only changes the home entry hierarchy and responsive CSS.
- Screenshot proof captured from local Next dev: `artifacts/sqc-home-entry-parity-2026-07-05/desktop-home-entry.png` and `artifacts/sqc-home-entry-parity-2026-07-05/mobile-home-entry.png`.

## 2026-07-05 official leaderboard dock slice

- Re-checked the mobile navigation source in `apps/mobile/App.tsx`: visible native bottom tabs are `Home`, `Side Quests`, `Multiplayer Side Quests`, `Trophy Cabinet`, and `Account`; the same `AppTab` union also includes `officialLeaderboards`, rendered by `OfficialMultiplayerLeaderboardsScreen`.
- Website route coverage was already present at `/leaderboards`, but mobile web only exposed it through top nav/menu. Added an `Official Leaderboards` item to the mobile-web dock so the official competitive surface is reachable beside Multiplayer and Trophy Cabinet on small screens.
- Adjusted the mobile-web dock from five to six stable columns and tightened label sizing so the new route does not crowd the existing core tabs.
- Screenshot proof: `artifacts/sqc-official-leaderboard-dock-parity-2026-07-05/home-desktop.png`, `artifacts/sqc-official-leaderboard-dock-parity-2026-07-05/home-mobile-dock.png`, and `artifacts/sqc-official-leaderboard-dock-parity-2026-07-05/leaderboards-mobile-dock-active.png`.
- Verification: `pnpm lint -- src/components/site-nav.tsx src/app/globals.css` passed with the existing CSS ignore warning; `pnpm exec tsc --noEmit --pretty false` passed; `pnpm --dir apps/mobile exec tsc --noEmit --pretty false` passed; `pnpm build` passed with the existing Next workspace-root warning.
- Remaining parity nuance: native Android still does not list `Official Leaderboards` in the five visible `TABS` array, so this website slice improves discoverability for the route while mobile product can still decide whether to promote that screen into native bottom navigation.

## 2026-07-06 account/support parity slice

- Re-checked mobile `TABS`, hamburger order, `AccountShell`, and `HelpSupportModal` topics in `apps/mobile/App.tsx`.
- Kept the website mobile dock aligned with the native five visible tabs: `Home`, `Side Quests`, `Multiplayer Side Quests`, `Trophy Cabinet`, and `Account`.
- Added a `Trophy Cabinet` destination into the signed-in web Account flow list so Account now surfaces Solo, Custom, Multiplayer, Trophy Cabinet, Settings, and Help & Support in one mobile-like dashboard path.
- Renamed the web support route heading/metadata from `Support & privacy` to `Help & Support` while keeping privacy details on the page, matching the mobile hamburger label.
- Left the unrelated untracked research note `docs/research/SQC_MONETIZATION_RESEARCH_RECOMMENDATIONS_2026-07-01.md` untouched.

Proof:

- Mobile source: `apps/mobile/App.tsx` lines around `TABS`, `GlobalHamburgerMenu`, `AccountShell`, and support topics.
- Website routes: `src/components/site-nav.tsx`, `src/app/account/page.tsx`, `src/app/support/page.tsx`, `src/app/settings/page.tsx`, `src/app/page.tsx`, `src/app/solo/page.tsx`, `src/app/multiplayer/page.tsx`.
- Screenshot proof: `artifacts/sqc-account-support-parity-2026-07-06/support-desktop.png`, `artifacts/sqc-account-support-parity-2026-07-06/support-mobile-web.png`, and `artifacts/sqc-account-support-parity-2026-07-06/account-mobile-signed-out.png`.
- Verification: `pnpm lint -- src/app/account/page.tsx src/app/support/page.tsx` passed; `pnpm exec tsc --noEmit --pretty false` passed; `pnpm --dir apps/mobile exec tsc --noEmit --pretty false` passed; `pnpm build` passed with the existing Next workspace-root warning.
- Screenshot limitation: signed-in Account row order was verified by code and build, but screenshot capture used the signed-out Account state because no authenticated browser session was available.

## 2026-07-06 settings/support label parity slice

- Re-checked native `TABS`, `GlobalHamburgerMenu`, `AccountShell`, `HelpSupportModal`, and `OfficialMultiplayerLeaderboardsScreen` in `apps/mobile/App.tsx`.
- Confirmed the current web route map still covers the prioritized entry points: `/solo`, `/custom`, `/community`, `/multiplayer`, `/leaderboards`, `/account`, `/profile`, `/settings`, `/support`, and `/`.
- Kept the mobile-web dock unchanged because it matches the five visible native bottom tabs; `Official Leaderboards` remains available from top nav/menu and the Multiplayer route, matching its internal mobile screen status.
- Tightened the remaining top-level support label drift: `/settings` now calls the support destination `Help & Support`, and `/terms` links to `/support` with the same label instead of the older `Support & privacy` copy.
- Left the unrelated untracked research note `docs/research/SQC_MONETIZATION_RESEARCH_RECOMMENDATIONS_2026-07-01.md` untouched.

Proof:

- Screenshot proof: `artifacts/sqc-settings-support-label-parity-2026-07-06/settings-desktop.png`, `artifacts/sqc-settings-support-label-parity-2026-07-06/settings-mobile-web.png`, `artifacts/sqc-settings-support-label-parity-2026-07-06/terms-desktop.png`, and `artifacts/sqc-settings-support-label-parity-2026-07-06/terms-mobile-web.png`.
- Text sanity check on `/settings` and `/terms`: both pages contain `Help & Support`; neither contains the stale `Support & privacy` or `Support and privacy` label.
- Verification: `pnpm lint -- src/app/settings/page.tsx src/app/terms/page.tsx` passed; `pnpm exec tsc --noEmit --pretty false` passed; `pnpm --dir apps/mobile exec tsc --noEmit --pretty false` passed; `pnpm build` passed with the existing Next workspace-root warning.
- Screenshot server: `pnpm exec next start -p 3056` after build.

## 2026-07-06 top-level copy parity slice

- Re-checked `apps/mobile/App.tsx` for the current top-level labels: Home, Solo Side Quests, Multiplayer Side Quests, Trophy Cabinet, Account, Help & Support, and player-facing account language.
- Updated top-level web entry copy on Home, Account, Profile, Settings, Connect, Sign in, Sign up, Help & Support, Result, not-found, Public Multiplayer discovery, Official Leaderboards, and the shared Multiplayer mode switcher/invite form.
- Replaced remaining entry-level `Multiplayer table`/`public tables`/`runner profile` phrasing with `Multiplayer Side Quest`, `public Multiplayer Side Quests`, and `player profile` language while leaving implementation names, route aliases, CSS classes, and deeper detail components untouched.
- Left the unrelated untracked research note `docs/research/SQC_MONETIZATION_RESEARCH_RECOMMENDATIONS_2026-07-01.md` untouched.

Proof:

- Desktop screenshots: `artifacts/sqc-top-level-copy-parity-2026-07-06/home-desktop.png`, `artifacts/sqc-top-level-copy-parity-2026-07-06/leaderboards-desktop.png`.
- Mobile-web screenshots: `artifacts/sqc-top-level-copy-parity-2026-07-06/public-multiplayer-mobile.png`, `artifacts/sqc-top-level-copy-parity-2026-07-06/support-mobile.png`.
- Text sanity check confirmed the touched top-level files now expose `Multiplayer Side Quests`, `Browse public Multiplayer Side Quests`, `Host a shared quest`, `Separate scored quests`, and `player profile` copy.
- Verification: `pnpm lint -- src/app/page.tsx src/app/not-found.tsx src/app/support/page.tsx src/app/scoreboard/page.tsx src/app/account/page.tsx src/app/profile/page.tsx src/app/settings/page.tsx src/app/groupquests/public/page.tsx src/app/result/page.tsx src/app/connect/page.tsx 'src/app/sign-in/[[...sign-in]]/page.tsx' 'src/app/sign-up/[[...sign-up]]/page.tsx' src/components/multiplayer-mode-switcher.tsx src/components/group-quest-invite-key-join.tsx` passed; `pnpm exec tsc --noEmit --pretty false` passed; `pnpm --dir apps/mobile exec tsc --noEmit --pretty false` passed; `pnpm build` passed with the existing Next workspace-root warning.
- Screenshot server: `pnpm exec next start -p 3058` after build.
