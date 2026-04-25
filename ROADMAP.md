# CC Roadmap

Last updated: 2026-04-25 23:18 Europe/Stockholm  
Owner: Sam  
Status: active — three-project focus

## Mission

Build CC / BlunderCheck into a playful chess side-quest product:

> **Chess, but with stupidly hard side quests.**

Users pick ridiculous chess challenges, play real games on Lichess or Chess.com, and BlunderCheck verifies whether they completed the challenge so they can earn points, badges, streaks, and shareable proof.

## Current product canon

- Working public name in mockups: **BlunderCheck**
- Internal lane name: **CC**
- Correct feel: a smart chess friend daring you to do something dumb
- Primary loop: pick challenge → play real chess elsewhere → automatic verification → success/failure result → points/badge/share/friend challenge
- Main anti-goals: no engine dashboard, no PGN upload, no formal training product, no corporate SaaS layout

Canonical brief:
- `docs/CC_V1_PRODUCT_BRIEF_2026-04-25.md`

Old pre-reset standby roadmap is archived at:
- `docs/ROADMAP_ARCHIVE_PRE_V1_RESET_2026-04-25.md`

## STRICT ACTIVE QUEUE

- [x] Implement CC v1 Phase 1: refine the `ccdesign` Challenge Hub + Completion/Share prototype around the side-quest product core.
  - added_at: 2026-04-25 23:00 Europe/Stockholm
  - completed_at: 2026-04-25 23:18 Europe/Stockholm
  - estimate: 1 focused design/build run
  - Acceptance:
    - Challenge Hub immediately communicates “Pick your next bad idea.”
    - Completion/Share screen feels like a collectible viral proof card, not a dashboard result.
    - Challenge Detail balances funny concept with precise rules for `Queen? Never Heard of Her`.
    - Landing answers the 10-second test: what it is, how it works, why it is fun.
    - No PGN upload, engine-analysis, formal-training, or SaaS-dashboard framing appears.
  - Verification: `pnpm build` passed in `ccdesign`; local `/`, `/concepts/weird-dare-network`, and `/concepts/blundercheck-mobile-first` returned 200 and contained `BlunderCheck` + `Pick your next bad idea`; proof note exists at `ccdesign/docs/BLUNDERCHECK_PHASE_1_PROTOTYPE_REVIEW_2026-04-25.md`.

- [ ] Implement CC v1 Phase 2: replace the real `cc` starter scaffold with a static BlunderCheck MVP shell.
  - added_at: 2026-04-25 23:00 Europe/Stockholm
  - estimate: 1-2 focused implementation runs
  - Acceptance:
    - `cc` has real product routes or sections for landing, challenge hub, challenge detail, result/share, and connect-account/onboarding.
    - Starter Next.js copy is removed.
    - Challenge data is modeled in code with the starter challenge library.
    - Visual/copy direction matches `docs/CC_V1_PRODUCT_BRIEF_2026-04-25.md`.
  - Verification for completion: relevant `pnpm` checks pass in `cc`; local route checks pass; commit/proof note records changed surfaces.

- [ ] Implement CC v1 Phase 3: design the lightweight Lichess/Chess.com account flow and active challenge state.
  - added_at: 2026-04-25 23:00 Europe/Stockholm
  - estimate: 1 focused implementation run
  - Acceptance:
    - user can understand connect/select platform flow without technical friction
    - active challenge state shows recent-game checking and success/failure examples
    - no manual PGN or import path exists
  - Verification for completion: build checks + route checks.

## Proof rules

- Do not claim public/live progress until a live URL is deployed and smoke-verified.
- Design progress is valid when the artifact exists and `ccdesign` builds.
- Implementation progress is valid when `cc` checks pass and changed routes are inspectable.
- If the work starts feeling like chess analysis, stop and re-center on side quests.
