# SQC Group Quests Multipage Split — 2026-05-09

## Source

Andreas said Group Quests looks good but should not all live on one page. The top page should be overview, with multiple pages behind it.

## Shipped

- `/groupquests` is now a clean overview hub.
- `/groupquests/create` now owns the draft builder and mandatory Lichess-style rule controls.
- `/groupquests/no-castle-night` now owns the focused room prototype: status, settings, quest set, leaderboard, live feed, and room proof rules.
- Public nav/homepage remain unchanged; Group Quests is still hidden/unlinked.

## Verification

- `pnpm lint` passed with 3 known warnings.
- `pnpm build` passed and listed all three routes:
  - `/groupquests`
  - `/groupquests/create`
  - `/groupquests/no-castle-night`
