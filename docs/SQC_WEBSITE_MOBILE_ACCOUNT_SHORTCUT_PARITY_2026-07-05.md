# SQC website/mobile account shortcut parity - 2026-07-05

Source of truth: `apps/mobile/App.tsx`.

This cron slice keeps the mobile app as the product source and narrows the website parity work to the account/settings hubs. Existing unrelated user changes in `ROADMAP.md` and `docs/research/SQC_MONETIZATION_RESEARCH_RECOMMENDATIONS_2026-07-01.md` were not touched.

## Parity matrix

| Mobile destination | Mobile source | Website coverage after slice | Status |
| --- | --- | --- | --- |
| Home | bottom tab `Home`, hamburger `Home` | `/` and primary nav | Covered |
| Solo Side Quests | hamburger `Solo Side Quests`, tab `Side Quests` | `/solo` / `/challenges`; account shortcut added | Improved |
| My Custom Side Quests | hamburger `My Custom Side Quests` | `/account/custom-side-quests`; account shortcut added | Improved |
| Create Custom Side Quest | hamburger `Create Custom Side Quest`, `create-custom` intent | `/account/custom-side-quests#custom-side-quest-builder`; account shortcut added | Improved |
| Multiplayer Side Quests | tab and hamburger `Multiplayer Side Quests` | `/multiplayer` / `/groupquests`; account shortcut added | Improved |
| Create Multiplayer Side Quest | hamburger `Create Multiplayer Side Quest` | `/groupquests/create`; account shortcut added | Improved |
| Trophy Cabinet | tab and hamburger `Trophy Cabinet` | `/trophy-cabinet`; account shortcut added | Improved |
| Account / profile | tab `Account`, hamburger `My Account` | `/account`, `/profile`, `/connect`, `/settings` | Covered |
| Help & Support | hamburger `Help & Support`, account support modal | `/support`; account shortcut added | Improved |

## Implemented proof

- Added a compact `Mobile menu shortcuts` panel to `/account` with the same high-frequency destinations exposed by the mobile hamburger menu.
- Added the same shortcut grouping to `/settings` so signed-out and signed-in web users can see the mobile-aligned route family without needing account auth.
- Kept the website route model intact: shortcuts deep-link into existing web pages instead of moving or renaming routes.
- Added responsive CSS so the shortcut panel stays three columns on desktop, two columns on tablet, and one column on phone-width web.

## Verification

- Desktop screenshot: `artifacts/sqc-account-shortcut-parity-2026-07-05/settings-desktop.png`.
- Mobile-web screenshot: `artifacts/sqc-account-shortcut-parity-2026-07-05/settings-mobile-web.png`.
- `pnpm lint -- src/app/account/page.tsx src/app/settings/page.tsx` passed.
- `pnpm --dir apps/mobile typecheck` passed.
- `pnpm build` passed with the existing Next workspace-root warning.

## Remaining gaps

- The website account hub still uses route navigation while the mobile app uses in-shell tab/intent state.
- The mobile Help & Support modal can carry native app context; the website support page is still route-based.
