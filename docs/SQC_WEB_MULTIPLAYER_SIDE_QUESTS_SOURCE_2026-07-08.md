# SQC Web Multiplayer Side Quests Source - 2026-07-08

## Mobile Source Checked

- `apps/mobile/App.tsx`, `MultiplayerSideQuestsScreen`
- `apps/mobile/App.tsx`, `GlobalHamburgerMenu`
- `docs/SQC_MOBILE_SOURCE_OF_TRUTH_HOME_NAV_2026-07-07.md`
- `docs/SQC_MOBILE_APP_WEB_REBUILD_SPRINT_2026-07-07.md`

## Current Mobile Multiplayer Catalog Model

- Entering Multiplayer Side Quests sets `activeTab` to `multiplayerSideQuests`.
- Non-home screens show a fixed round close button back to Home.
- Signed-in accounts keep the global floating hamburger menu; signed-out users do not get the hamburger.
- The catalog starts with the current Multiplayer seal art with soft generic coat glow.
- The catalog uses two large segmented choices:
  - `Official Side Quests`
  - `Community Side Quests`
- A small centered swap control sits between those two choices.
- The Official tab renders `Official Multiplayer Side Quests`, an official count, and an empty state when none are open.
- The signed-in Official tab also includes latest finished official results and earlier official weeks panels.
- The Community tab starts with a `Community Multiplayer Side Quests` explainer, then signed-in active/history sections, then the available community list with search, filter chips, and `Sort: Closing`.
- Signed-out Community browse hides create and invite-code controls.
- Signed-in Community browse includes `Create` and `Invite Code` panels after the public community list.

## Web Slice Gate

The `/multiplayer` and `/multiplayer-side-quests` routes should translate the current mobile catalog shell:

- No `SiteNav` topbar.
- No old public wordmark/logo treatment.
- No persistent bottom navigation.
- Keep old route compatibility only through redirects and shared backend/API logic.
