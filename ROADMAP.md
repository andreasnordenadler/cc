# CC Roadmap

Last updated: 2026-04-25 23:34 Europe/Stockholm  
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

- [x] Implement CC v1 Phase 2: replace the real `cc` starter scaffold with a static BlunderCheck MVP shell.
  - added_at: 2026-04-25 23:00 Europe/Stockholm
  - completed_at: 2026-04-25 23:34 Europe/Stockholm
  - estimate: 1-2 focused implementation runs
  - Acceptance:
    - `cc` has real product routes or sections for landing, challenge hub, challenge detail, result/share, and connect-account/onboarding.
    - Starter Next.js copy is removed.
    - Challenge data is modeled in code with the starter challenge library.
    - Visual/copy direction matches `docs/CC_V1_PRODUCT_BRIEF_2026-04-25.md`.
  - Verification: `pnpm lint` and `pnpm build` passed in `cc`; local route checks passed for `/`, `/challenges`, `/challenges/queen-never-heard-of-her`, `/connect`, `/result`, and `/account`; proof note exists at `docs/BLUNDERCHECK_V1_STATIC_SHELL_2026-04-25.md`.

- [x] Implement CC v1 Phase 3: design the lightweight Lichess/Chess.com account flow and active challenge state.
  - added_at: 2026-04-25 23:00 Europe/Stockholm
  - completed_at: 2026-04-26 10:53 Europe/Stockholm
  - estimate: 1 focused implementation run
  - Acceptance:
    - user can understand connect/select platform flow without technical friction
    - active challenge state shows recent-game checking and success/failure examples
    - no manual PGN or import path exists
  - Verification for completion: build checks + route checks.
  - Proof: added the active challenge checker to `/account`, challenge-detail latest-check affordances, and a `checkActiveChallenge()` server action that records passed/failed/pending latest-game examples without PGN upload/import framing; verified `pnpm lint`, `pnpm build`, and local route smoke for `/`, `/connect`, `/account`, `/challenges/queen-never-heard-of-her`, and `/result`; proof note exists at `docs/BLUNDERCHECK_V1_ACTIVE_CHALLENGE_FLOW_2026-04-26.md`.

- [x] Implement CC v1 Phase 4: spike the first real rule-backed verifier for `Queen? Never Heard of Her`.
  - added_at: 2026-04-26 11:40 Europe/Stockholm
  - completed_at: 2026-04-26 11:46 Europe/Stockholm
  - estimate: 1 bounded verification spike
  - Acceptance:
    - define the smallest provider-normalized game shape needed to verify the canonical challenge
    - implement a deterministic checker for queen-lost-before-move-15, opponent queen still present, minimum game length, allowed time classes, standard chess, and player win
    - connect the active-check placeholder to the rule-backed queenless fixtures so the first challenge no longer uses pure hand-written verification text
    - document limitations and the next adapter step without adding PGN upload or engine-analysis framing
  - Verification: `node --experimental-strip-types --test tests/queen-never-heard-of-her-fixtures.mjs`, `pnpm lint`, `pnpm build`, and local route smoke for `/`, `/challenges`, `/challenges/queen-never-heard-of-her`, and `/account`.
  - Proof: rule checker and deterministic fixtures exist in `src/lib/queen-never-heard-of-her.ts` and `tests/queen-never-heard-of-her-fixtures.mjs`; `checkActiveChallenge()` now uses the checker for the canonical challenge; proof note exists at `docs/BLUNDERCHECK_V1_QUEENLESS_VERIFICATION_SPIKE_2026-04-26.md`.

- [x] Implement CC v1 Phase 5: wire the queenless verifier to Lichess latest-game normalization.
  - added_at: 2026-04-26 13:40 Europe/Stockholm
  - completed_at: 2026-04-26 13:50 Europe/Stockholm
  - estimate: 1 bounded integration burst
  - Acceptance:
    - active `Queen? Never Heard of Her` checks use real Lichess latest-game data when a Lichess username is stored
    - Lichess NDJSON/UCI game exports normalize into the existing provider-neutral queen challenge shape
    - deterministic tests prove UCI captures become queen-loss evidence
    - keep the no-username fixture fallback so the review prototype remains usable without credentials
    - document limitations and next adapter step without adding PGN upload or engine-analysis framing
  - Verification: `node --experimental-strip-types --test tests/queen-never-heard-of-her-fixtures.mjs`, `pnpm lint`, `pnpm build`, and local route smoke for `/`, `/challenges`, `/challenges/queen-never-heard-of-her`, `/connect`, `/account`, and `/result`.
  - Proof: Lichess latest-game adapter and UCI capture normalizer exist in `src/lib/queen-never-heard-of-her.ts`; `/account` active checker now uses real Lichess latest-game lookup when a Lichess username is saved; proof note exists at `docs/BLUNDERCHECK_V1_LICHESS_LATEST_QUEENLESS_ADAPTER_2026-04-26.md`.

- [x] Implement CC v1 Phase 6: make `/result` reflect the saved latest verifier attempt instead of a static demo proof card.
  - added_at: 2026-04-26 14:40 Europe/Stockholm
  - completed_at: 2026-04-26 14:48 Europe/Stockholm
  - estimate: 1 bounded product-loop polish burst
  - Acceptance:
    - result/share screen reads the signed-in user's latest saved challenge attempt when present
    - passed, failed, pending, and empty states do not falsely claim a static success
    - share copy uses the matching challenge title/reward/badge context
    - page links back to `/account` for the latest-games checker and to the active challenge rules
  - Verification: `pnpm lint`, `pnpm build`, and local route smoke for `/result`, `/account`, and `/challenges/queen-never-heard-of-her`.
  - Proof: `/result` now uses `currentUser()`, saved public metadata, `getLatestChallengeAttempt()`, `getChallengeProgress()`, and `buildAttemptSummary()` to render a dynamic proof card; proof note exists at `docs/BLUNDERCHECK_V1_DYNAMIC_RESULT_PROOF_CARD_2026-04-26.md`.

## Proof rules

- Do not claim public/live progress until a live URL is deployed and smoke-verified.
- Design progress is valid when the artifact exists and `ccdesign` builds.
- Implementation progress is valid when `cc` checks pass and changed routes are inspectable.
- If the work starts feeling like chess analysis, stop and re-center on side quests.
