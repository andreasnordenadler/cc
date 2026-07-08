# SQC Web Solo Side Quests Source - 2026-07-07

## Mobile Source Checked

- `apps/mobile/App.tsx`, `QuestBoardDashboard`
- `apps/mobile/App.tsx`, `FixedScreenCloseButton`
- `docs/SQC_MOBILE_SOURCE_OF_TRUTH_HOME_NAV_2026-07-07.md`
- `docs/SQC_MOBILE_APP_WEB_REBUILD_SPRINT_2026-07-07.md`

## Current Mobile Solo Catalog Model

- Entering Solo Side Quests sets `activeTab` to `sideQuests`.
- Non-home screens show a fixed round close button back to Home.
- Signed-in accounts keep the global floating hamburger menu; signed-out users do not get the hamburger.
- The Solo catalog starts with the current generic coat-of-arms art plus soft glow.
- The catalog uses two large segmented choices:
  - `Official Side Quests`
  - `Community Side Quests`
- A small centered swap control sits between those two choices.
- The Official tab renders an `Official Side Quests` section with an official count.
- Official Side Quest rows show coat art, title, objective, and state/difficulty.

## Web Slice Gate

The `/side-quests` route should translate the mobile catalog, not reuse the old website deck/chrome:

- No `SiteNav` topbar.
- No old public wordmark/logo treatment.
- No persistent bottom navigation.
- Preserve old challenge detail routes only as route compatibility.
