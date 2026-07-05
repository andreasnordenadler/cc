# SQC website/mobile account flow parity - 2026-07-05

Source of truth: `apps/mobile/App.tsx`.

Existing unrelated user changes in `ROADMAP.md` and `docs/research/SQC_MONETIZATION_RESEARCH_RECOMMENDATIONS_2026-07-01.md` were preserved and not touched.

## Parity matrix

| Mobile Account surface | Native order | Website coverage after slice | Status |
| --- | --- | --- | --- |
| My Account identity | Profile, sync state, chess username readiness | `/account` current mission header and readiness strip | Covered |
| Your Side Quests | Active Solo, Multiplayer, Custom Side Quests | `/account` account flow rows in the same order | Improved |
| Progress & Stats | Completed, proofs, coats, podiums | `/account` readiness/progress summary and Trophy Cabinet section | Covered |
| Trophy Cabinet | Completed Solo coats and Multiplayer trophies | `/account` trophy cabinet preview plus `/trophy-cabinet` | Covered |
| Chess username editor | Lichess and Chess.com account setup | `/connect`, linked from account flow/readiness/settings | Covered |
| Help & Support | Account help modal and support topics | `/support`, linked in account flow and mobile menu shortcuts | Improved |
| Settings-adjacent tools | Profile/account support grouping | `/settings`, linked in account flow | Improved |

## Implemented proof

- Added an account-first flow panel to `/account` so signed-in web users see the same practical sequence as the mobile Account tab: chess readiness, active Solo proof, Custom Side Quests, Multiplayer Side Quests, Settings, then Help & Support.
- Kept the existing mobile hamburger shortcut matrix below that flow, preserving route coverage while making the account page less route-list-first.
- Preserved concrete deep links for active official Solo quests and kept Custom active quests pointed at the Custom hub.

## Verification

- `pnpm lint -- src/app/account/page.tsx src/app/globals.css` passed with the existing ignored-CSS warning.
- `pnpm exec tsc --noEmit --pretty false` passed.
- `pnpm --dir apps/mobile exec tsc --noEmit --pretty false` passed.
- `pnpm build` passed with the existing Next workspace-root warning.
- Screenshot attempt through local `next start -p 3038`:
  - `artifacts/sqc-account-flow-parity-2026-07-05/account-desktop.png`
  - `artifacts/sqc-account-flow-parity-2026-07-05/account-mobile-web.png`
- Screenshot limitation: `/account` is auth-gated in the local browser context, so captured images show the sign-in gate rather than the signed-in account flow changed in this slice.
