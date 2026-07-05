# SQC website/mobile Multiplayer mode parity - 2026-07-05

Source of truth: `apps/mobile/App.tsx`.

This cron slice keeps the mobile app as product source and narrows the website parity work to Multiplayer Side Quest entry points. Existing unrelated user changes in `ROADMAP.md` and `docs/research/SQC_MONETIZATION_RESEARCH_RECOMMENDATIONS_2026-07-01.md` were preserved and not touched.

## Parity matrix

| Mobile destination | Mobile source | Website coverage after slice | Status |
| --- | --- | --- | --- |
| Multiplayer Side Quests overview | tab and hamburger `Multiplayer Side Quests` | `/multiplayer` / `/groupquests` with shared Multiplayer mode switcher | Improved |
| Community Multiplayer Side Quests | mobile Multiplayer catalog `community` mode and search/filter chips | `/groupquests/public` with shared Multiplayer mode switcher | Improved |
| Create Multiplayer Side Quest | mobile create modal action | `/groupquests/create` with shared Multiplayer mode switcher | Improved |
| Official Leaderboards | `officialLeaderboards` screen | `/leaderboards` / `/scoreboard` with shared Multiplayer mode switcher | Improved |
| Join private Multiplayer Side Quest | mobile invite-code card | `/groupquests#private-invite` preserved in overview mode | Covered |

## Implemented proof

- Added `MultiplayerModeSwitcher`, mirroring the mobile app's Multiplayer screen families as route-level entries: My Tables, Community, Create, and Official.
- Placed it on `/multiplayer`/`/groupquests`, `/groupquests/public`, `/groupquests/create`, and `/leaderboards` so web users can move between the same top-level Multiplayer modes without hunting through unrelated nav.
- Reused the existing responsive Side Quest switcher layout, with a subtle Multiplayer-specific active treatment.

## Verification

- Desktop screenshots:
  - `artifacts/sqc-multiplayer-mode-parity-2026-07-05/multiplayer-desktop.png`
  - `artifacts/sqc-multiplayer-mode-parity-2026-07-05/public-desktop.png`
- Mobile-web screenshots:
  - `artifacts/sqc-multiplayer-mode-parity-2026-07-05/multiplayer-mobile-web.png`
  - `artifacts/sqc-multiplayer-mode-parity-2026-07-05/leaderboards-mobile-web.png`
- `pnpm lint -- src/components/multiplayer-mode-switcher.tsx src/app/groupquests/page.tsx src/app/groupquests/public/page.tsx src/app/groupquests/create/page.tsx src/app/scoreboard/page.tsx src/app/globals.css` passed with the existing ignored-CSS warning.
- `pnpm --dir apps/mobile typecheck` passed.
- `pnpm build` passed with the existing Next workspace-root warning.
