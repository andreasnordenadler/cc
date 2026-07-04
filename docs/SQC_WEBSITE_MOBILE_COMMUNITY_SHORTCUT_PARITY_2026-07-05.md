# SQC website/mobile community shortcut parity - 2026-07-05

Source of truth: `apps/mobile/App.tsx`.

Existing unrelated user changes in `ROADMAP.md` and `docs/research/SQC_MONETIZATION_RESEARCH_RECOMMENDATIONS_2026-07-01.md` were not touched.

## Parity matrix

| Mobile destination | Mobile source | Website coverage after slice | Status |
| --- | --- | --- | --- |
| Home / onboarding entry | bottom tab `Home`, hamburger `Home` | `/` app map and primary nav | Covered |
| Solo Side Quests | `sideQuests`, hamburger `Solo Side Quests` | `/solo`, `/challenges`, `/challenges/[id]` | Covered |
| Community Side Quests | Side Quests community browse mode | `/community`, `/challenges/community`, account/settings shortcut added | Improved |
| My Custom Side Quests | `pendingSideQuestCatalogIntent: "my-custom"` | `/custom`, `/account/custom-side-quests` | Covered |
| Create Custom Side Quest | `pendingSideQuestCatalogIntent: "create-custom"` | `/custom#custom-side-quest-builder`, `/account/custom-side-quests#custom-side-quest-builder` | Covered |
| Multiplayer Side Quests | `multiplayerSideQuests` | `/multiplayer`, `/groupquests`, `/groupquests/public`, `/groupquests/[id]` | Covered |
| Create Multiplayer Side Quest | mobile hamburger host action | `/groupquests/create` | Covered |
| Account / profile | `account`, `AccountTrackerDashboard` | `/account`, `/profile`, `/connect`, `/settings` | Covered |
| Settings / support | mobile help modal and account support rows | `/settings`, `/support`, `/privacy`, `/terms` | Covered |

## Implemented proof

- Added `Community Side Quests` to the account hub mobile-menu shortcut panel.
- Added `Community Side Quests` to the settings hub shortcut panel.
- Updated the home app-map copy so the written route list matches the full visible grid.

## Verification

- Desktop screenshots: `artifacts/sqc-community-shortcut-parity-2026-07-05/settings-desktop.png`, `artifacts/sqc-community-shortcut-parity-2026-07-05/home-desktop.png`.
- Mobile-web screenshots: `artifacts/sqc-community-shortcut-parity-2026-07-05/settings-mobile-web.png`, `artifacts/sqc-community-shortcut-parity-2026-07-05/home-mobile-web.png`.
- Screenshot assertion: each captured page included `Community Side Quests`.
- `pnpm lint -- src/app/account/page.tsx src/app/settings/page.tsx src/app/page.tsx` passed.
- `pnpm --dir apps/mobile typecheck` passed.
- `pnpm build` passed with the existing Next workspace-root warning.
- Local screenshot server emitted an existing Clerk key redirect-loop warning during anonymous page loads; pages still rendered for capture.
