# SQC remove proof log and add completed side quest list — 2026-05-06

## Scope
Andreas said the standalone `/proof-log` page is no longer needed. Instead, My Side Quests should show a very simple completed quest list: coat of arms, quest name, and completion date.

## Changes made

- Removed the `/proof-log` page route.
- Removed proof-log links/copy from primary app surfaces and redirected those CTAs toward My Side Quests.
- Removed the `proof-log` nav active type.
- Replaced the heavier collected coat-of-arms grid on `/account` with a simple completed side quest list.
- Each completed row shows:
  - coat of arms
  - quest name
  - completed date, using completed game time when available and checked time as fallback
- Kept rows linked to the quest detail page for drill-in.

## Verification

- Grep confirmed no remaining `proof-log` / `Proof log` strings in `src/app`, `src/components`, or `src/lib`.
- `pnpm lint` passed with only existing accepted warnings.
- `pnpm build` passed and route count dropped from 45 to 44, confirming `/proof-log` was removed.
