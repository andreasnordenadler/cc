# SQC Coming Soon quest limit — 2026-05-07

## Request
Andreas cited product-review feedback that the quest deck had too many Coming Soon quests. He asked to either make six of them live and tested, or hide six of them, with at most four Coming Soon quests visible.

## Decision
Hide the excess Coming Soon quests for now. This is safer than prematurely making six verifier-dependent quests live without full live proof testing.

## Change
- Added `MAX_VISIBLE_COMING_SOON_QUESTS = 4` in `ChallengeDeckBrowser`.
- The Coming Soon list is still filtered/sorted, then capped to four rendered cards.
- The extra Coming Soon concepts remain in code as draft inventory, but are not shown in the public quest deck unless they are inside the four-card cap for the active filter/sort.

## Verification
- `pnpm lint` passed with warnings only.
- `pnpm build` passed.
