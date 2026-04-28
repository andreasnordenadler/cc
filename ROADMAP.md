# CC Roadmap

Last updated: 2026-04-28 09:28 Europe/Stockholm
Owner: Sam  
Status: active — three-project focus

## Mission

Build CC / Side Quest Chess into a playful chess side-quest product:

> **Chess, but with stupidly hard side quests.**

Users pick ridiculous chess challenges, play real games on Lichess or Chess.com, and Side Quest Chess verifies whether they completed the challenge so they can earn points, badges, streaks, and shareable proof.

## Current product canon

- Production public name: **Side Quest Chess**
- Primary domain: **sidequestchess.com**
- Backup domain: **sqchess.com**
- Internal lane/repo name: **CC**
- Former working/mockup name: **BlunderCheck**
- Correct feel: a smart chess friend daring you to do something dumb
- Primary loop: pick challenge → play real chess elsewhere → automatic verification → success/failure result → points/badge/share/friend challenge
- Main anti-goals: no engine dashboard, no PGN upload, no formal training product, no corporate SaaS layout

Canonical brief:
- `docs/CC_V1_PRODUCT_BRIEF_2026-04-25.md`

Old pre-reset standby roadmap is archived at:
- `docs/ROADMAP_ARCHIVE_PRE_V1_RESET_2026-04-25.md`

## STRICT ACTIVE QUEUE

- [x] Make the login/profile setup path testable for end-to-end SQC UX.
  - added_at: 2026-04-28 09:20 Europe/Stockholm
  - completed_at: 2026-04-28 09:28 Europe/Stockholm
  - source: Andreas wants to test logging in, editing profile, adding Lichess username, doing quests, and checking results.
  - Acceptance:
    - Dedicated `/sign-in` and `/sign-up` routes exist for Clerk auth.
    - Nav exposes explicit Sign in / Connect actions when signed out and a profile/user menu when signed in.
    - `/profile` lets a signed-in runner save display name, brag line, Lichess username, and Chess.com username.
    - `/account` links to profile editing and keeps the quest/check/result loop visible.
  - Verification: `pnpm lint`, `pnpm build`, production smoke for `/sign-in`, `/sign-up`, `/profile`, `/account`, and `/connect`.

- [x] Implement CC v1 Phase 32: promote The Blunder Gambit to a live Lichess latest-game verifier.
  - added_at: 2026-04-28 08:40 Europe/Stockholm
  - completed_at: 2026-04-28 08:50 Europe/Stockholm
  - estimate: 1 bounded verifier/product-trust burst
  - Acceptance:
    - `The Blunder Gambit` checks real Lichess latest-game move history for player wins after an early unbalanced knight/bishop/rook loss by move 10.
    - UCI move normalization derives capture evidence without PGN upload, engine analysis, or fake-success framing.
    - Active challenge latest-game checks use the live Blunder Gambit verifier when a Lichess username is saved, with deterministic fallback fixtures for review.
    - `/verifiers` and verifier badges mark `The Blunder Gambit` as live-backed, completing live-backed status across the starter deck.
  - Verification: `node --experimental-strip-types --test tests/queen-never-heard-of-her-fixtures.mjs tests/no-castle-club-fixtures.mjs tests/pawn-storm-maniac-fixtures.mjs tests/knightmare-mode-fixtures.mjs tests/rookless-rampage-fixtures.mjs tests/one-bishop-to-rule-them-all-fixtures.mjs tests/the-blunder-gambit-fixtures.mjs`, `pnpm lint`, `pnpm build`, production deploy, production smoke for `https://sidequestchess.com/verifiers`, `/challenges/the-blunder-gambit`, `/account`, and `/api/og/dare/the-blunder-gambit`, plus bounded Vercel production error-log scan.
  - Proof: new verifier module `src/lib/the-blunder-gambit.ts`, fixture tests `tests/the-blunder-gambit-fixtures.mjs`, active checker wiring in `src/app/actions.ts`, status update in `src/lib/verifier-status.ts`; live deployment `https://cc-op1r9vtsq-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; production smoke passed for `/verifiers`, `/challenges/the-blunder-gambit`, `/account`, and `/api/og/dare/the-blunder-gambit`; Vercel production error-log scan returned 0 error log lines; proof note `docs/SQC_BLUNDER_GAMBIT_LICHESS_VERIFIER_LIVE_DEPLOY_2026-04-28.md`.

- [x] Enlarge the right-side chessboard watermark squares 5x.
  - added_at: 2026-04-28 08:27 Europe/Stockholm
  - completed_at: 2026-04-28 08:28 Europe/Stockholm
  - source: Andreas liked the right-side chessboard watermark and asked for squares five times larger.
  - Acceptance:
    - Checker tile size increases from 56px to 280px.
    - Fade, right alignment, and existing left SQC logo watermark remain intact.
  - Verification: `pnpm lint`, `pnpm build`, production CSS smoke confirming `280px 280px`.

- [x] Add right-side fading chessboard watermark to the Side Quest Chess landing background.
  - added_at: 2026-04-28 08:19 Europe/Stockholm
  - completed_at: 2026-04-28 08:24 Europe/Stockholm
  - source: Andreas asked for a chess-board pattern watermark aligned to the right side, fading out toward the middle, while keeping the existing left logo watermark.
  - Acceptance:
    - Right side of the viewport has a subtle chessboard pattern watermark.
    - Pattern fades toward the middle and does not interfere with content or clicks.
    - Existing left SQC logo watermark remains unchanged.
  - Verification: `pnpm lint`, `pnpm build`, production deploy smoke confirming CSS contains the right-side chessboard pseudo-element.

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
  - Verification: `pnpm build` passed in `ccdesign`; local `/`, `/concepts/weird-dare-network`, and `/concepts/blundercheck-mobile-first` returned 200 and contained `Side Quest Chess` + `Pick your next bad idea`; proof note exists at `ccdesign/docs/BLUNDERCHECK_PHASE_1_PROTOTYPE_REVIEW_2026-04-25.md`.

- [x] Implement CC v1 Phase 2: replace the real `cc` starter scaffold with a static Side Quest Chess MVP shell.
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

- [x] Implement CC v1 Phase 7: add copy/native-share actions to the dynamic result proof card.
  - added_at: 2026-04-26 15:40 Europe/Stockholm
  - completed_at: 2026-04-26 15:47 Europe/Stockholm
  - estimate: 1 bounded product-loop polish burst
  - Acceptance:
    - `/result` has an obvious copy action for the current proof-card text
    - native sharing is used when the browser supports it, with clipboard fallback
    - pending/failed/passed result states reuse the same dynamic share text rather than static fake-success copy
    - no PGN upload, engine-analysis, or manual-import framing appears
  - Verification: `pnpm lint`, `pnpm build`, and local route smoke for `/result`, `/account`, and `/challenges/queen-never-heard-of-her`.
  - Proof: `ShareProofActions` adds `Copy receipt` and `Share dare` to `/result`; proof note exists at `docs/BLUNDERCHECK_V1_SHARE_ACTIONS_2026-04-26.md`.

- [x] Implement CC v1 Phase 8: give every challenge a unique collectible badge identity.
  - added_at: 2026-04-26 16:34 Europe/Stockholm
  - completed_at: 2026-04-26 16:58 Europe/Stockholm
  - source: Andreas suggested unique badges for every challenge now that Sam has image creation skills.
  - estimate: 1-2 bounded design/build bursts
  - Acceptance:
    - challenge data includes a stable badge identity for every starter challenge
    - challenge hub and detail pages show distinct badge art/tokens instead of generic reward copy
    - result/share proof card uses the completed challenge badge prominently
    - visual system supports generated or hand-authored badge assets without blocking product iteration
    - badges feel collectible, playful, and side-quest-native, not corporate achievement icons
  - Verification for completion: generated/design artifact proof + `pnpm lint` + `pnpm build` + local route smoke for `/challenges`, canonical challenge detail, `/result`, and `/account`.
  - Proof: added stable badge identity metadata for every starter challenge plus reusable `ChallengeBadge` UI tokens across hub/detail/home/result; verified `pnpm lint`, `pnpm build`, and local route smoke for `/challenges`, `/challenges/queen-never-heard-of-her`, `/result`, and `/account`; proof note exists at `docs/BLUNDERCHECK_V1_COLLECTIBLE_BADGE_IDENTITY_2026-04-26.md`.

- [x] Implement CC v1 Phase 9: convert challenge badges into meaningful SQC coat-of-arms badges.
  - added_at: 2026-04-26 16:56 Europe/Stockholm
  - completed_at: 2026-04-26 17:08 Europe/Stockholm
  - source: Andreas wants every Side Quest Chess badge to be a coat of arms inspired by the Nordenadler coat of arms style, where every symbol means something and represents the individual challenge.
  - estimate: 1-2 bounded design/build bursts
  - Acceptance:
    - badge data includes heraldic fields for every starter challenge: shield field, charge, crest, motto, and meaning
    - badge UI reads as a coat-of-arms/shield rather than a generic token
    - challenge hub/detail/result/account surfaces expose each badge's symbolic meaning
    - generated concept art explores the SQC heraldic badge family without copying the Nordenadler family arms
    - short form **SQC** is acknowledged in docs/product copy where useful
  - Verification: generated one queenless heraldic badge concept, `pnpm lint`, `pnpm build`, and local route smoke for `/`, `/challenges`, `/challenges/queen-never-heard-of-her`, `/result`, and `/account`.
  - Proof: badge data now includes heraldic shield/charge/crest/motto/meaning/weirdness fields; `ChallengeBadge` now renders a coat-of-arms-style shield/ribbon token; hub/detail/result/account expose symbolic badge meaning and SQC weirdness; proof note exists at `docs/SQC_HERALDIC_BADGE_DIRECTION_2026-04-26.md`.

- [x] Add Andreas's temporary SQC logo to the real Side Quest Chess shell.
  - added_at: 2026-04-26 21:02 Europe/Stockholm
  - completed_at: 2026-04-26 21:08 Europe/Stockholm
  - source: Andreas shared a temporary logo from ChatGPT for SQC.
  - Acceptance:
    - temporary logo asset is saved in the app public assets
    - landing page and nav use the temporary logo without replacing the product name/copy
    - implementation remains easy to swap later for a final simplified mark
  - Verification: `pnpm lint`, `pnpm build`, and local homepage smoke.
  - Proof: saved `public/sqc-temp-logo.jpg`; `SiteNav` uses it as the temporary brand mark and `/` shows it prominently in the hero.

- [x] Implement CC v1 Phase 10: wire the Side Quest Chess production domain.
  - added_at: 2026-04-26 16:43 Europe/Stockholm
  - source: Andreas chose the final production name and bought `sidequestchess.com` plus backup `sqchess.com`.
  - estimate: 1 bounded domain/deploy setup burst
  - Acceptance:
    - Vercel/project configuration recognizes `sidequestchess.com` as the primary production domain
    - `sqchess.com` is either configured as a redirect/backup or documented with the exact missing DNS/setup step
    - public product copy and metadata use Side Quest Chess, not BlunderCheck
    - old `cc-taupe-kappa.vercel.app` remains only a temporary technical alias during transition
  - Verification for completion: `pnpm lint`, `pnpm build`, production deploy if needed, DNS/domain status evidence, and live smoke checks for the primary domain before claiming it is live.
  - 2026-04-26 17:46 Europe/Stockholm: added `sidequestchess.com`, `www.sidequestchess.com`, `sqchess.com`, and `www.sqchess.com` to the Vercel `cc` project; updated canonical metadata/user-agent/backup redirects; verified `pnpm lint`, `pnpm build`, production deploy `https://cc-a0tw4oo49-andreas-nordenadlers-projects.vercel.app`, temporary deploy route smoke, and redirect host probes. Not complete yet: public DNS still points to GoDaddy parking/DPS records instead of Vercel. Proof/blocker note: `docs/SQC_PRODUCTION_DOMAIN_WIRING_BLOCKED_ON_DNS_2026-04-26.md`.
  - 2026-04-26 19:42 Europe/Stockholm: rechecked Phase 10 DNS/domain status; `pnpm lint` and `pnpm build` passed, Vercel still shows all four domains attached to `cc`, but public DNS/nameservers still point to GoDaddy parking/DPS records. Phase remains blocked on registrar DNS change (`A <host> 76.76.21.21` or Vercel nameservers). Updated proof/blocker note: `docs/SQC_PRODUCTION_DOMAIN_WIRING_BLOCKED_ON_DNS_2026-04-26.md`.
  - 2026-04-26 20:44 Europe/Stockholm: corrected primary `sidequestchess.com` DNS inside Vercel DNS by adding explicit `A @ 76.76.21.21` and `CNAME www cname.vercel-dns.com`; authoritative Vercel DNS and Cloudflare `1.1.1.1` now resolve primary hosts to Vercel, and pinned Vercel-edge smoke passed for `/`, `/challenges`, `/challenges/queen-never-heard-of-her`, `/connect`, `/account`, and `/result`. `pnpm lint` and `pnpm build` passed. Phase remains open until unpinned public smoke clears local DNS cache/propagation and the GoDaddy-side `sqchess.com` redirect is confirmed separately. Updated proof note: `docs/SQC_PRODUCTION_DOMAIN_WIRING_BLOCKED_ON_DNS_2026-04-26.md`.
  - 2026-04-26 21:45 Europe/Stockholm: rechecked Phase 10; `pnpm lint` and `pnpm build` passed, public DNS now shows `sidequestchess.com` on Vercel nameservers with A `216.198.79.1`, and pinned Vercel-edge smoke passed for `/`, `/challenges`, `/challenges/queen-never-heard-of-her`, `/connect`, `/account`, and `/result`. Local macOS resolver still serves cached GoDaddy/DPS addresses on unpinned `curl`, so Phase remains open until local/public unpinned smoke is clean; `sqchess.com` remains GoDaddy-side redirect scope, not Vercel-hosted. Updated proof note: `docs/SQC_PRODUCTION_DOMAIN_WIRING_BLOCKED_ON_DNS_2026-04-26.md`.
  - completed_at: 2026-04-26 22:48 Europe/Stockholm
  - 2026-04-26 22:48 Europe/Stockholm: unpinned public smoke is now clean from this environment. Local and Cloudflare DNS resolve `sidequestchess.com` to Vercel A `216.198.79.1`; `https://sidequestchess.com/`, `/challenges`, `/challenges/queen-never-heard-of-her`, `/connect`, `/account`, and `/result` all returned live Side Quest Chess content; `www.sidequestchess.com/challenges` 308s to the primary host; `sqchess.com` performs the intended GoDaddy 301 to `sidequestchess.com`. `pnpm lint` and `pnpm build` passed. Proof note updated: `docs/SQC_PRODUCTION_DOMAIN_WIRING_BLOCKED_ON_DNS_2026-04-26.md`.

- [x] Implement CC v1 Phase 11: add a live SQC badge vault for the coat-of-arms challenge collection.
  - added_at: 2026-04-26 23:40 Europe/Stockholm
  - completed_at: 2026-04-26 23:48 Europe/Stockholm
  - estimate: 1 bounded product-loop polish burst
  - Acceptance:
    - `/badges` gives every starter challenge a browseable coat-of-arms vault card
    - homepage and nav expose the badge vault as a first-class product surface
    - badge cards explain shield, charge, motto, meaning, reward, quest, and earned/unearned state
    - signed-in users see earned badge count and saved reward points
  - Verification: `pnpm lint`, `pnpm build`, local route smoke for `/`, `/badges`, `/challenges`, and `/result`, production deploy, production smoke for `https://sidequestchess.com/`, `/badges`, `/challenges`, and `/result`, and Vercel 500 scan.
  - Proof: new route `src/app/badges/page.tsx`, nav/home links, live deployment `https://cc-659ab1nun-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, proof note `docs/SQC_BADGE_VAULT_LIVE_DEPLOY_2026-04-26.md`.

- [x] Implement CC v1 Phase 12: add challenge-specific friend-dare links.
  - added_at: 2026-04-27 00:40 Europe/Stockholm
  - completed_at: 2026-04-27 00:55 Europe/Stockholm
  - estimate: 1 bounded viral-loop polish burst
  - Acceptance:
    - every challenge can be shared as a direct friend dare, not just a generic product link
    - challenge detail pages expose a friend-dare page and copy/native-share actions
    - `/dare/[id]` gives recipients a focused accept-the-bad-idea landing page with badge reward, rules, and CTAs
    - no PGN upload, engine-analysis, or serious training framing appears
  - Verification: `pnpm lint`, `pnpm build`, production deploy, production smoke for `https://sidequestchess.com/dare/queen-never-heard-of-her`, `/challenges/queen-never-heard-of-her`, `/challenges`, and `/result`, plus Vercel recent log scan.
  - Proof: new route `src/app/dare/[id]/page.tsx`, new `ChallengeInviteActions` component, challenge detail sharing surface, live deployment `https://cc-r1a7wzod0-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, proof note `docs/SQC_FRIEND_DARE_LINKS_LIVE_DEPLOY_2026-04-27.md`.

- [x] Implement CC v1 Phase 13: add challenge-specific social metadata for dare links.
  - added_at: 2026-04-27 01:40 Europe/Stockholm
  - completed_at: 2026-04-27 01:56 Europe/Stockholm
  - estimate: 1 bounded viral-loop deploy burst
  - Acceptance:
    - challenge detail and friend-dare URLs expose specific canonical, Open Graph, and Twitter metadata
    - starter dare pages are statically generated for fast/shareable recipient links
    - shared links preview the exact challenge/reward/badge instead of a generic SQC homepage pitch
    - no PGN upload, engine-analysis, or serious training framing appears
  - Verification: `pnpm lint`, `pnpm build`, local metadata smoke for `/dare/queen-never-heard-of-her` and `/challenges/queen-never-heard-of-her`, production deploy, production metadata smoke for `https://sidequestchess.com/dare/queen-never-heard-of-her`, `/challenges/queen-never-heard-of-her`, and `/dare/no-castle-club`, plus Vercel 500 scan.
  - Proof: dynamic metadata in `src/app/dare/[id]/page.tsx` and `src/app/challenges/[id]/page.tsx`; live deployment `https://cc-pe7m0hy3j-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; proof note `docs/SQC_DARE_LINK_SOCIAL_METADATA_LIVE_DEPLOY_2026-04-27.md`.

- [x] Implement CC v1 Phase 14: add challenge-specific OG image cards for dare/share previews.
  - added_at: 2026-04-27 02:40 Europe/Stockholm
  - completed_at: 2026-04-27 02:44 Europe/Stockholm
  - estimate: 1 bounded viral-loop deploy burst
  - Acceptance:
    - friend-dare URLs expose a generated challenge-specific social preview image
    - challenge detail URLs reuse the same exact badge/reward/challenge image instead of generic preview art
    - image endpoint renders a 1200x630 SQC card with challenge title, objective, reward, and coat-of-arms badge motif
    - no PGN upload, engine-analysis, or serious training framing appears
  - Verification: `pnpm lint`, `pnpm build`, local smoke for `/api/og/dare/queen-never-heard-of-her`, `/dare/queen-never-heard-of-her`, and `/challenges/queen-never-heard-of-her`, production deploy, production smoke for `https://sidequestchess.com/api/og/dare/queen-never-heard-of-her`, `/dare/queen-never-heard-of-her`, `/challenges/queen-never-heard-of-her`, and `/dare/no-castle-club`, metadata tag checks, plus Vercel 500/501/502/503/504 log scan.
  - Proof: dynamic image endpoint `src/app/api/og/dare/[id]/route.tsx`; metadata updates in `src/app/dare/[id]/page.tsx` and `src/app/challenges/[id]/page.tsx`; live deployment `https://cc-803lzzur6-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; proof note `docs/SQC_DARE_LINK_OG_IMAGE_CARDS_LIVE_DEPLOY_2026-04-27.md`.

- [x] Implement CC v1 Phase 15: add per-receipt sharing to the proof log.
  - added_at: 2026-04-27 11:40 Europe/Stockholm
  - completed_at: 2026-04-27 11:54 Europe/Stockholm
  - estimate: 1 bounded proof-loop polish burst
  - Acceptance:
    - saved proof-log attempts expose copy/native-share actions, not only the latest `/result` card
    - passed, failed, and pending receipt copy reflects the saved attempt status honestly
    - proof-log sharing links back to `/proof-log` while result-card sharing continues to link to `/result`
    - no PGN upload, engine-analysis, or serious training framing appears
  - Verification: `pnpm lint`, `pnpm build`, local route smoke for `/proof-log`, `/result`, and `/scoreboard`, production deploy, production smoke for `https://sidequestchess.com/proof-log`, `/result`, `/scoreboard`, and `/api/og/dare/queen-never-heard-of-her`, plus Vercel production 500 scan.
  - Proof: reusable `ShareProofActions` now supports custom share destinations/labels; `/proof-log` renders per-receipt share controls for saved attempts; live deployment `https://cc-hg4o1q5g9-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; proof note `docs/SQC_PROOF_LOG_RECEIPT_SHARING_LIVE_DEPLOY_2026-04-27.md`.

- [x] Implement CC v1 Phase 15: add a shared daily dare surface.
  - added_at: 2026-04-27 03:40 Europe/Stockholm
  - completed_at: 2026-04-27 03:45 Europe/Stockholm
  - estimate: 1 bounded viral-loop deploy burst
  - Acceptance:
    - `/today` gives everyone the same daily Side Quest Chess challenge ritual
    - homepage and nav expose Today as a first-class surface
    - daily page shows the challenge, badge target, rules, reward, and share actions
    - share copy points to the daily ritual rather than a generic homepage link
    - no PGN upload, engine-analysis, or serious training framing appears
  - Verification: `pnpm lint`, `pnpm build`, local route smoke for `/`, `/today`, `/challenges`, and `/dare/queen-never-heard-of-her`; production deploy; production smoke for `https://sidequestchess.com/`, `/today`, `/challenges`, `/dare/queen-never-heard-of-her`, and `/api/og/dare/queen-never-heard-of-her`; Vercel production 500/501/502/503/504 log scan.
  - Proof: new route `src/app/today/page.tsx`, deterministic daily selector in `src/lib/challenges.ts`, nav/home links, live deployment `https://cc-dg9i5ts54-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, proof note `docs/SQC_DAILY_DARE_LIVE_DEPLOY_2026-04-27.md`.


- [x] Implement CC v1 Phase 16: add challenge-specific social previews to the daily dare.
  - added_at: 2026-04-27 04:40 Europe/Stockholm
  - completed_at: 2026-04-27 04:46 Europe/Stockholm
  - estimate: 1 bounded viral-loop deploy burst
  - Acceptance:
    - `/today` metadata names the current deterministic daily challenge instead of using generic daily-page copy
    - daily dare Open Graph and Twitter cards reuse the challenge-specific `/api/og/dare/[id]` image
    - shared daily links preview the exact challenge, reward, and badge target
    - no PGN upload, engine-analysis, or serious training framing appears
  - Verification: `pnpm lint`, `pnpm build`, local production smoke for `/today`, `/api/og/dare/queen-never-heard-of-her`, and `/challenges/queen-never-heard-of-her`; production deploy; production smoke for `https://sidequestchess.com/today`, `/api/og/dare/queen-never-heard-of-her`, `/challenges/queen-never-heard-of-her`, and `/dare/queen-never-heard-of-her`; Vercel 500/501/502/503/504 log scan.
  - Proof: `/today` now uses `generateMetadata()` with the current daily challenge and challenge-specific OG/Twitter image tags; live deployment `https://cc-c5epbz50k-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; proof note `docs/SQC_DAILY_DARE_SOCIAL_PREVIEW_LIVE_DEPLOY_2026-04-27.md`.

- [x] Implement CC v1 Phase 17: add a random dare machine for instant friend challenges.
  - added_at: 2026-04-27 05:40 Europe/Stockholm
  - completed_at: 2026-04-27 05:49 Europe/Stockholm
  - estimate: 1 bounded viral-loop deploy burst
  - Acceptance:
    - `/random` lets visitors spin through starter challenges without browsing the full hub
    - selected random challenges expose accept-quest and friend-dare CTAs
    - homepage and nav surface the random-dare machine as a quick-start path
    - share copy stays challenge-specific and points to exact friend-dare URLs
    - no PGN upload, engine-analysis, or serious training framing appears
  - Verification: `pnpm lint`, `pnpm build`, local production smoke for `/random`, `/`, `/challenges`, and `/api/og/dare/queen-never-heard-of-her`; production deploy; production smoke for `https://sidequestchess.com/random`, `/`, `/challenges`, `/dare/queen-never-heard-of-her`, and `/api/og/dare/queen-never-heard-of-her`; Vercel 500/501/502/503/504 log scan.
  - Proof: new route `src/app/random/page.tsx`, new client component `src/components/challenge-roulette.tsx`, nav/home CTAs, live deployment `https://cc-4p4vzgdv8-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; proof note `docs/SQC_RANDOM_DARE_MACHINE_LIVE_DEPLOY_2026-04-27.md`.

- [x] Implement CC v1 Phase 18: add a saved proof-log surface for verifier receipts.
  - added_at: 2026-04-27 06:40 Europe/Stockholm
  - completed_at: 2026-04-27 06:47 Europe/Stockholm
  - estimate: 1 bounded product-loop deploy burst
  - Acceptance:
    - `/proof-log` gives signed-in players a receipt history for saved latest-game verifier attempts
    - passed, failed, pending, and empty states stay honest and do not imply fake success
    - homepage and nav expose the proof log as part of the share/proof loop
    - no PGN upload, engine-analysis, or serious training framing appears
  - Verification: `pnpm lint`, `pnpm build`, local route smoke for `/`, `/proof-log`, `/result`, `/account`, and `/challenges`; production deploy; production smoke for `https://sidequestchess.com/`, `/proof-log`, `/result`, `/account`, and `/challenges`; Vercel 500/501/502/503/504 log scan.
  - Proof: new route `src/app/proof-log/page.tsx`, nav/home links, live deployment `https://cc-cy3dlov3o-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; proof note `docs/SQC_PROOF_LOG_LIVE_DEPLOY_2026-04-27.md`.


- [x] Implement CC v1 Phase 19: add a starter path for first-time challenge onboarding.
  - added_at: 2026-04-27 08:40 Europe/Stockholm
  - completed_at: 2026-04-27 08:55 Europe/Stockholm
  - estimate: 1 bounded onboarding/product-loop deploy burst
  - Acceptance:
    - `/path` gives first-time players one obvious three-step route through the challenge loop
    - homepage and nav expose the starter path as a first-class entry point
    - starter steps use existing challenge/badge data and signed-in progress where available
    - copy stays playful and side-quest-native, with no PGN upload, engine-analysis, or serious training framing
  - Verification: `pnpm lint`, `pnpm build`, production deploy, production smoke for `https://sidequestchess.com/path`, `/`, `/challenges`, and `/api/og/dare/queen-never-heard-of-her`; Vercel recent 500/501/502/503/504 log scan.
  - Proof: new route `src/app/path/page.tsx`, nav/home links, live deployment `https://cc-i6zroa8nx-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; proof note `docs/SQC_STARTER_PATH_LIVE_DEPLOY_2026-04-27.md`.

- [x] Implement CC v1 Phase 20: add a public quest scoreboard for starter-deck progress.
  - added_at: 2026-04-27 09:40 Europe/Stockholm
  - completed_at: 2026-04-27 09:55 Europe/Stockholm
  - estimate: 1 bounded product-loop deploy burst
  - Acceptance:
    - `/scoreboard` summarizes starter-deck score, deck value, badge progress, difficulty spread, and recommended next dare
    - signed-in users see saved Clerk public-metadata progress where available while signed-out users still get useful deck-level context
    - homepage and nav expose the scoreboard as a first-class Side Quest Chess surface
    - copy stays playful and side-quest-native, with no PGN upload, engine-analysis, or serious training framing
  - Verification: `pnpm lint`, `pnpm build`, local route smoke for `/`, `/scoreboard`, `/challenges`, and `/proof-log`; production deploy; production smoke for `https://sidequestchess.com/scoreboard`, `/`, `/challenges`, and `/proof-log`; bounded Vercel 500/501/502/503/504 log scan.
  - Proof: new route `src/app/scoreboard/page.tsx`, nav/home links, live deployment `https://cc-cxoaoo4im-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; proof note `docs/SQC_SCOREBOARD_LIVE_DEPLOY_2026-04-27.md`.

- [x] Implement CC v1 Phase 21: convert all challenge badges to Andreas's illustrated heraldic badge style.
  - added_at: 2026-04-27 10:25 Europe/Stockholm
  - completed_at: 2026-04-27 10:59 Europe/Stockholm
  - source: Andreas supplied the new `Queen? Never Heard of Her` badge and said this is the style wanted for all badges.
  - estimate: 1-2 bounded badge-art/product-surface bursts
  - Acceptance:
    - supplied queenless badge is saved as the canonical art reference and used by the queenless challenge
    - every starter challenge gets a matching high-detail illustrated coat-of-arms badge asset, not only CSS token placeholders
    - all badge assets use transparent backgrounds and avoid square/card backgrounds
    - badge compositions are freestanding heraldic emblems; avoid box-inside-box framing unless the inner box is clearly the shield itself
    - badge generation/design prompts follow the new canon: ornate heraldic shield, black/gold linework, saturated challenge accent, weird chess symbolism, motto ribbon, collectible fantasy feel
    - challenge hub/detail/badges/result/dare/scoreboard surfaces render final image assets consistently with accessible fallback text
    - generated/final assets are documented so future badges can match the same style
  - Verification for completion: generated or supplied image assets for all starter challenges, `pnpm lint`, `pnpm build`, local route smoke for `/badges`, `/challenges`, `/challenges/queen-never-heard-of-her`, `/result`, `/dare/queen-never-heard-of-her`, `/scoreboard`; production deploy and smoke before claiming live.
  - 2026-04-27 10:27 Europe/Stockholm: saved Andreas's supplied reference image as `public/badges/queen-never-heard-of-her-style-reference.jpg`, wired it into `badgeIdentity.image` for the queenless challenge, and documented the new badge style canon in `docs/SQC_BADGE_STYLE_CANON_2026-04-27.md`. Verified `pnpm lint`, `pnpm build`, local smoke for `/badges`, `/challenges`, `/challenges/queen-never-heard-of-her`, `/result`, `/dare/queen-never-heard-of-her`, `/scoreboard`, deployed production `https://cc-bb3hx0ed1-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, production smoke passed for the same routes plus the image asset, and Vercel production error log scan returned no logs.
  - 2026-04-27 10:59 Europe/Stockholm: generated six matching illustrated heraldic badge assets for the rest of the starter deck (`No Castle Club`, `The Blunder Gambit`, `Pawn Storm Maniac`, `Knightmare Mode`, `Rookless Rampage`, and `One Bishop to Rule Them All`), saved them under `public/badges/`, wired them into `badgeIdentity.image`, and updated the badge style canon. Verified `pnpm lint`, `pnpm build`, local smoke for `/badges`, `/challenges`, `/challenges/queen-never-heard-of-her`, `/result`, `/dare/queen-never-heard-of-her`, `/scoreboard`, and representative badge assets; deployed production `https://cc-egss59ks7-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; production smoke passed for those routes plus all six new badge PNGs; Vercel 500/501/502/503/504 scan returned 0 in 30m. Proof note: `docs/SQC_ILLUSTRATED_BADGE_SET_LIVE_DEPLOY_2026-04-27.md`.
  - 2026-04-27 11:12 Europe/Stockholm: Andreas clarified all badges should have transparent backgrounds and the crest should not feel like a box inside a box. Converted all seven starter badge assets to RGBA PNG runtime assets, switched the queenless challenge from the original JPEG reference to transparent `public/badges/queen-never-heard-of-her.png`, and updated the style canon/prompt rules accordingly. Verified `pnpm lint`, `pnpm build`, local route/asset alpha smoke, deployed production `https://cc-5irr006vl-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, production route smoke passed, all seven remote badge PNGs report RGBA alpha, and Vercel production error-log scan returned no logs. Verification/deploy proof is recorded in `docs/SQC_ILLUSTRATED_BADGE_SET_LIVE_DEPLOY_2026-04-27.md`.

- [x] Try Andreas's new ornate transparent SQC crest logo in the real shell.
  - added_at: 2026-04-27 12:41 Europe/Stockholm
  - completed_at: 2026-04-27 12:50 Europe/Stockholm
  - source: Andreas shared a new Side Quest Chess crest logo matching the quest badges and asked to try it for fun.
  - Acceptance:
    - save the supplied logo as a real transparent PNG runtime asset, not a baked checkerboard/card image
    - replace the old temporary logo in nav and homepage hero with the new crest logo
    - adjust logo framing so the crest floats instead of sitting inside a dark rounded card
    - verify lint/build, local route and asset smoke, production deploy, production smoke, and Vercel error logs before claiming live
  - Verification: `pnpm lint`, `pnpm build`, local smoke for `/` and `/sqc-logo.png`, local PNG alpha check, production deploy `https://cc-1a714podf-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, production smoke for `/` and `/sqc-logo.png`, and Vercel 500/501/502/503/504 scan clean.
  - Proof: runtime asset `public/sqc-logo.png`; nav/home wired to the new crest; proof note `docs/SQC_CREST_LOGO_TRIAL_2026-04-27.md`.

- [x] Implement CC v1 Phase 22: add a public rulebook/proof explainer.
  - added_at: 2026-04-27 12:40 Europe/Stockholm
  - completed_at: 2026-04-27 12:58 Europe/Stockholm
  - estimate: 1 bounded product-trust deploy burst
  - Acceptance:
    - `/rules` explains the Side Quest Chess proof loop in plain language
    - homepage and nav expose the rulebook as a first-class trust/product surface
    - copy reinforces no PGN homework, no engine dashboard, and no fake-success receipts
    - current verifier status makes clear that `Queen? Never Heard of Her` is live-backed while future verifiers follow the same pattern
  - Verification: `pnpm lint`, `pnpm build`, local route smoke for `/`, `/rules`, `/challenges`, and `/proof-log`, production deploy, production smoke for `https://sidequestchess.com/`, `/rules`, `/challenges`, `/proof-log`, and the existing queenless OG image endpoint, plus Vercel production 500 scan.
  - Proof: new route `src/app/rules/page.tsx`, nav/home links, live deployment `https://cc-q4nqtxqj9-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; proof note `docs/SQC_RULEBOOK_LIVE_DEPLOY_2026-04-27.md`.



- [x] Implement CC v1 Phase 23: add a public share kit for starter-deck dare links.
  - added_at: 2026-04-27 13:40 Europe/Stockholm
  - completed_at: 2026-04-27 13:50 Europe/Stockholm
  - estimate: 1 bounded viral-loop deploy burst
  - Acceptance:
    - `/share-kit` gives every starter challenge a direct friend-dare share card
    - homepage and nav expose the share kit as a first-class viral-loop surface
    - share kit links to daily, random, proof-log, dare pages, and challenge-specific OG preview images
    - copy/native-share actions stay challenge-specific and avoid generic homepage pitch
    - no PGN upload, engine-analysis, or serious training framing appears
  - Verification: `pnpm lint`, `pnpm build`, local route smoke for `/share-kit`, `/`, `/dare/queen-never-heard-of-her`, and `/api/og/dare/queen-never-heard-of-her`; production deploy; production smoke for the same routes plus Vercel production 500 scan.
  - Proof: new route `src/app/share-kit/page.tsx`, nav/home links, live deployment `https://cc-j5pt254ri-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; proof note `docs/SQC_SHARE_KIT_LIVE_DEPLOY_2026-04-27.md`.

- [x] Implement CC v1 Phase 24: add a public verifier status board.
  - added_at: 2026-04-27 14:40 Europe/Stockholm
  - completed_at: 2026-04-27 14:52 Europe/Stockholm
  - estimate: 1 bounded product-trust deploy burst
  - Acceptance:
    - `/verifiers` shows which starter-deck challenges are live-backed, next-adapter, or specified-only
    - homepage, nav, and rulebook expose the verifier board as a first-class trust surface
    - the board highlights `Queen? Never Heard of Her` as live-backed without pretending the rest of the starter deck has automated proof yet
    - no PGN upload, engine-analysis, or fake-success framing appears
  - Verification: `pnpm lint`, `pnpm build`, local production route smoke for `/`, `/verifiers`, `/rules`, and `/share-kit`; production deploy; production smoke for `https://sidequestchess.com/`, `/verifiers`, `/rules`, `/share-kit`, and `/api/og/dare/queen-never-heard-of-her`; Vercel production 500/501/502/503/504 scan.
  - Proof: new route `src/app/verifiers/page.tsx`, nav/home/rulebook links, live deployment `https://cc-akx1rr4ir-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; proof note `docs/SQC_VERIFIER_BOARD_LIVE_DEPLOY_2026-04-27.md`.

- [x] Implement CC v1 Phase 25: surface verifier status badges on challenge selection/detail pages.
  - added_at: 2026-04-27 16:40 Europe/Stockholm
  - completed_at: 2026-04-27 16:47 Europe/Stockholm
  - estimate: 1 bounded product-trust deploy burst
  - Acceptance:
    - challenge hub cards show whether each dare is live-backed, next-adapter, or specified-only
    - challenge detail pages show the same verifier state in the hero and explain the exact evidence/promise
    - `/verifiers` remains the shared source of truth for verifier status copy
    - no PGN upload, engine-analysis, or fake-success framing appears
  - Verification: `pnpm lint`, `pnpm build`, local production smoke for `/challenges`, `/challenges/queen-never-heard-of-her`, and `/verifiers`; production deploy; production smoke for `https://sidequestchess.com/challenges`, `/challenges/queen-never-heard-of-her`, `/verifiers`, and `/rules`; bounded Vercel error-log scan.
  - Proof: new shared verifier status module `src/lib/verifier-status.ts`, hub/detail verifier badges and copy, live deployment `https://cc-nymyueqmx-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; proof note `docs/SQC_VERIFIER_STATUS_BADGES_LIVE_DEPLOY_2026-04-27.md`.


- [x] Implement CC v1 Phase 26: carry verifier-status honesty onto daily/random/share entry surfaces.
  - added_at: 2026-04-27 17:40 Europe/Stockholm
  - completed_at: 2026-04-27 17:50 Europe/Stockholm
  - estimate: 1 bounded product-trust deploy burst
  - Acceptance:
    - `/today` shows the current daily dare's verifier state and evidence promise
    - `/random` updates verifier state copy with the selected roulette challenge
    - `/share-kit` shows live-backed / next-adapter / specified states on every starter-deck invite card
    - copy stays playful and honest without implying fake automated proof for specified-only challenges
  - Verification: `pnpm lint`, `pnpm build`, local route smoke for `/today`, `/random`, and `/share-kit`, production deploy, production smoke for `https://sidequestchess.com/today`, `/random`, `/share-kit`, and `/challenges/queen-never-heard-of-her`, plus bounded Vercel error-log scan.
  - Proof: verifier status copy now appears on daily, random, and share-kit entry surfaces; live deployment `https://cc-j5ij7v9lr-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; proof note `docs/SQC_VERIFIER_STATUS_ENTRY_SURFACES_LIVE_DEPLOY_2026-04-27.md`.




- [x] Implement CC v1 Phase 27: promote No Castle Club to a live Lichess latest-game verifier.
  - added_at: 2026-04-27 18:40 Europe/Stockholm
  - completed_at: 2026-04-27 18:44 Europe/Stockholm
  - estimate: 1 bounded verifier/product-trust burst
  - Acceptance:
    - `No Castle Club` checks real Lichess latest-game move history for player wins without player castling
    - UCI castling moves (`e1g1`, `e1c1`, `e8g8`, `e8c8`) normalize into verifier evidence
    - active challenge latest-game checks use the live no-castle verifier when a Lichess username is saved, with deterministic fallback fixtures for review
    - `/verifiers` and verifier badges mark `No Castle Club` as live-backed without changing specified-only claims for the rest of the starter deck
  - Verification: `node --experimental-strip-types --test tests/queen-never-heard-of-her-fixtures.mjs tests/no-castle-club-fixtures.mjs`, `pnpm lint`, `pnpm build`, production deploy, production smoke for `https://sidequestchess.com/verifiers`, `/challenges/no-castle-club`, `/rules`, `/account`, and `/api/og/dare/no-castle-club`, plus Vercel production 500 log scan.
  - Proof: new verifier module `src/lib/no-castle-club.ts`, fixture tests `tests/no-castle-club-fixtures.mjs`, active checker wiring in `src/app/actions.ts`, status update in `src/lib/verifier-status.ts`; live deployment `https://cc-9859r9iq9-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; proof note `docs/SQC_NO_CASTLE_LICHESS_VERIFIER_LIVE_DEPLOY_2026-04-27.md`.

- [x] Implement CC v1 Phase 28: promote Pawn Storm Maniac to a live Lichess latest-game verifier.
  - added_at: 2026-04-28 01:40 Europe/Stockholm
  - completed_at: 2026-04-28 01:55 Europe/Stockholm
  - estimate: 1 bounded verifier/product-trust burst
  - Acceptance:
    - `Pawn Storm Maniac` checks real Lichess latest-game move history for player wins with at least six different player pawns moved before move 15
    - UCI move normalization counts distinct pawn starts instead of repeated moves by the same pawn
    - active challenge latest-game checks use the live pawn-storm verifier when a Lichess username is saved, with deterministic fallback fixtures for review
    - `/verifiers` and verifier badges mark `Pawn Storm Maniac` as live-backed without changing specified-only claims for the remaining starter-deck challenges
  - Verification: `node --experimental-strip-types --test tests/queen-never-heard-of-her-fixtures.mjs tests/no-castle-club-fixtures.mjs tests/pawn-storm-maniac-fixtures.mjs`, `pnpm lint`, `pnpm build`, local route smoke, production deploy, production smoke for `https://sidequestchess.com/verifiers`, `/challenges/pawn-storm-maniac`, `/account`, and `/api/og/dare/pawn-storm-maniac`, plus Vercel production 500 scan.
  - Proof: new verifier module `src/lib/pawn-storm-maniac.ts`, fixture tests `tests/pawn-storm-maniac-fixtures.mjs`, active checker wiring in `src/app/actions.ts`, status update in `src/lib/verifier-status.ts`; live deployment `https://cc-bco1q2mwg-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; proof note `docs/SQC_PAWN_STORM_LICHESS_VERIFIER_LIVE_DEPLOY_2026-04-28.md`.

- [x] Implement CC v1 Phase 29: promote Knightmare Mode to a live Lichess latest-game verifier.
  - added_at: 2026-04-28 03:40 Europe/Stockholm
  - completed_at: 2026-04-28 03:53 Europe/Stockholm
  - estimate: 1 bounded verifier/product-trust burst
  - Acceptance:
    - `Knightmare Mode` checks real Lichess latest-game move history for player wins by checkmate where the final move was made by a knight
    - UCI move normalization identifies the final moving piece without engine analysis or PGN upload
    - active challenge latest-game checks use the live Knightmare verifier when a Lichess username is saved, with deterministic fallback fixtures for review
    - `/verifiers` and verifier badges mark `Knightmare Mode` as live-backed without changing specified-only claims for the remaining starter-deck challenges
  - Verification: `node --experimental-strip-types --test tests/queen-never-heard-of-her-fixtures.mjs tests/no-castle-club-fixtures.mjs tests/pawn-storm-maniac-fixtures.mjs tests/knightmare-mode-fixtures.mjs`, `pnpm lint`, `pnpm build`, local route smoke, production deploy, production smoke for `https://sidequestchess.com/verifiers`, `/challenges/knightmare-mode`, `/account`, and `/api/og/dare/knightmare-mode`, plus Vercel production error-log scan.
  - Proof: new verifier module `src/lib/knightmare-mode.ts`, fixture tests `tests/knightmare-mode-fixtures.mjs`, active checker wiring in `src/app/actions.ts`, status update in `src/lib/verifier-status.ts`; live deployment `https://cc-ndyrk85qn-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; proof note `docs/SQC_KNIGHTMARE_LICHESS_VERIFIER_LIVE_DEPLOY_2026-04-28.md`.

- [x] Implement future add-on concept: combo-quests / stacked quests in one game.
  - added_at: 2026-04-27 19:42 Europe/Stockholm
  - completed_at: 2026-04-27 20:40 Europe/Stockholm
  - source: Andreas suggested letting players stack multiple quests on top of each other and complete them in a single game, mostly as a fun future add-on.
  - estimate: future product design spike before implementation
  - Acceptance:
    - define how combo-quests are selected without making the core loop confusing
    - define scoring/reward rules for stacked quests in one verified game
    - specify verifier requirements for combining independent challenge predicates against the same game
    - explore UI copy such as “combo run”, “quest stack”, or “bad idea pile” while preserving the playful SQC tone
    - keep this as a future add-on, not a blocker for current starter-deck polish
  - Verification: design/spec note first; implementation only after the combo model is validated.
  - Proof: created `docs/SQC_COMBO_QUESTS_SPEC_2026-04-27.md`, defining the `Quest Stack`/`Combo Run`/`Bad Idea Pile` UX, 2–3 quest selection limits, compatibility rules, starter stack matrix, scoring multipliers, shared normalized-game verifier contract, first shippable Queenless + No Castle Club stack, and non-goals to keep this a future add-on rather than a v1 blocker.



- [x] Implement CC v1 Phase 30: promote Rookless Rampage to a live Lichess latest-game verifier.
  - added_at: 2026-04-28 05:40 Europe/Stockholm
  - completed_at: 2026-04-28 05:58 Europe/Stockholm
  - estimate: 1 bounded verifier/product-trust burst
  - Acceptance:
    - `Rookless Rampage` checks real Lichess latest-game move history for player wins after both original player rooks disappear before move 20
    - UCI move normalization tracks original rook identity even after rook movement/castling, so captures of moved rooks still count
    - active challenge latest-game checks use the live Rookless verifier when a Lichess username is saved, with deterministic fallback fixtures for review
    - `/verifiers` and verifier badges mark `Rookless Rampage` as live-backed without changing specified-only claims for the remaining starter-deck challenges
  - Verification: `node --experimental-strip-types --test tests/queen-never-heard-of-her-fixtures.mjs tests/no-castle-club-fixtures.mjs tests/pawn-storm-maniac-fixtures.mjs tests/knightmare-mode-fixtures.mjs tests/rookless-rampage-fixtures.mjs`, `pnpm lint`, `pnpm build`, local route smoke, production deploy, production smoke for `https://sidequestchess.com/verifiers`, `/challenges/rookless-rampage`, `/account`, and `/api/og/dare/rookless-rampage`, plus Vercel production error-log scan.
  - Proof: new verifier module `src/lib/rookless-rampage.ts`, fixture tests `tests/rookless-rampage-fixtures.mjs`, active checker wiring in `src/app/actions.ts`, status update in `src/lib/verifier-status.ts`; live deployment `https://cc-gzih5276z-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; production smoke passed for `/verifiers`, `/challenges/rookless-rampage`, `/account`, and `/api/og/dare/rookless-rampage`; proof note `docs/SQC_ROOKLESS_LICHESS_VERIFIER_LIVE_DEPLOY_2026-04-28.md`.

- [x] Implement CC v1 Phase 31: promote One Bishop to Rule Them All to a live Lichess latest-game verifier.
  - added_at: 2026-04-28 07:40 Europe/Stockholm
  - completed_at: 2026-04-28 07:55 Europe/Stockholm
  - estimate: 1 bounded verifier/product-trust burst
  - Acceptance:
    - `One Bishop to Rule Them All` checks real Lichess latest-game move history for player wins ending with exactly one player bishop and zero player knights as final minor pieces
    - UCI move normalization derives final minor-piece state without PGN upload, engine analysis, or fake-success framing
    - active challenge latest-game checks use the live One Bishop verifier when a Lichess username is saved, with deterministic fallback fixtures for review
    - `/verifiers` and verifier badges mark `One Bishop to Rule Them All` as live-backed without changing specified-only claims for the remaining starter-deck challenge
  - Verification: `node --experimental-strip-types --test tests/queen-never-heard-of-her-fixtures.mjs tests/no-castle-club-fixtures.mjs tests/pawn-storm-maniac-fixtures.mjs tests/knightmare-mode-fixtures.mjs tests/rookless-rampage-fixtures.mjs tests/one-bishop-to-rule-them-all-fixtures.mjs`, `pnpm lint`, `pnpm build`, local route smoke, production deploy, production smoke for `https://sidequestchess.com/verifiers`, `/challenges/one-bishop-to-rule-them-all`, `/account`, and `/api/og/dare/one-bishop-to-rule-them-all`, plus bounded Vercel production error-log scan.
  - Proof: new verifier module `src/lib/one-bishop-to-rule-them-all.ts`, fixture tests `tests/one-bishop-to-rule-them-all-fixtures.mjs`, active checker wiring in `src/app/actions.ts`, status update in `src/lib/verifier-status.ts`; live deployment `https://cc-fvd6ulzmk-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; production smoke passed for `/verifiers`, `/challenges/one-bishop-to-rule-them-all`, `/account`, and `/api/og/dare/one-bishop-to-rule-them-all`; proof note `docs/SQC_ONE_BISHOP_LICHESS_VERIFIER_LIVE_DEPLOY_2026-04-28.md`.

## Proof rules

- Do not claim public/live/domain progress until a live URL is deployed and smoke-verified.
- Design progress is valid when the artifact exists and `ccdesign` builds.
- Implementation progress is valid when `cc` checks pass and changed routes are inspectable.
- If the work starts feeling like chess analysis, stop and re-center on side quests.
