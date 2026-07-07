# SQC website/mobile parity matrix - 2026-07-04

Source of truth: `apps/mobile/App.tsx`.

This slice compares mobile app top-level destinations with website routes and records the small web parity changes made on 2026-07-04. Existing user changes in `ROADMAP.md` and `docs/research/SQC_MONETIZATION_RESEARCH_RECOMMENDATIONS_2026-07-01.md` were not touched.

| Mobile destination | Mobile source | Website coverage | Status | Slice note |
| --- | --- | --- | --- | --- |
| Home / onboarding entry | `activeTab: "home"`, bottom tab `Home`, signed-out Account copy, home feature cards | `/`, `/sign-in`, `/sign-up` | Covered | Home already exposes active quest, onboarding explanation, app map, account prompts, Solo and Multiplayer entry points. |
| Solo Side Quests | `sideQuests`, hamburger `Solo Side Quests` | `/side-quests`, `/solo`, `/solo-side-quests`, `/challenges`, `/challenges/[id]`, `/random`, `/path` | Improved | Website has equivalent official Solo catalog and detail routes; the web hamburger drawer now uses the mobile drawer label `Solo Side Quests` while the dock stays `Side Quests`. |
| My Custom Side Quests | mobile `pendingSideQuestCatalogIntent: "my-custom"` and hamburger `My Custom Side Quests` | `/custom`, `/account/custom-side-quests` | Covered | Website keeps custom management as a route and home entry. |
| Create Custom Side Quest | mobile `pendingSideQuestCatalogIntent: "create-custom"` and hamburger create action | `/custom#custom-side-quest-builder`, `/account/custom-side-quests` | Covered | Website has builder entry from home app map. |
| Community Side Quests | mobile Side Quests screen `community-discover` browse mode | `/community`, `/challenges/community`, `/challenges/community/[id]` | Covered | Website has public community Solo routes and nav entry. |
| Multiplayer Side Quests | `multiplayerSideQuests`, hamburger `Multiplayer Side Quests` | `/multiplayer`, `/groupquests`, `/groupquests/public`, `/groupquests/[id]`, `/groupquests/create` | Covered | Website has shared table browse/create/detail routes. |
| Official Leaderboards | `officialLeaderboards` screen and `OfficialMultiplayerLeaderboardsScreen` | `/leaderboards`, `/scoreboard` | Improved | Added primary website nav link to `/leaderboards`; home app map now includes Official Leaderboards. |
| Coat of Arms / Trophy Cabinet | `coatOfArms`, bottom tab label `Trophy Cabinet`, hamburger `Trophy Cabinet` | `/trophy-cabinet`, `/badges`, proof routes | Covered | Primary nav keeps the mobile-facing `Trophy Cabinet` label while preserving the existing route and coat-of-arms content. |
| Account / profile | `account`, `AccountTrackerDashboard`, profile/chess username editor | `/account`, `/profile`, `/connect` | Improved | Primary account nav now exposes Profile directly and groups profile/connect/settings as account-active destinations. |
| Settings / support | mobile Account help rows plus `HelpSupportModal`, hamburger `Help & Support` | `/settings`, `/support`, `/privacy`, `/terms` | Improved | `/settings` is now a lightweight settings hub instead of a support-page duplicate; support remains a direct nav action. |

## Web changes in this slice

- `src/components/site-nav.tsx`: added `Official Leaderboards` primary nav and exposed signed-in `Profile` and `Settings` account actions while keeping the mobile `Trophy Cabinet` label.
- `src/app/settings/page.tsx`: replaced the support re-export with a settings hub for profile, proof usernames, custom quests, and support/privacy.
- `src/app/page.tsx`: added `Official Leaderboards` to the home app-map section.

## Proof

- Desktop screenshots: `artifacts/sqc-website-mobile-parity-slice-2026-07-04/home-desktop.png`, `artifacts/sqc-website-mobile-parity-slice-2026-07-04/settings-desktop.png`, `artifacts/sqc-website-mobile-parity-slice-2026-07-04/leaderboards-desktop.png`.
- Mobile-web screenshots: `artifacts/sqc-website-mobile-parity-slice-2026-07-04/home-mobile-web.png`, `artifacts/sqc-website-mobile-parity-slice-2026-07-04/settings-mobile-web.png`.
- Verification: `pnpm lint` passed with existing warnings only, `pnpm --dir apps/mobile typecheck` passed, and `pnpm build` passed.

## Follow-up candidates

- Decide whether mobile should expose `officialLeaderboards` in `TABS` or keep it reachable only through Multiplayer flows.
- Consider a compact web nav treatment if the signed-in nav becomes too wide after more account destinations are added.
