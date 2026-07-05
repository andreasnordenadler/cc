# SQC website/mobile nav order parity - 2026-07-05

Source of truth: `apps/mobile/App.tsx`.

Existing unrelated user changes in `ROADMAP.md` and `docs/research/SQC_MONETIZATION_RESEARCH_RECOMMENDATIONS_2026-07-01.md` were preserved and not touched.

## Parity matrix

| Mobile app surface | Native label/order | Website route after slice | Status |
| --- | --- | --- | --- |
| Bottom tab | `Home` | `/` | Matched |
| Bottom tab / menu | `Side Quests` / `Solo Side Quests` | `/solo`, top nav label `Solo Side Quests` | Improved |
| Bottom tab / menu | `Multiplayer Side Quests` | `/multiplayer`, top nav label `Multiplayer Side Quests` | Improved |
| Bottom tab / menu | `Trophy Cabinet` | `/trophy-cabinet`, top nav before custom/community splits | Improved |
| Menu intent | `My Custom Side Quests` | `/custom`, top nav label `My Custom Side Quests` | Improved |
| Menu intent | `Create Custom Side Quest` | `/custom#custom-side-quest-builder` | Matched |
| Menu intent | `Create Multiplayer Side Quest` | `/groupquests/create` | Matched |
| Bottom tab / menu | `Account` / `My Account` | `/account` or `/sign-in` | Matched |
| Menu intent | `Help & Support` | `/support` | Matched |
| Account-adjacent route | Settings/support grouping | `/settings` and `/support` | Present |

## Implemented proof

- Reordered and relabeled the website primary nav to follow the native app's first-level mental model: Home, Solo Side Quests, Multiplayer Side Quests, Trophy Cabinet, then web-specific custom/community/leaderboard splits.
- Reordered the website hamburger menu to keep Multiplayer and Trophy Cabinet next to Solo, matching the mobile app menu before custom creation entries.
- Fixed the signed-in home Trophy Cabinet summary action so `Open Trophy Cabinet` routes to `/trophy-cabinet` instead of `/account`.
- Preserved existing web-only Community Side Quests and Official Leaderboards routes as explicit split surfaces.

## Verification

- `pnpm lint -- src/components/site-nav.tsx src/app/page.tsx` passed.
- `pnpm --dir apps/mobile typecheck` passed.
- `pnpm build` passed with the existing Next workspace-root warning.
- Screenshot server: `pnpm exec next start -p 3037`.
- Screenshots:
  - `artifacts/sqc-nav-order-parity-2026-07-05/home-desktop.png`
  - `artifacts/sqc-nav-order-parity-2026-07-05/home-mobile-web.png`
  - `artifacts/sqc-nav-order-parity-2026-07-05/home-mobile-menu-open.png`
  - `artifacts/sqc-nav-order-parity-2026-07-05/trophy-cabinet-mobile-web.png`

## Notes

- Local screenshot rendering logged the existing Clerk key mismatch / refresh-loop warning, but anonymous pages rendered and screenshots were captured.
