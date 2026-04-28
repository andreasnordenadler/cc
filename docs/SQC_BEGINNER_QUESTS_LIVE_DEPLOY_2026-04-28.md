# SQC beginner quests deploy proof — 2026-04-28

## Change
Added three beginner Side Quest Chess quests and rewired the starter path to use them:

1. `Knights Before Coffee` — first four player moves must be knight moves, then finish.
2. `Bishop Field Trip` — move both bishops before moving the queen, then finish.
3. `Early King Walk` — move king before move 12, then finish.

## Notes
- These beginner quests are intentionally marked `Specified`, not fake-live, until their exact automated verifiers are implemented.
- Existing live-backed hard quests remain available and still show `Live-backed` verifier status.
- `/account` now says how many live verifiers exist instead of implying every new beginner quest is automated.

## Verification
- `pnpm lint` passed.
- `pnpm build` passed.
- Production smoke to be recorded after deploy.
