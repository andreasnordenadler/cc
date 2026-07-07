# SQC website Side Quests canonical tab parity - 2026-07-07

Source of truth: `apps/mobile/App.tsx`, especially `TABS`, `GlobalHamburgerMenu`, and `SideQuestCatalogIntent`.

## Change

- The web app chrome now treats `/side-quests` as the canonical Side Quests tab destination.
- The hamburger and five-tab dock both use the mobile tab label `Side Quests` and open the app-style hub, not a legacy official-only route.
- Home first-screen actions and the app map now send users to the Side Quests hub, where official, community, my custom, and create-custom intents are all visible.
- The settings mobile-menu shortcut mirrors the same Side Quests hub target.
- Existing `/solo` links and route alias remain available so old links, proof flows, and detail pages keep working.

## Verification

- `pnpm build` passed on 2026-07-07. Next.js still reports the existing workspace-root warning because multiple lockfiles are present.

## Notes

- Known unrelated untracked file remains untouched: `docs/research/SQC_MONETIZATION_RESEARCH_RECOMMENDATIONS_2026-07-01.md`.
