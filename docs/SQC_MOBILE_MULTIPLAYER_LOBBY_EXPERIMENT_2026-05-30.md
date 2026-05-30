# SQC Mobile Multiplayer Lobby Experiment — 2026-05-30

Reversible UI experiment requested by Andreas.

## Baseline before experiment
- Last accepted mobile APK before this experiment: `v107` / commit `23e9f3c` (`Center coat above switch side quest list`).
- Andreas explicitly liked the Switch Side Quest list coat placement.

## Experiment
- Replace the long mixed Multiplayer Side Quests page with a lobby-style overview:
  - summary cards: Joined, Hosting, Available, Finished
  - tabs: My Quests, Join, Create, History
  - default "Joined" count includes hosted quests too, because hosts are joined by default.

## Revert note
If Andreas dislikes the lobby experiment, revert this experiment commit and keep the v107 behavior. The previous page structure is recoverable from commit `23e9f3c`.
