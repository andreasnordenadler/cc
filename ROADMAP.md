# CC Roadmap

Last updated: 2026-04-26 17:12 Europe/Stockholm  
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


## Proof rules

- Do not claim public/live/domain progress until a live URL is deployed and smoke-verified.
- Design progress is valid when the artifact exists and `ccdesign` builds.
- Implementation progress is valid when `cc` checks pass and changed routes are inspectable.
- If the work starts feeling like chess analysis, stop and re-center on side quests.
