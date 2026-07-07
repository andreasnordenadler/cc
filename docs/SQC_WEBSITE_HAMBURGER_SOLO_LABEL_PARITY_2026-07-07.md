# SQC website hamburger Solo label parity - 2026-07-07

Source of truth: `apps/mobile/App.tsx`, specifically `GlobalHamburgerMenu`.

Known unrelated untracked file remains untouched: `docs/research/SQC_MONETIZATION_RESEARCH_RECOMMENDATIONS_2026-07-01.md`.

## Change

- Updated the web hamburger drawer label from `Side Quests` to `Solo Side Quests`.
- Kept the bottom dock label as `Side Quests`, matching the mobile `TABS` label.
- Kept `/side-quests` as the app-style tab route and preserved existing `/solo` and `/solo-side-quests` aliases.

## Verification

- `pnpm build` passed on 2026-07-07. Next.js still reports the existing workspace-root warning because multiple lockfiles are present.

## Notes

- Mobile drawer source line uses `Solo Side Quests`; mobile bottom tab source uses `Side Quests`. The web shell now mirrors that split instead of using one label in both places.
