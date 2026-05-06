# SQC Side Quests label update — 2026-05-06

## Scope
Andreas asked to rename visible `Quests` labels to `Side Quests`.

## Changes made

- Top navigation now shows `Side Quests` instead of `Quests`.
- Brand test labels updated to `Side Quests`.
- Terms copy now says `Side quests`.
- Challenge detail back/share labels now say `Side Quest Hub` and `Share this Side Quest`.

## Verification

- Grep confirmed no remaining standalone visible `Quests` label matches outside already-correct `My Side Quests` copy.
- `pnpm lint` passed with only existing accepted warnings.
- `pnpm build` passed.
