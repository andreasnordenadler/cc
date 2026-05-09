# SQC Brutal/Absurd streamer-hard lane — 2026-05-09

## Scope

Reconfirmed SQC backlog item: expand/revisit Brutal and Absurd quests so they read as truly viral/streamer-hard, including deciding whether Absurd quests should require rated games.

## Product decision

- **Brutal** = clip-worthy, streamer-hard, but still allowed in rated or casual public games.
- **Absurd** = no-excuses ceiling, **rated-only** public Lichess/Chess.com games.
- Reason: Absurd completions should have stronger proof/leaderboard value and feel meaningfully harder than Brutal, not just slightly higher points.

## User-visible changes

- Added a `Streamer-hard lane` section to `/challenges`.
- The section explicitly explains: `Brutal is clip-worthy. Absurd is rated-only.`
- The section highlights the live streamer-hard quests:
  - `Queen? Never Heard of Her` — Brutal
  - `Knightmare Mode` — Brutal
  - `Rookless Rampage` — Absurd / rated-only
- Scheduled the next high-difficulty Coming Soon concepts so difficulty filters can reveal the future streamer-hard queue:
  - `Sacrifice Tax Bracket` — Brutal — 2026-06-11
  - `Queen Side Quest` — Brutal — 2026-06-18
  - `Underpromotion Union` — Absurd/rated-only — 2026-06-25
  - `Lone King Witness Protection` — Absurd/rated-only — 2026-07-02

## Files changed

- `src/app/challenges/page.tsx`
- `src/components/challenge-deck-browser.tsx`

## Verification

- `pnpm lint` — passed with 3 pre-existing warnings.
- `pnpm build` — passed.

## Deployment

Pending in this proof note until production deploy/smoke completes.
