# SQC Mobile Multiplayer List Lobby Experiment — 2026-05-30

Second reversible UI experiment after Andreas rejected the button/tab-heavy v108 lobby.

## Baseline/revert path
- v107 / commit `23e9f3c` remains the last clearly approved baseline for the Switch Side Quest coat placement.
- v108 / commit `a99a9a1` introduced the rejected stat-card/tab lobby.
- This version replaces that with stacked list sections and “More” expansion buttons.

## Experiment
- Keep the Multiplayer Lobby idea, but make it list-first:
  - My Quests
  - Open to Join
  - Invite Key
  - Hosting
  - History
- Each long list starts short and expands with a “More …” button.
- Joined still includes hosted quests when the host is joined by default.

## Revert note
If this still does not test well, revert this experiment commit and return to the v107 baseline or rebuild from the previous pre-lobby structure.
