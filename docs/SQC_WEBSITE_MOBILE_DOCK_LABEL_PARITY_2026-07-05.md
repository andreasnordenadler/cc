# SQC website/mobile dock label parity - 2026-07-05

Source of truth: `apps/mobile/App.tsx`.

Existing unrelated user changes in `ROADMAP.md` and `docs/research/SQC_MONETIZATION_RESEARCH_RECOMMENDATIONS_2026-07-01.md` were preserved and not touched.

## Parity matrix

| Mobile destination | Native app label | Website route/dock after slice | Status |
| --- | --- | --- | --- |
| Home | `Home` | `/` dock label `Home` | Matched |
| Solo catalog | `Side Quests` | `/solo` dock label `Side Quests` | Improved |
| Multiplayer catalog | `Multiplayer Side Quests` | `/multiplayer` dock label `Multiplayer Side Quests` | Improved |
| Trophy cabinet | `Trophy Cabinet` | `/trophy-cabinet` dock label `Trophy Cabinet` | Improved |
| Account | `Account` | `/account` or `/sign-in` dock label `Account` | Matched |
| Settings/support | Account/help routes | `/settings` and `/support` from home/account shortcut grids | Improved |

## Implemented proof

- Updated the phone-width website dock to use the same visible tab labels as native mobile instead of `Solo` and `Trophy` abbreviations.
- Kept the desktop/tablet nav unchanged and preserved existing route aliases.
- Switched the root viewport to `device-width` so the existing phone-width website rules and dock activate on actual mobile browsers.
- Increased phone bottom padding so the taller two-line tab labels do not cover page content.
- Added `Settings` to the web home app map and account shortcut grid so account setup/support routes match the mobile account/help grouping.

## Verification

- `pnpm lint -- src/app/layout.tsx src/components/site-nav.tsx src/app/globals.css src/app/page.tsx src/app/account/page.tsx` passed with the existing CSS ignored warning and the existing nav-logo `<img>` warning.
- `pnpm --dir apps/mobile typecheck` passed.
- `pnpm build` passed with the existing Next workspace-root warning.
- Production screenshot server: `pnpm exec next start -p 3025`.
- Screenshots:
  - `artifacts/sqc-dock-label-parity-2026-07-05/home-desktop.png`
  - `artifacts/sqc-dock-label-parity-2026-07-05/home-mobile-web.png`
  - `artifacts/sqc-dock-label-parity-2026-07-05/settings-mobile-web.png`

## Notes

- `pnpm dev -- -p 3024` failed because this Next CLI treated `-p` as a project directory; `pnpm exec next dev -p 3024` and `pnpm exec next start -p 3025` worked.
