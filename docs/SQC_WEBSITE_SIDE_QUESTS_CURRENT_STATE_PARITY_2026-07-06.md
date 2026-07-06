# SQC website Side Quests current-state parity - 2026-07-06

Source of truth: `apps/mobile/App.tsx`.

This slice advances `/side-quests` from an intent launcher toward the native `SideQuestsScreen` structure. It preserves existing Solo, Community, Custom, and Create Custom routes while adding the mobile screen's signed-in/signed-out state summary and current Side Quest context.

## Parity matrix

| Mobile app surface | Native source | Website coverage | Status |
| --- | --- | --- | --- |
| Solo hero | `SideQuestsScreen` hero: `Solo Side Quests`, title, proof copy | `/side-quests` hero | Matched |
| Hero stats | `{availableCount} available`, `{completedCount} completed`, active state | `/side-quests` stats row from Clerk metadata and challenge catalog | Improved |
| Build action | `Build a Side Quest` | `/custom#custom-side-quest-builder` | Matched |
| Community action | `Browse Community Side Quests` | `/community` via mode switcher and intent card | Matched |
| Current Side Quest | selected/current quest card and detail path | `/side-quests` current-state card with official/custom route target | Improved |
| Custom library intent | `Your custom Side Quest library` | `/custom` / `/account/custom-side-quests` intent | Preserved |
| Official deck intent | `Solo Side Quest deck` | `/solo` and `/challenges` official catalog | Preserved |

## Slice changes

- `src/app/side-quests/page.tsx`: derives completed count, active official/custom quest, active route, and active badge image from the same account metadata used by the web home screen.
- `src/app/side-quests/page.tsx`: adds a mobile-style status row and Current Side Quest card above the existing mode switcher.
- `src/app/side-quests/page.tsx`: fixes the Create Custom Side Quest card to use an existing custom-queen badge asset.
- `src/app/globals.css`: adds responsive app-style layout for the stats row and current quest card.

## Proof

- Desktop screenshot: `artifacts/sqc-side-quests-current-state-parity-2026-07-06/side-quests-desktop-full.png`
- Mobile-web screenshot: `artifacts/sqc-side-quests-current-state-parity-2026-07-06/side-quests-mobile-full.png`
- Screenshot server: `pnpm exec next start -p 3070` after `pnpm build`.

## Verification

- `pnpm lint -- src/app/side-quests/page.tsx` passed.
- `pnpm exec tsc --noEmit --pretty false` passed.
- `pnpm build` passed with the existing Next workspace-root warning.
- Screenshot capture used `pnpm exec playwright screenshot --full-page --viewport-size=1440,1800 http://localhost:3070/side-quests artifacts/sqc-side-quests-current-state-parity-2026-07-06/side-quests-desktop-full.png`.
- Screenshot capture used `pnpm exec playwright screenshot --full-page --viewport-size=390,1400 http://localhost:3070/side-quests artifacts/sqc-side-quests-current-state-parity-2026-07-06/side-quests-mobile-full.png`.
- Local screenshot server still logs the known Clerk refresh-loop warning in this environment, but the signed-out `/side-quests` screenshots were captured successfully.
