# SQC website Side Quest mode parity - 2026-07-05

Source of truth: `apps/mobile/App.tsx`.

This cron slice keeps the mobile app as the product source and narrows the website parity work to the Side Quest family. Existing unrelated user changes in `ROADMAP.md` and `docs/research/SQC_MONETIZATION_RESEARCH_RECOMMENDATIONS_2026-07-01.md` were not touched.

## Parity matrix

| Mobile destination | Mobile source | Website coverage after slice | Status |
| --- | --- | --- | --- |
| Home | bottom tab `Home`, hamburger `Home` | `/` and primary nav | Covered |
| Solo Side Quests | tab `Side Quests`, hamburger `Solo Side Quests`, official catalog mode | `/solo` / `/challenges` now includes a Side Quest mode switcher | Improved |
| Community Side Quests | Solo catalog community/discover mode | `/community` / `/challenges/community` now includes the same mode switcher | Improved |
| My Custom Side Quests | hamburger `My Custom Side Quests`, custom catalog mine mode | `/custom` / `/account/custom-side-quests` now includes the same mode switcher | Improved |
| Create Custom Side Quest | hamburger `Create Custom Side Quest`, `create-custom` intent | switcher deep-links to `/custom#custom-side-quest-builder` | Improved |
| Multiplayer Side Quests | tab and hamburger `Multiplayer Side Quests` | `/multiplayer` / `/groupquests`; unchanged this slice | Covered |
| Trophy Cabinet | tab and hamburger `Trophy Cabinet` | `/trophy-cabinet`; unchanged this slice | Covered |
| Account / profile | tab `Account`, hamburger `My Account` | `/account`, `/profile`, `/connect`, `/settings`; unchanged this slice | Covered |
| Help & Support | hamburger `Help & Support`, account support modal | `/support`; unchanged this slice | Covered |

## Implemented proof

- Added `SideQuestModeSwitcher`, a shared route-level switcher for Official, Community, My Custom, and Create Custom Side Quest modes.
- Placed it on `/solo`, `/community`, and `/custom` so the web Side Quest family mirrors the mobile app's in-shell catalog modes without changing existing URLs.
- Added responsive styles: four columns on desktop, two on tablet, and a horizontal scroll rail on phone-width web.

## Verification

- Desktop screenshot: `artifacts/sqc-side-quest-mode-parity-2026-07-05/solo-desktop-static.png`.
- Mobile-web screenshot: `artifacts/sqc-side-quest-mode-parity-2026-07-05/solo-mobile-web-static.png`.
- Screenshot note: local Next dev serving `/solo` was blocked by the existing Clerk session-token redirect loop in this environment, so the screenshots use the actual CSS and updated switcher markup in a static Playwright render.
- `pnpm lint -- src/components/side-quest-mode-switcher.tsx src/app/challenges/page.tsx src/app/challenges/community/page.tsx src/app/account/custom-side-quests/page.tsx src/app/globals.css` passed; ESLint warned that `src/app/globals.css` is ignored by the config.
- `pnpm --dir apps/mobile typecheck` passed.
- `pnpm build` passed with the existing Next workspace-root warning.

## Remaining gaps

- The website still uses separate routes where the mobile app uses in-shell tab and intent state.
- Multiplayer has a similar Official/Community segmented catalog on mobile; website route coverage exists, but the browse UI is not identical.
