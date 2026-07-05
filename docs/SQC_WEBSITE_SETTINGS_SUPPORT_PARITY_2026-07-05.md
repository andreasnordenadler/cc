# SQC website settings/support mobile parity - 2026-07-05

Source of truth: `apps/mobile/App.tsx`.

Existing unrelated user changes in `ROADMAP.md` and `docs/research/SQC_MONETIZATION_RESEARCH_RECOMMENDATIONS_2026-07-01.md` were preserved and not touched.

## Parity matrix

| Mobile app surface | Mobile label/order | Website route after slice | Status |
| --- | --- | --- | --- |
| Hamburger menu | `Home` | `/settings` shortcut to `/` | Improved |
| Hamburger menu | `Solo Side Quests` | `/settings` shortcut to `/solo` | Matched |
| Hamburger menu | `Multiplayer Side Quests` | `/settings` shortcut to `/multiplayer` | Matched |
| Hamburger menu | `Trophy Cabinet` | `/settings` shortcut to `/trophy-cabinet` | Matched |
| Hamburger menu | `My Custom Side Quests` | `/settings` shortcut to `/custom` | Matched |
| Hamburger menu | `Create Custom Side Quest` | `/settings` shortcut to `/custom#custom-side-quest-builder` | Matched |
| Hamburger menu | `Create Multiplayer Side Quest` | `/settings` shortcut to `/groupquests/create` | Matched |
| Hamburger menu | `My Account` / `Sign in / Account` | `/settings` shortcut to `/account` | Improved |
| Hamburger menu | `Help & Support` | `/settings` shortcut to `/support` | Matched |
| Support modal topics | active solo, solo choice, proof, coat, multiplayer detail, multiplayer, accounts | `/support` topic cards | Improved |

## Implemented proof

- Reordered the `/settings` mobile-menu shortcut block to mirror the native hamburger order first.
- Split web-only Community Side Quests and Official Leaderboards into a companion row so they remain available without interrupting the native order.
- Expanded `/support` help cards to match the mobile support modal topics, including active Solo help and per-table Multiplayer guidance.

## Verification

- `pnpm lint -- src/app/settings/page.tsx src/app/support/page.tsx` passed.
- `pnpm exec tsc --noEmit --pretty false` passed.
- `pnpm --dir apps/mobile exec tsc --noEmit --pretty false` passed.
- `pnpm build` passed with the existing Next workspace-root warning.
- Screenshot server: `pnpm exec next start -p 3042`.
- Screenshots:
  - `artifacts/sqc-settings-support-parity-2026-07-05/settings-desktop.png`
  - `artifacts/sqc-settings-support-parity-2026-07-05/settings-mobile-web.png`
  - `artifacts/sqc-settings-support-parity-2026-07-05/support-desktop.png`
  - `artifacts/sqc-settings-support-parity-2026-07-05/support-mobile-web.png`
