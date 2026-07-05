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
