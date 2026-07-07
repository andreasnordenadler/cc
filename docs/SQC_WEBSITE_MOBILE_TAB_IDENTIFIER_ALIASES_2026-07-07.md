# SQC Website Mobile Tab Identifier Aliases - 2026-07-07

## Source of truth

- `apps/mobile/App.tsx` defines `AppTab` as `home`, `sideQuests`, `multiplayerSideQuests`, `officialLeaderboards`, `coatOfArms`, and `account`.
- The web app already had user-facing canonical routes for those screens, but not every mobile tab identifier was available as a direct route.

## Web parity slice

- Added `/sideQuests` as a direct alias for `/side-quests`.
- Added `/multiplayerSideQuests` as a direct alias for `/multiplayer`.
- Added `/officialLeaderboards` as a direct alias for `/official-leaderboards`.
- Added `/coatOfArms` as a direct alias for `/trophy-cabinet`.

These aliases keep the existing browser-friendly routes while allowing deep links and QA checks to use the mobile source-of-truth tab names.

## Verification

- Initial `pnpm build` failed because `/side-quests` and `/official-leaderboards` do not export route metadata to re-export from alias pages.
- Fixed the aliases to re-export only the route component where metadata is absent.
- `pnpm build` passed after the alias fix. The generated route table included `/sideQuests`, `/multiplayerSideQuests`, `/officialLeaderboards`, and `/coatOfArms`.
