# SQC website Side Quest catalog label parity - 2026-07-05

Source of truth: `apps/mobile/App.tsx`.

Existing unrelated user change preserved: `docs/research/SQC_MONETIZATION_RESEARCH_RECOMMENDATIONS_2026-07-01.md`.

## Parity matrix

| Mobile app surface | Mobile label | Website route after slice | Status |
| --- | --- | --- | --- |
| Side Quest catalog tab | `Official Side Quests` | `/solo` | Improved |
| Side Quest catalog tab | `Community Side Quests` | `/community` | Improved |
| Hamburger intent | `My Custom Side Quests` | `/custom` | Matched |
| Hamburger intent | `Create Custom Side Quest` | `/custom#custom-side-quest-builder` | Matched |

## Implemented proof

- Updated the shared website Side Quest mode switcher to use the mobile app's full labels instead of shortened web-only labels.
- Kept the web's four explicit destinations intact while visually emphasizing the app's two primary Side Quest catalog tabs: Official Side Quests and Community Side Quests.
- Preserved existing routes, filters, auth behavior, quest data, and the mobile app code.

## Verification

- `pnpm lint -- src/components/side-quest-mode-switcher.tsx src/app/globals.css` passed with the existing CSS ignore warning.
- `pnpm exec tsc --noEmit --pretty false` passed.
- `pnpm --dir apps/mobile exec tsc --noEmit --pretty false` passed.
- `pnpm build` passed with the existing Next workspace-root warning.
- Screenshot server: `pnpm exec next start -p 3048`; local render logged the existing Clerk key mismatch / refresh-loop warning, but anonymous pages rendered and screenshots were captured.
- Screenshot proof:
  - `artifacts/sqc-side-quest-catalog-label-parity-2026-07-05/solo-desktop.png`
  - `artifacts/sqc-side-quest-catalog-label-parity-2026-07-05/solo-mobile-web.png`
  - `artifacts/sqc-side-quest-catalog-label-parity-2026-07-05/community-mobile-web.png`
