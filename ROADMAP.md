# CC Roadmap

Last updated: 2026-05-06 15:18 Europe/Stockholm
Owner: Sam  
Status: fresh-baseline / manual-instruction only

## Mission

Build CC / Side Quest Chess into a playful chess side-quest product:

> **Chess, but with stupidly hard side quests.**

Users pick ridiculous chess quests, play real games on Lichess or Chess.com, and Side Quest Chess verifies whether they completed the quest so they can earn points, badges, streaks, and shareable proof.

## Current product canon

- Production public name: **Side Quest Chess**
- Primary domain: **sidequestchess.com**
- Backup domain: **sqchess.com**
- Internal lane/repo name: **CC**
- Former working/mockup name: **BlunderCheck**
- Correct feel: a smart chess friend sending you something dumb to try
- Primary loop: pick quest → play real chess elsewhere → automatic verification → success/failure result → points/badge/share/friend quest
- Main anti-goals: no engine dashboard, no PGN upload, no formal training product, no corporate SaaS layout
- Active quest canon: for now, each user should have exactly one active quest at a time. Re-question this later if group challenges/team quests become a first-class product mode.
- Quest rule canon: every SQC quest should require the player to win unless Andreas explicitly asks for an exception.
- Launch posture: Andreas prefers a proper, polished public launch with a rich feature set and very clear user UI over rushing to launch. SQC launch-readiness is the default priority unless another project has an outage/data-risk blocker.
- Beta tester functionality canon: Andreas explicitly said no more beta tester functionality is needed and that the beta tester side looks good as-is. Do not add more beta-admin, tester-instruction, feedback-template, invite, or beta-reporting functionality by default. Shift SQC effort toward core product usability, clarity, friction removal, quest loop quality, and launch-readiness improvements.
- Chess.com test account: Andreas supplied Chess.com username `and72nor` for API testing and future Chess.com quest validation work.

Canonical brief:
- `docs/CC_V1_PRODUCT_BRIEF_2026-04-25.md`

Old pre-reset standby roadmap is archived at:
- `docs/ROADMAP_ARCHIVE_PRE_V1_RESET_2026-04-25.md`

## Current baseline — 2026-05-05

Andreas reset SQC planning on 2026-05-05:

- **Current live version is the fresh baseline.**
- **Quest Hub (`/challenges`) is done and OK for launch.**
- **Individual Quest pages (`/challenges/[id]`) are done and OK for launch.**
- Clear old/new-change queues and previous autonomous instructions except the newly reconfirmed backlog below.
- From here, only act on new explicit Andreas instructions or this newly agreed roadmap.
- Do not continue autonomous SQC work from historical notes, old requested follow-ups, or previous backlog items unless they are explicitly listed below.

## Reconfirmed wanted backlog — 2026-05-05

Andreas clarified that these five items are still wanted and should be treated as the fresh post-reset SQC backlog:

- [x] Integrate seal `Side Quest Chess` ribbon text and reduce completion pill slant.
  - added_at: 2026-05-06 15:10 Europe/Stockholm
  - completed_at: 2026-05-06 15:18 Europe/Stockholm
  - source: Andreas clarified that `Side Quest Chess` should be part of the seal itself like the original coat-of-arms banner, and that the `Quest completed...` pill was slightly too slanted.
  - Proof: created `public/stamps/quest-complete-premium-red-wax-sqc-v14.png` with debossed red-on-red `SIDE QUEST CHESS` lettering inside the lower ribbon/banner, updated CSS to use v14, and reduced the completion pill slant by adjusting its rotation. Proof doc: `docs/SQC_COMPLETED_QUEST_WAX_SEAL_RIBBON_TEXT_ANGLE_FIX_2026-05-06.md`.
  - Verification: visual preview; `pnpm lint`; `pnpm build`.

- [x] Polish completed wax seal opacity, angle, and source text visibility.
  - added_at: 2026-05-06 15:04 Europe/Stockholm
  - completed_at: 2026-05-06 15:09 Europe/Stockholm
  - source: Andreas noted text showing through the top of the seal, asked to move the seal higher, slant the completion pill more with the seal, and make the original `Side Quest Chess` seal text more visible.
  - Proof: created `public/stamps/quest-complete-premium-red-wax-sqc-v12.png` with internal transparency filled red and boosted red-on-red `SIDE QUEST CHESS` lettering; updated CSS to use v12, moved the seal higher, and adjusted the pill rotation to better match the seal. Proof doc: `docs/SQC_COMPLETED_QUEST_WAX_SEAL_OPAQUE_TEXT_POLISH_2026-05-06.md`.
  - Verification: visual preview; `pnpm lint`; `pnpm build`.

- [x] Move completed wax seal left by roughly one seal width.
  - added_at: 2026-05-06 14:56 Europe/Stockholm
  - completed_at: 2026-05-06 14:59 Europe/Stockholm
  - source: Andreas approved the compact layout and asked to move the seal left by about the same length as the seal itself.
  - Proof: shifted `.completed-quest-award` left on desktop and mobile while keeping size/top/date-only copy unchanged. Proof doc: `docs/SQC_COMPLETED_QUEST_SEAL_LEFT_SHIFT_2026-05-06.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Compact completed quest hero and let title extend under seal.
  - added_at: 2026-05-06 14:53 Europe/Stockholm
  - completed_at: 2026-05-06 14:57 Europe/Stockholm
  - source: Andreas asked to compact the section, let `Proof Loop Test` be on two rows extending under the seal, and widen the highlighted text area to at least half the section.
  - Proof: reduced the completed hero reward-art column, made the hero shorter, removed completed copy right padding, widened title/body copy rules, moved the seal higher/right over the text area, and made it slightly larger while keeping it off the coat of arms. Proof doc: `docs/SQC_COMPLETED_QUEST_COMPACT_TITLE_OVERLAP_2026-05-06.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Tune completed wax seal layout and date-only label.
  - added_at: 2026-05-06 14:46 Europe/Stockholm
  - completed_at: 2026-05-06 14:48 Europe/Stockholm
  - source: Andreas confirmed the seal looks good and asked for it to sit on top of the section, overlap the text a bit, be slightly bigger, and remove the time from the completion text.
  - Proof: enlarged/repositioned `.completed-quest-award` over the quest title/text area while keeping it off the reward coat of arms, reduced completed title padding, and changed `formatCompletedDate` to date-only output. Proof doc: `docs/SQC_COMPLETED_QUEST_WAX_SEAL_LAYOUT_DATE_ONLY_2026-05-06.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Tighten completed wax seal transparency and title-side placement.
  - added_at: 2026-05-06 14:27 Europe/Stockholm
  - completed_at: 2026-05-06 14:31 Europe/Stockholm
  - source: Andreas shared a screenshot showing the black/grey matte still visible and the seal covering the quest coat of arms instead of the quest name text.
  - Proof: created stricter transparent asset `public/stamps/quest-complete-premium-red-wax-sqc-v11.png`, updated CSS to use it, reduced seal size, and moved the completed award seal toward the right side of the quest title/text area away from the coat-of-arms reward image. Proof doc: `docs/SQC_COMPLETED_QUEST_WAX_SEAL_TRANSPARENT_RIGHT_PLACEMENT_2026-05-06.md`.
  - Verification: purple/card-background visual preview; `pnpm lint`; `pnpm build`.

- [x] Remove completed wax seal matte background and move seal off the coat of arms.
  - added_at: 2026-05-06 14:17 Europe/Stockholm
  - completed_at: 2026-05-06 14:20 Europe/Stockholm
  - source: Andreas said the wax seal was better, but the black/grey background should be removed and the seal should sit to the right, covering part of the quest name text instead of the quest coat of arms.
  - Proof: created transparent `public/stamps/quest-complete-premium-red-wax-sqc-v10.png`, updated CSS to reference it, and repositioned `.completed-quest-award` toward the right side of the quest title/text area while keeping it away from the coat-of-arms image. Proof doc: `docs/SQC_COMPLETED_QUEST_WAX_SEAL_BACKGROUND_POSITION_FIX_2026-05-06.md`.
  - Verification: dark-background visual preview; `pnpm lint`; `pnpm build`.

- [x] Replace red logo-style completion mark with a genuinely wax-realistic seal.
  - added_at: 2026-05-06 13:43 Europe/Stockholm
  - completed_at: 2026-05-06 13:52 Europe/Stockholm
  - source: Andreas corrected that the previous attempt still did not look like a wax seal.
  - Proof: replaced the seal with `public/stamps/quest-complete-premium-red-wax-sqc-v9.png`, a photorealistic red wax render with irregular melted edges, glossy wax depth, dents/pits, and embossed SQC-style crest impression; added a radial CSS mask to prevent square matte edges. Proof doc: `docs/SQC_COMPLETED_QUEST_PREMIUM_WAX_SEAL_FIX_2026-05-06.md`.
  - Verification: strict visual inspection; `pnpm lint`; `pnpm build`.

- [x] Change completed quest award date copy from game language to quest language.
  - added_at: 2026-05-06 13:40 Europe/Stockholm
  - completed_at: 2026-05-06 13:42 Europe/Stockholm
  - source: Andreas corrected that the completed award text should say Quest completed, not Game completed.
  - Proof: updated completed quest award date pill from `Game completed ...` to `Quest completed ...` in `src/app/challenges/[id]/page.tsx`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Rebuild completed quest wax seal from Andreas-provided SQC source logo.
  - added_at: 2026-05-06 13:32 Europe/Stockholm
  - completed_at: 2026-05-06 13:37 Europe/Stockholm
  - source: Andreas provided the exact Side Quest Chess coat-of-arms/logo image and said this is the source of the stamp he wants.
  - Proof: converted the provided source logo directly into `public/stamps/quest-complete-red-wax-sqc-logo-v5.png`, preserving the crowned horse, shield, rook/tower, scrollwork, and `SIDE QUEST CHESS` banner as an all-red wax relief, then updated CSS to use the cache-busted source-logo seal. Proof doc: `docs/SQC_COMPLETED_QUEST_SOURCE_LOGO_WAX_SEAL_2026-05-06.md`.
  - Verification: dark-background visual preview; `pnpm lint`; `pnpm build`.

- [x] Replace completed quest seal with photorealistic all-red wax seal.
  - added_at: 2026-05-06 13:20 Europe/Stockholm
  - completed_at: 2026-05-06 13:24 Europe/Stockholm
  - source: Andreas clarified the stamp should be all red, photorealistic like a wax seal, with the Side Quest Chess logo/coat of arms.
  - Proof: generated `public/stamps/quest-complete-red-wax-sqc-v3.png`, a red wax seal with embossed SQC/Proof Loop Test coat-of-arms motif, cleaned magenta background/fringe, and updated CSS to use the new cache-busting asset. Proof doc: `docs/SQC_COMPLETED_QUEST_RED_WAX_SEAL_2026-05-06.md`.
  - Verification: dark-background visual preview; `pnpm lint`; `pnpm build`.

- [x] Fix completed quest seal visibility and cache-bust updated asset.
  - added_at: 2026-05-06 13:08 Europe/Stockholm
  - completed_at: 2026-05-06 13:14 Europe/Stockholm
  - source: Andreas reported he could not see that the updated completed quest seal was visible.
  - Proof: created `public/stamps/quest-complete-seal-sqc-v2.png` with a much larger actual SQC/Proof Loop Test coat of arms in the center and changed CSS to reference the new cache-busting filename. Proof doc: `docs/SQC_COMPLETED_QUEST_SEAL_CACHE_AND_VISIBILITY_FIX_2026-05-06.md`.
  - Verification: dark-background visual preview; `pnpm lint`; `pnpm build`.

- [x] Revise completed quest seal to use actual SQC coat of arms.
  - added_at: 2026-05-06 12:57 Europe/Stockholm
  - completed_at: 2026-05-06 13:05 Europe/Stockholm
  - source: Andreas rejected the generic generated seal and asked for a stamp/seal like the references, but with the SQC coat of arms.
  - Proof: replaced `public/stamps/quest-complete-seal.png` with a locally composed red/gold wax-stamp style seal using the actual Proof Loop Test/SQC coat-of-arms image in the center, readable `QUEST COMPLETE` / `SIDE QUEST CHESS` text bands, and removed duplicate overlaid text from the page. Proof doc: `docs/SQC_COMPLETED_QUEST_SQC_COAT_SEAL_REVISION_2026-05-06.md`.
  - Verification: dark-background visual preview; `pnpm lint`; `pnpm build`.

- [x] Make completed quest page feel like an award state.
  - added_at: 2026-05-06 12:45 Europe/Stockholm
  - completed_at: 2026-05-06 12:55 Europe/Stockholm
  - source: Andreas screenshot feedback on `/challenges/finish-any-game`: make the stamp much more prominent, maybe with custom graphic, remove buttons, and add completion date based on actual game time.
  - Proof: generated `public/stamps/quest-complete-seal.png`; replaced the subtle completed stamp with a large celebratory award seal and `Quest completed ...` date line; added `completedGameAt` to attempts and populated it from Lichess `lastMoveAt`/`createdAt` and Chess.com `end_time`; removed completed-state hero/status/friend-dare buttons from quest detail pages. Proof doc: `docs/SQC_COMPLETED_QUEST_AWARD_PAGE_2026-05-06.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Add real Lichess final-position proof-board data for completed receipts.
  - added_at: 2026-05-06 11:43 Europe/Stockholm
  - completed_at: 2026-05-06 11:51 Europe/Stockholm
  - source: Andreas asked Sam to work autonomously after proof-arrival review; Sam selected the remaining proof-board data-fidelity gap.
  - Proof: added local UCI-to-FEN proof-position builder, requested Lichess move data, attached final FEN + last UCI move to passed Lichess verification results, and persisted those fields into challenge attempts so the existing proof-board UI renders real final-board proof for new Lichess-backed completed receipts. Proof doc: `docs/SQC_LICHESS_PROOF_BOARD_DATA_2026-05-06.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Tighten proof-arrival completion loop for review.
  - added_at: 2026-05-06 11:27 Europe/Stockholm
  - completed_at: 2026-05-06 11:42 Europe/Stockholm
  - source: Andreas asked Sam to review/work on what should happen when proof comes in: completed quests clearly updated, celebration, proof available and shareable.
  - Proof: `/result` now supports quest-specific victory proof via `?challengeId=...` and prefers passed proof; completed quest CTAs route to that proof; receipt compaction preserves latest passed proof per completed quest; My Quest Log has a real Check latest games action and completed proof actions; Proof Log routes checks to the active quest and passed receipts to victory proof; signed-in badge/home surfaces use real earned state. Proof doc: `docs/SQC_PROOF_ARRIVAL_LOOP_REVIEW_2026-05-06.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Correct Proof Loop Test transparency to preserve full coat of arms.
  - added_at: 2026-05-06 11:21 Europe/Stockholm
  - completed_at: 2026-05-06 11:24 Europe/Stockholm
  - source: Andreas corrected that the previous transparent pass removed parts of the coat, not just the blue background.
  - Proof: restored the original badge and reran conservative edge-connected navy-background removal only, preserving dark crest ornamentation.
  - Verification: magenta transparency preview confirmed no square background and no obvious over-cut; `pnpm lint`; `pnpm build`.

- [x] Remove square background from Proof Loop Test coat of arms.
  - added_at: 2026-05-06 11:12 Europe/Stockholm
  - completed_at: 2026-05-06 11:15 Europe/Stockholm
  - source: Andreas screenshot feedback on the Proof Loop Test badge.
  - Proof: converted `public/badges/v6/proof-loop-test-badge.png` from an opaque square-backed RGB PNG into a transparent RGBA crest asset.
  - Verification: transparency preview on magenta; `pnpm lint`; `pnpm build`.

- [x] Turn completed active quest status from refresh/checking into proof actions.
  - added_at: 2026-05-06 11:07 Europe/Stockholm
  - completed_at: 2026-05-06 11:10 Europe/Stockholm
  - source: Andreas agreed after Proof Loop Test showed completed but still presented the latest-game checker/Refresh UI.
  - Proof: completed active quest detail pages now say `Quest completed`, show `Your proof is ready`, and replace Refresh with `View victory proof`, `Open proof log`, and `Pick next quest`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Fix refresh crash from oversized Clerk public metadata.
  - added_at: 2026-05-06 11:00 Europe/Stockholm
  - completed_at: 2026-05-06 11:06 Europe/Stockholm
  - source: Andreas reported that clicking Refresh on the Proof Loop Test quest caused a server error.
  - Root cause: repeated latest-game checks appended full receipt summaries until Clerk rejected `public_metadata` over its 8KB limit (`form_param_exceeds_allowed_size`).
  - Proof: added `compactChallengeAttempts` in `src/app/actions.ts` so activation, manual submission, and Refresh keep only the latest compact receipts before saving metadata.
  - Verification: `pnpm lint`; `pnpm build`; production log check after deploy.

- [x] Remove the `board loop` pill from completed quest proof cards.
  - added_at: 2026-05-06 10:57 Europe/Stockholm
  - completed_at: 2026-05-06 10:57 Europe/Stockholm
  - source: Andreas screenshot feedback on completed quest detail page.
  - Proof: removed the green `board loop` badge from the completed proof section in `src/app/challenges/[id]/page.tsx`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Create proper coat of arms for Proof Loop Test.
  - added_at: 2026-05-06 10:48 Europe/Stockholm
  - completed_at: 2026-05-06 10:52 Europe/Stockholm
  - source: Andreas asked for a proper coat of arms for the new test quest.
  - Proof: generated `public/badges/v6/proof-loop-test-badge.png` and wired `finish-any-game` / `Proof Loop Test` to use it as `The Rubber Stamp Rampart`. Proof doc: `docs/SQC_PROOF_LOOP_TEST_COAT_OF_ARMS_2026-05-06.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Add a complete Proof Loop Test quest for testing completion.
  - added_at: 2026-05-06 10:40 Europe/Stockholm
  - completed_at: 2026-05-06 10:47 Europe/Stockholm
  - source: Andreas asked for a pickable quest with coat of arms where any played game, win/loss/draw/type, can complete the quest so he and users can test the whole flow.
  - Proof: added `finish-any-game` / `Proof Loop Test` to `src/lib/challenges.ts`, added live verifier status, wired Lichess latest-game and Chess.com latest-archive finished-game checks, and reused the manual `finish-any-game` verification path. Proof doc: `docs/SQC_PROOF_LOOP_TEST_QUEST_2026-05-06.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Make completed quest result feel like a shareable coat-of-arms celebration.
  - added_at: 2026-05-06 10:35 Europe/Stockholm
  - completed_at: 2026-05-06 10:39 Europe/Stockholm
  - source: Andreas agreed that the completion moment should feel special, especially that the unlocked coat of arms celebration should be shareable together with the proof.
  - Proof: updated `/result` passed-state UI to say `Quest completed`, lead with `Quest completed. Coat of arms unlocked.`, add a completion stamp, stage the unlocked coat larger, add passed-state shareable-celebration copy, and turn the share card/actions into `Share the unlock` / `Copy victory proof` / `Share victory proof`. Proof doc: `docs/SQC_COMPLETED_QUEST_CELEBRATION_PROOF_2026-05-06.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Document the approved SQC great-version baseline.
  - added_at: 2026-05-06 10:27 Europe/Stockholm
  - completed_at: 2026-05-06 10:27 Europe/Stockholm
  - source: Andreas said he is very happy with the logged-in homepage and asked to document this whole-project version as a great version before continuing tweaks.
  - Proof: created `docs/SQC_GREAT_VERSION_BASELINE_2026-05-06.md` documenting the approved production state, baseline code commit `c479b8d`, live deployment, logged-in homepage decisions, My Quest Log cleanup, Coat of Arms clickability, and verification.
  - Verification: live smoke checks for `/`, `/badges`, `/account`, `/challenges`; Vercel inspect Ready; tracked tree clean before baseline doc creation.

- [x] Make full Coat of Arms quest cards clickable.
  - added_at: 2026-05-06 10:25 Europe/Stockholm
  - completed_at: 2026-05-06 10:25 Europe/Stockholm
  - source: Andreas screenshot feedback on `/badges`.
  - Proof: converted each Coat of Arms meaning card into a full-card link to its quest page, while preserving the coat art and card copy. Proof doc: `docs/SQC_COAT_OF_ARMS_FULL_CARD_LINKS_2026-05-06.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Rework logged-in Active Quest card into a two-column layout.
  - added_at: 2026-05-06 10:21 Europe/Stockholm
  - completed_at: 2026-05-06 10:21 Europe/Stockholm
  - source: Andreas screenshot feedback that moving the coat inward compacted the text too much.
  - Proof: replaced absolute-position/padding layout with a real grid: text/meta/copy in the left column and the coat centered in its own right column, with a mobile one-column fallback. Proof doc: `docs/SQC_LOGGED_IN_ACTIVE_QUEST_TWO_COLUMN_LAYOUT_2026-05-06.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Move the active quest coat further toward center.
  - added_at: 2026-05-06 10:16 Europe/Stockholm
  - completed_at: 2026-05-06 10:16 Europe/Stockholm
  - source: Andreas follow-up screenshot feedback: `More please!`
  - Proof: shifted the active quest coat further left/inward and widened the reserved text-side space so the art reads more centered within the right-hand area. Proof doc: `docs/SQC_LOGGED_IN_ACTIVE_QUEST_COAT_CENTERING_MORE_2026-05-06.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Center the active quest coat of arms within the right side of the logged-in card.
  - added_at: 2026-05-06 10:12 Europe/Stockholm
  - completed_at: 2026-05-06 10:12 Europe/Stockholm
  - source: Andreas screenshot feedback on active quest coat placement.
  - Proof: moved the active quest coat inward from the right edge and increased text-side reserve space so the art sits more centered in the right-hand area. Proof doc: `docs/SQC_LOGGED_IN_ACTIVE_QUEST_COAT_CENTERING_2026-05-06.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Mark active quest in the logged-in Where to begin cards.
  - added_at: 2026-05-06 10:03 Europe/Stockholm
  - completed_at: 2026-05-06 10:03 Europe/Stockholm
  - source: Andreas screenshot feedback that the `How heroic are you feeling today?` cards may include the active quest too.
  - Proof: heroism choice cards now compare against the signed-in active quest and show green outline plus `ACTIVE QUEST` stamp when matched. Proof doc: `docs/SQC_LOGGED_IN_HEROISM_ACTIVE_QUEST_STATE_2026-05-06.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Simplify logged-in homepage Active Quest card and make it link to the active quest.
  - added_at: 2026-05-06 10:00 Europe/Stockholm
  - completed_at: 2026-05-06 10:00 Europe/Stockholm
  - source: Andreas screenshot feedback on the logged-in Active Quest card.
  - Proof: changed the pill from `Current run` to `Active Quest`, added the active quest coat of arms, removed completed-quests and points surfaces, removed `Review active rules`, and made the entire card link to the active quest page. Proof doc: `docs/SQC_LOGGED_IN_ACTIVE_QUEST_CARD_SIMPLIFICATION_2026-05-06.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Mark the active quest in the logged-in homepage badge row.
  - added_at: 2026-05-06 09:55 Europe/Stockholm
  - completed_at: 2026-05-06 09:55 Europe/Stockholm
  - source: Andreas screenshot feedback on logged-in homepage badge row.
  - Proof: if any badge-preview quest matches the current active quest, the homepage badge link now gets a green outline plus the `ACTIVE QUEST` stamp. Proof doc: `docs/SQC_LOGGED_IN_HOME_ACTIVE_BADGE_ROW_STATE_2026-05-06.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Switch the logged-in homepage Current run and Coat of Arms sections.
  - added_at: 2026-05-06 09:51 Europe/Stockholm
  - completed_at: 2026-05-06 09:51 Europe/Stockholm
  - source: Andreas screenshot feedback on logged-in homepage ordering.
  - Proof: moved the logged-in `Current run` card above the `Every bad idea deserves a coat of arms.` badge vault section while preserving signed-out homepage ordering. Proof doc: `docs/SQC_LOGGED_IN_HOME_SECTION_ORDER_SWAP_2026-05-06.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Remove the Proof loop panel from the logged-in homepage only.
  - added_at: 2026-05-06 09:46 Europe/Stockholm
  - completed_at: 2026-05-06 09:46 Europe/Stockholm
  - source: Andreas screenshot feedback; he clarified all current homepage cleanup is for the logged-in homepage.
  - Proof: removed the logged-in-only `Proof loop` / `From bad idea to brag receipt.` section and its three cards/buttons while leaving the signed-out explainer section intact.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Clean up logged-in homepage hero CTAs from Andreas screenshot feedback.
  - added_at: 2026-05-06 09:40 Europe/Stockholm
  - completed_at: 2026-05-06 09:40 Europe/Stockholm
  - source: Andreas screenshot feedback on logged-in homepage.
  - Proof: removed the green `Pick → play → prove. One quest at a time.` helper line plus the `Random quest` and `Connect account` buttons from the logged-in hero, leaving only `Browse quests`. Proof doc: `docs/SQC_LOGGED_IN_HOME_HERO_CTA_CLEANUP_2026-05-06.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Fix the missile-like line/artifact in the blurred locked coat-of-arms shelf on My Quest Log.
  - added_at: 2026-05-06 09:26 Europe/Stockholm
  - completed_at: 2026-05-06 09:28 Europe/Stockholm
  - source: Andreas voice-note feedback on the My Quest Log blurred coat-of-arms treatment.
  - Proof: removed the blur and clipped radial-ring pseudo overlay from locked `hero-coat-slot` badge art, then softened locked-state shadow/opacity so locked crests stay subdued without streak artifacts. Proof doc: `docs/SQC_MY_QUEST_LOG_LOCKED_COAT_ARTIFACT_FIX_2026-05-06.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Auto-run latest-game checker immediately after a logged-in user activates a quest, instead of requiring the first manual Refresh.
  - completed_at: 2026-05-05 07:50 Europe/Stockholm
  - Proof: `startChallenge` now runs latest-game checks immediately for users with a saved Lichess or Chess.com identity, records activation-time receipts, updates active quest/progress from the result, revalidates `/result`, and leaves activation non-blocking if a provider is unavailable. Quest detail run-flow copy now says activation performs the immediate check.
- [x] Prepare/test the alternate ornate SQC logo/top-bar treatment from `public/brand/sqc-alt-logo-topbar-test.jpg`, with transparent/cropped treatment before any final nav use.
  - completed_at: 2026-05-05 10:38 Europe/Stockholm
  - Proof: added `public/brand/sqc-alt-logo-topbar-transparent.png` as a cropped transparent RGBA PNG and `/brand-test` as a non-indexed visual test page with fake top-bar, dark/gold/light swatches, and direct asset link. The real production nav is intentionally unchanged pending Andreas approval.
  - Verification: alpha check confirmed transparent + opaque pixels; `pnpm lint`; `pnpm build`; production deploy to `https://cc-is2tspvgx-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; live smoke for `/brand-test`, direct transparent PNG asset, `/challenges`, and homepage absence of the alternate asset; proof doc `docs/SQC_ALT_ORNATE_LOGO_TOPBAR_TEST_2026-05-05.md`.
- [x] Expand/revisit Brutal and Absurd quests so they are truly viral/streamer-hard, including deciding whether Absurd quests should require rated games.
  - completed_at: 2026-05-05 12:34 Europe/Stockholm
  - Decision: Brutal stays rated-or-casual but is explicitly streamer-hard/clip-worthy; Absurd is rated-only for proof value and future leaderboard fairness.
  - Proof: live quest canon now reframes Queenless and Knightmare as streamer-hard Brutal quests, raises their rewards and minimum-game-story constraints, reframes Rookless Rampage as rated-only Absurd, and the Rookless verifier now rejects unrated/casual games. Coming-soon Brutal/Absurd cards mirror the same canon. Proof doc: `docs/SQC_BRUTAL_ABSURD_RATED_STREAMER_HARD_2026-05-05.md`.
  - Verification: `pnpm exec node --experimental-strip-types --test tests/rookless-rampage-fixtures.mjs`; `pnpm lint`; `pnpm build`; deployed `https://cc-ggtl8noji-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; live smoke passed for `/challenges/rookless-rampage`, `/challenges/queen-never-heard-of-her`, `/challenges/knightmare-mode`, and `/challenges`.
- [x] Remove Starter Path as a top-level concept and replace homepage/top-bar onboarding with difficulty-based quest recommendations: easy, looking for trouble, and badass.
  - added_at: 2026-05-05 13:55 Europe/Stockholm
  - completed_at: 2026-05-05 14:02 Europe/Stockholm
  - source: Andreas said the whole Starter Path idea is not very good and suggested difficulty-flavored starting recommendations instead.
  - Proof: removed the top-bar `Starter path` link; replaced homepage top recommendation with `Want to start easy?` → Knights Before Coffee, `Looking for trouble?` → No Castle Club, and `Badass?` → Queen? Never Heard of Her; changed signed-out/signed-in homepage CTAs away from `/path`; changed challenge hub/account/beta/result/rules/verifier/share/scoreboard visible copy away from Starter Path/starter deck wording; kept `/path` only as an unlinked compatibility route renamed to Quest picks.
  - Verification: `pnpm lint`; `pnpm build`; committed `4f57ce0`; deployed `https://cc-aouhxiini-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; live smoke confirmed canonical and preview homepage contain the three new recommendation labels and no `Starter path`/`starter path`, `/challenges` and `/path` return 200 with no Starter Path copy, and Vercel production error log scan returned no logs.
- [x] Design rankings/top players/quest popularity/statistics loops for SQC.
  - completed_at: 2026-05-05 14:35 Europe/Stockholm
  - Proof: `/scoreboard` is now a visible Rankings design hub linked from the top nav, with honest no-fake-numbers leaderboard structure, top-player scoring/tie-break model, quest popularity inputs, receipt-sourced statistics loops, signed-in personal progress, provider receipt counts, and per-quest popularity launch cards. Proof doc: `docs/SQC_RANKINGS_STATS_LOOPS_LIVE_DEPLOY_2026-05-05.md`.
  - Verification: `pnpm lint`; `pnpm build`; committed `e18138a`; pushed to `origin/main`; production deploy to `https://cc-6j3vupylh-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; live smoke passed for `/scoreboard`, `/`, and `/challenges`; Vercel production error-log scan had no logs.
- [x] Declutter the signed-out homepage hero by removing the CTA buttons, trust pills, `Pick → play → prove` line, and top Private Beta pill.
  - added_at: 2026-05-05 15:45 Europe/Stockholm
  - completed_at: 2026-05-05 15:52 Europe/Stockholm
  - source: Andreas screenshot feedback on the signed-out homepage hero.
  - Proof: signed-out hero now shows only the headline and simplified intro copy; signed-in hero keeps action buttons.
  - Verification: `pnpm lint`; `pnpm build`; committed `1128522`; deployed `https://cc-cw5an54q7-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; live smoke confirmed removed hero strings/buttons/pills on canonical and preview homepage; Vercel production error log scan returned no logs.
- [x] Explore showing a chessboard with the last move/final proof position for completed quests.
  - completed_at: 2026-05-05 16:21 Europe/Stockholm
  - Proof: added a reusable `ProofPositionBoard` component, optional receipt metadata fields (`finalPositionFen`, `lastMoveUci`, `lastMoveSan`), completed quest-detail board slot, and passed proof-log receipt board slot. Existing receipts honestly show a pending board-capture state instead of fake positions; future verifier FEN/last-move capture will render the board automatically with from/to highlights. Proof doc: `docs/SQC_COMPLETED_QUEST_FINAL_POSITION_BOARD_EXPLORATION_2026-05-05.md`.
  - Verification: `pnpm lint`; `pnpm build`.
- [x] Redesign the signed-out homepage first impression so new visitors see a clearer layout, Google sign-in path, public-game proof loop, starter quest preview, and less duplicated box-heavy onboarding copy.
  - added_at: 2026-05-05 13:40 Europe/Stockholm
  - completed_at: 2026-05-05 13:47 Europe/Stockholm
  - source: Andreas requested work on the home page layout and how it looks for users that are not logged in yet.
  - Proof: signed-out homepage now has a Google-first hero, explicit public-game/no-password trust strip, a first-run checklist, starter quest badge preview, and a shorter signed-out product explainer while signed-in users retain the current run/proof-oriented homepage.
  - Verification: `pnpm lint`; `pnpm build`; committed `8b26039`; deployed `https://cc-92mrw6feo-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; live smoke confirmed signed-out strings/classes on both canonical and preview homepage, plus `/path` and `/connect` HTTP 200; Vercel production error log scan returned no logs.

- [x] Remove white square matte from the three beginner quest badge assets.
  - added_at: 2026-04-28 11:50 Europe/Stockholm
  - completed_at: 2026-04-28 11:55 Europe/Stockholm
  - source: Andreas screenshot showed white square backgrounds on only the three new beginner badges.
  - Acceptance:
    - Only `Knights Before Coffee`, `Bishop Field Trip`, and `Early King Walk` badge assets are changed.
    - Exterior white/off-white matte connected to the image edge is transparent.
    - Interior cream/white crest details remain preserved.
    - Paths are cache-busted so production does not keep serving stale white-square assets.
  - Verification: PNG alpha conversion, visual QA, `pnpm lint`, `pnpm build`, production deploy, live smoke for `/challenges`, `/badges`, the three badge routes, and direct PNG asset routes.

## STRICT ACTIVE QUEUE

- [x] Build Chess.com latest-game validation path using Andreas test account `and72nor`.
  - added_at: 2026-04-28 12:45 Europe/Stockholm
  - completed_at: 2026-04-28 13:47 Europe/Stockholm
  - source: Andreas supplied Chess.com username `and72nor` to test the Chess.com API for quest validation.
  - Acceptance:
    - Chess.com public archives are fetched safely with SQC User-Agent and clear pending/error states.
    - Latest eligible Chess.com games can be normalized into the same verifier input shape used by Lichess where practical.
    - At least one existing win-required quest can be verified from Chess.com without requiring a pasted game URL.
    - Fixture/test coverage uses real observed Chess.com archive shape from `and72nor` without storing private data beyond public game metadata.
  - Initial probe: `https://api.chess.com/pub/player/and72nor` and `/games/archives` returned 200; public archives include 2023/04 and 2024/01, with January 2024 games exposing `url`, `pgn`, `white/black.result`, `end_time`, `time_class`, and `rules`.
  - Proof: added first dual-host latest-game adapter for `No Castle Club`; Chess.com public archive + PGN SAN normalization now creates honest pass/fail/pending receipts without pasted game URLs when a Chess.com username is saved and no Lichess username is present.
  - Verification: `pnpm exec node --experimental-strip-types --test tests/chesscom-no-castle-club-fixtures.mjs`, `pnpm exec node --experimental-strip-types --test tests/*.mjs`, `pnpm lint`, `pnpm build`, direct adapter smoke for `and72nor`, production deploy, live smoke for `/verifiers`, `/challenges/no-castle-club`, and `/account`, plus bounded Vercel deployment log watch.
  - Live deployment: `https://cc-41g7wl377-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`.
  - Proof doc: `docs/SQC_CHESSCOM_NO_CASTLE_LATEST_GAME_ADAPTER_LIVE_DEPLOY_2026-04-28.md`.

- [x] Prepare SQC for polished launch readiness without adding more beta-tester functionality. *(Closed at 2026-05-05 fresh-baseline reset; no remaining automatic follow-up from this queue.)*
  - added_at: 2026-04-28 12:38 Europe/Stockholm
  - source: Andreas said he is not in a hurry to launch and would rather do a proper launch with rich features and a great clear UI.
  - 2026-05-04 08:33 Europe/Stockholm requested quest-card cleanup: remove the bottom alternative/badge tag line (e.g. Horse First Initiate), remove the visible Open quest/card CTA text, and make the active quest state much more obvious than the small yellow marker.
  - 2026-05-04 08:46 Europe/Stockholm progress: shipped quest-card cleanup and stronger active-state treatment; proof doc `docs/SQC_QUEST_CARD_CLEANUP_ACTIVE_STATE_LIVE_DEPLOY_2026-05-04.md`. Verification: `pnpm lint`, `pnpm build`, production deploy to `https://cc-rexfs6xat-andreas-nordenadlers-projects.vercel.app`, alias to `https://sidequestchess.com`, and live smoke for `/challenges` confirming the removed bottom tag/CTA strings are absent.
  - 2026-05-04 08:58 Europe/Stockholm progress: extended the stronger active/completed state to the recommended starter-route cards so the top first-run ladder mirrors the full deck instead of hiding the active quest until lower on the page; proof doc `docs/SQC_STARTER_ROUTE_ACTIVE_STATE_LIVE_DEPLOY_2026-05-04.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, commit `06e3063`, push to `origin/main`, production deploy to `https://cc-hxypbged6-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, live `/challenges` smoke, canonical `/path` smoke, and Vercel inspect status `Ready`.
  - 2026-05-04 10:30 Europe/Stockholm requested quest-card declutter: remove visible category/flavor labels such as `Beginner Quest`, `Blunder Quest`, and `Restriction` from the quest-card grid because they currently add little function beyond future filtering/grouping.
  - 2026-05-04 10:44 Europe/Stockholm requested quest-card layout refinement: move points to the top-left of every quest card and move the active quest indicator out of the middle of the card into a subtler bottom-line state.
  - 2026-05-04 10:51 Europe/Stockholm progress: shipped quest-card points/top-left and bottom-line active state; proof doc `docs/SQC_QUEST_CARD_POINTS_AND_ACTIVE_LINE_2026-05-04.md`. Verification: `pnpm lint`, `pnpm build`, commit `5a2355c`, push to `origin/main`, production deploy to `https://cc-notfdfwu4-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, and live `/challenges` smoke confirming `quest-points` present and old `active-quest-callout` absent.
  - 2026-05-04 10:55 Europe/Stockholm requested difficulty color canon: Easy = green, Medium = yellow, Hard = orange, Brutal = red.
  - 2026-05-04 10:59 Europe/Stockholm requested difficulty badge readability tweak: make text inside all colored difficulty pills black.
  - 2026-05-04 11:04 Europe/Stockholm requested difficulty badge refinement: darken Hard orange so it is more distinct from Medium yellow, and make Absurd black with red text.
  - 2026-05-04 11:08 Europe/Stockholm requested difficulty badge sizing refinement: make all difficulty pills the same size with centered text.
  - 2026-05-04 11:15 Europe/Stockholm requested active quest + card sizing refinement: replace the separate active pill with a custom stamp/sticker graphic over the card and make quest cards a uniform size instead of varying by content length.
  - 2026-05-04 11:23 Europe/Stockholm progress: shipped custom active-quest stamp artwork plus uniform quest-card sizing; proof doc `docs/SQC_ACTIVE_QUEST_STAMP_UNIFORM_CARDS_2026-05-04.md`. Verification: `pnpm lint`, `pnpm build`, commit `aca72a5`, push to `origin/main`, production deploy to `https://cc-cglbakfd6-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, live `/challenges` smoke, direct `/active-quest-stamp.svg` smoke, and old `active-quest-inline` absent.
  - 2026-05-04 11:31 Europe/Stockholm requested active stamp refinement: make the stamp background transparent and place it over the coat-of-arms/text area so it does not require taller cards.
  - 2026-05-04 11:36 Europe/Stockholm requested follow-up: cache-bust the transparent active stamp and move it slightly upward on the card.
  - 2026-05-04 12:14 Europe/Stockholm progress: added and deployed a homepage Friend quest loop on top of latest `origin/main` so the core share flow is explicit — pick today’s quest, send the exact quest link, then compare proof receipts; proof doc `docs/SQC_HOMEPAGE_FRIEND_DARE_LOOP_LIVE_DEPLOY_2026-05-04.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-211ap4wrf-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, live smoke for preview/canonical `/`, canonical `/share-kit`, canonical `/proof-log`, homepage content assertions for the friend-quest strings, and Vercel error-log scan with no logs found.
  - 2026-05-04 12:58 Europe/Stockholm progress: tightened the signed-in homepage current-run card so active quest holders get a direct `Run latest-game check` CTA to `/account` plus a secondary `Review active rules` link; proof doc `docs/SQC_HOMEPAGE_ACTIVE_QUEST_CHECK_CTA_LIVE_DEPLOY_2026-05-04.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-p8u73oo1e-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, live smoke for deploy/canonical `/`, canonical `/account`, and canonical `/challenges`, plus Vercel production error-log check with no error entries.
  - 2026-05-04 14:02 Europe/Stockholm progress: tightened the signed-in `/challenges` active-quest panel so active quest holders can run the latest-game check, review rules, or share the active dare directly from the hub; proof doc `docs/SQC_CHALLENGE_HUB_ACTIVE_QUEST_ACTIONS_LIVE_DEPLOY_2026-05-04.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-ro1lpik67-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, and live smoke for preview/canonical `/challenges`, canonical `/account`, and canonical `/dare/queen-never-heard-of-her`.
  - 2026-05-04 14:45 Europe/Stockholm requested quest hub cleanup: remove the separate `Active quest` section, move `Recommended starter route` to the bottom, and remove the `Full deck proof is live` note/copy from that starter route section.
  - 2026-05-04 14:55 Europe/Stockholm requested quest hub replacement: remove the `Full quest deck` intro section and replace it with an actual filter/sort function for the quest deck.
  - 2026-05-04 15:02 Europe/Stockholm progress: shipped quest deck filter/sort browser; proof doc `docs/SQC_QUEST_HUB_FILTER_SORT_REPLACEMENT_2026-05-04.md`. Verification: `pnpm lint`, `pnpm build`, commit `cf3da43`, push to `origin/main`, production deploy to `https://cc-77i1vgh6c-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, and live `/challenges` smoke confirming filter/sort copy present and old intro copy absent.
  - 2026-05-04 15:06 Europe/Stockholm requested quest hub hero cleanup: remove the `Quest Hub` eyebrow/pill above the page title.
  - 2026-05-04 15:11 Europe/Stockholm requested quest filter cleanup: remove the `Quest deck` eyebrow/pill above the filter/sort heading.
  - 2026-05-04 15:17 Europe/Stockholm requested filtered-grid polish: when filters return fewer than three quests, keep quest cards at normal deck-card width instead of stretching a single card across the row.
  - 2026-05-04 15:44 Europe/Stockholm progress: removed the rectangular black backgrounds from all ten coming-soon quest badge assets; proof doc `docs/SQC_COMING_SOON_BADGE_ALPHA_FIX_LIVE_DEPLOY_2026-05-04.md`. Verification: visual QA on transparent PNGs and white composites, `pnpm lint`, `pnpm build`, commit `5d6017d`, push to `origin/main`, production deploy to `https://cc-j9wq3sje1-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, live smoke for `/`, `/challenges`, `/badges`, `/today`, and direct PNG alpha checks for two representative coming-soon badge assets.
  - 2026-05-04 16:50 Europe/Stockholm progress: tightened `/dare/[id]` friend-quest invite landing pages with a visible quickstart contract: exact quest, verifier state, reward, latest-public-game proof, save/check/receipt actions, and verifier evidence so shared quest links are clearer for private-beta testers. Proof doc `docs/SQC_DARE_FRIEND_QUEST_QUICKSTART_LIVE_DEPLOY_2026-05-04.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, commit `1e73131`, pushed to `origin/main`, production deploy to `https://cc-mtsx5q5n0-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, live smoke for deploy/canonical `/dare/queen-never-heard-of-her`, canonical `/account`, canonical `/result`, Vercel inspect `Ready`, and bounded log watch with no runtime errors observed.
  - 2026-05-02 16:42 Europe/Stockholm requested launch-polish subtask: use the current SQC logo as the site favicon/app icon, with build proof and live route verification.
  - 2026-05-02 16:50 Europe/Stockholm progress: shipped SQC-logo favicon/app-icon set (`favicon.ico`, `icon.png`, `apple-icon.png`) from current `public/sqc-logo.png`; proof doc `docs/SQC_LOGO_FAVICON_LAUNCH_POLISH_2026-05-02.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-chom8qw7y-andreas-nordenadlers-projects.vercel.app`, alias to `https://sidequestchess.com`, and live smoke for `/`, `/favicon.ico`, `/icon.png`, and `/apple-icon.png`.
  - 2026-05-02 16:54 Europe/Stockholm requested launch-polish subtask: apply feedback from `~/Downloads/SQC Beta Test feedback.docx` on the homepage: reduce clutter/box nesting, replace text-heavy brand lockup with logo, remove confusing logged-in onboarding/profile prompts, make points readable, and standardize visible language around quests instead of mixing dare/challenge/quest.
  - 2026-05-02 17:02 Europe/Stockholm progress: shipped homepage/nav simplification from beta feedback; proof doc `docs/SQC_HOME_FEEDBACK_SIMPLIFICATION_2026-05-02.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-cw6fljat6-andreas-nordenadlers-projects.vercel.app`, alias to `https://sidequestchess.com`, and live smoke for `/`, `/challenges`, `/account`, `/support`, and `/sqc-logo.png`.
  - 2026-05-02 17:11 Europe/Stockholm requested follow-up from `~/Downloads/Feedback 2.docx`: remove oversized logo treatment/top-bar heaviness, avoid duplicate three-button/three-step structure, reduce remaining boxes-within-boxes, replace the single oversized beginner quest card with 2–3 recommended quests or Today, and keep the funny text while clarifying naming.
  - 2026-05-02 17:18 Europe/Stockholm progress: shipped second homepage simplification pass; proof doc `docs/SQC_HOME_FEEDBACK_2_SIMPLIFICATION_2026-05-02.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-9xcae5qew-andreas-nordenadlers-projects.vercel.app`, alias to `https://sidequestchess.com`, and live smoke for `/`, `/challenges`, `/today`, and `/support`.
  - 2026-05-02 19:53 Europe/Stockholm requested launch-polish subtask: show quest badge/logo art in the `Recommended first quests` homepage list so the section looks richer without adding extra cards.
  - 2026-05-02 19:59 Europe/Stockholm progress: shipped recommended quest logo/badge art; proof doc `docs/SQC_RECOMMENDED_QUEST_LOGOS_2026-05-02.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-9uk4infq9-andreas-nordenadlers-projects.vercel.app`, manual alias set for apex/www, and live smoke confirming `quest-list-logo`, `challenge-badge-token`, and `Recommended first quests` on the homepage.
  - 2026-05-02 19:56 Europe/Stockholm requested visual refinement: recommended quest logos should have no boxes around them and the text should sit under the logo.
  - 2026-05-02 20:03 Europe/Stockholm progress: shipped clean logo-over-text recommended quest layout; proof doc `docs/SQC_RECOMMENDED_QUEST_LOGOS_CLEAN_LAYOUT_2026-05-02.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-l2rxb0ouw-andreas-nordenadlers-projects.vercel.app`, manual alias set for apex/www, and live smoke confirming `clean-quest-logo-card`, `clean-quest-logo`, and `clean-quest-copy` on the homepage.
  - 2026-05-02 20:00 Europe/Stockholm requested visual refinement: remove the remaining square/list backgrounds, remove the roundish background behind difficulty text, and remove the circle behind badge symbols.
  - 2026-05-02 20:20 Europe/Stockholm progress: shipped bare recommended quest badge layout; proof doc `docs/SQC_RECOMMENDED_QUEST_BARE_BADGE_LAYOUT_2026-05-02.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, prebuilt production deploy to `https://cc-6n6tracn7-andreas-nordenadlers-projects.vercel.app` after removing stalled queued deployments, manual alias set for apex/www, and live smoke confirming `clean-quest-logo-card` plus `Recommended first quests` on the homepage.
  - 2026-05-02 23:48 Europe/Stockholm issue/follow-up: Andreas could not see the clean logo-over-text change. Replace the recommended quest badge component wrappers with bare badge image markup and inline layout styles so stale cached CSS or wrapper backgrounds cannot preserve squares/circles.
  - 2026-05-02 23:57 Europe/Stockholm progress: shipped final bare image layout for recommended quests; proof doc `docs/SQC_RECOMMENDED_QUEST_FINAL_BARE_IMAGE_LAYOUT_2026-05-02.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, prebuilt production deploy to `https://cc-rkjfofxuz-andreas-nordenadlers-projects.vercel.app`, manual alias set for apex/www, and live smoke confirming `final-bare-quest-card`/`final-bare-quest-logo` while `challenge-badge-token` and `badge-token-motif` are absent from homepage recommendations.
  - 2026-05-02 23:53 Europe/Stockholm requested top-bar polish: remove signed-in `Start quest` button and replace the `SQC` text pill with a transparent SIDE QUEST CHESS wordmark graphic matching the logo direction.
  - 2026-05-03 00:04 Europe/Stockholm progress: shipped top-nav wordmark polish; proof doc `docs/SQC_TOP_NAV_WORDMARK_POLISH_2026-05-02.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, prebuilt production deploy to `https://cc-bhb7famne-andreas-nordenadlers-projects.vercel.app`, manual alias set for apex/www, live smoke confirming `sqc-wordmark.svg`/`nav-wordmark`, absence of `Start quest`, and direct SVG route.
  - 2026-05-03 15:58 Europe/Stockholm autonomous launch-polish progress: shipped `/today` readiness preflight so the daily quest explains the three-step verification loop before users leave for Lichess/Chess.com: save identity, play today’s exact quest, then check latest games from Account/result. Proof doc `docs/SQC_TODAY_READINESS_PREFLIGHT_2026-05-03.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-oaepqesku-andreas-nordenadlers-projects.vercel.app`, alias to `https://sidequestchess.com`, live smoke for deploy `/today`, canonical `/today`, canonical `/account`, and Vercel 500 scan with 0 recent errors.
  - 2026-05-03 16:50 Europe/Stockholm progress: made `/today` less route-hunty by letting signed-in runners make the daily quest active directly from the Today page while signed-out visitors keep a clean connect-first path; proof doc `docs/SQC_TODAY_DIRECT_ACTIVE_QUEST_START_LIVE_DEPLOY_2026-05-03.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-hip003wwf-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, live smoke for deploy/canonical `/today`, canonical `/challenges`, canonical `/account`, and Vercel deploy inspect status `Ready`.
  - 2026-05-03 17:49 Europe/Stockholm progress: added a `/result` friend-quest handoff so every passed/failed/pending receipt can immediately dare the next person with the same quest-specific invite instead of ending at generic share copy; proof doc `docs/SQC_RESULT_FRIEND_QUEST_HANDOFF_LIVE_DEPLOY_2026-05-03.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-adb8kdzcj-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, live smoke for deploy/canonical `/result`, canonical `/dare/knights-before-coffee`, canonical `/share-kit`, content assertions for the new result invite card, Vercel inspect `Ready`, and Vercel production error-log scan with no logs found.
  - 2026-05-03 18:44 Europe/Stockholm progress: added a proof-path handoff to every `/dare/[id]` friend-quest page so invite recipients see `Accept → Play → Prove`, explicit no-PGN/no-password reassurance, and direct Account/receipt handoffs before they leave to play; proof doc `docs/SQC_DARE_PROOF_PATH_HANDOFF_LIVE_DEPLOY_2026-05-03.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-2079vxllu-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, live smoke for deploy/canonical `/dare/knights-before-coffee`, canonical `/account`, canonical `/result`, content assertions for the new proof-path copy, Vercel inspect `Ready`, and Vercel production error-log scan with no logs found.
  - 2026-05-03 19:58 Europe/Stockholm progress: tightened `/challenges` proof clarity by replacing the fake/static `Most failed` card with a real `10/10 quests` live-backed deck count and adding a `Full deck proof is live.` note so the starter route reads as choice-pressure reduction, not partial verifier coverage; proof doc `docs/SQC_CHALLENGE_HUB_LIVE_DECK_CLARITY_LIVE_DEPLOY_2026-05-03.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-hhintuj43-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, live smoke for deploy/canonical `/challenges`, `/account`, and `/beta`, content assertions for live-deck strings and stale `Most failed` absence, plus Vercel 500 scan with 0 recent errors.
  - 2026-05-03 21:48 Europe/Stockholm progress: made `/dare/[id]` friend-quest pages directly accept/save the exact dared quest for signed-in runners while keeping a clear connect-first path for signed-out recipients; proof doc `docs/SQC_DARE_DIRECT_ACCEPT_LIVE_DEPLOY_2026-05-03.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-j9sy04wpe-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, live smoke for deploy/canonical `/dare/knights-before-coffee`, canonical `/challenges/knights-before-coffee`, canonical `/result`, Vercel inspect `Ready`, and bounded Vercel log watch with no emitted output.
  - 2026-05-03 23:00 Europe/Stockholm progress: deployed the latest clean `origin/main` quest-hub clarity build through `4bf44a8` to production; proof doc `docs/SQC_QUEST_HUB_CLARITY_PRODUCTION_DEPLOY_2026-05-03.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-64qupdy4e-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, live smoke for deploy/canonical `/`, canonical `/challenges`, `/beta`, and `/support`, plus Vercel 500 scan with `0` recent errors.
  - 2026-05-03 23:48 Europe/Stockholm progress: polished friend-quest terminology on `/dare/[id]` and `/result` so visible launch copy says friend quest / next quest instead of stale dare framing; proof doc `docs/SQC_FRIEND_QUEST_TERMINOLOGY_POLISH_LIVE_DEPLOY_2026-05-03.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-2xb1n4kts-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, live smoke for deploy/canonical `/dare/knights-before-coffee`, canonical `/result`, content assertions for the new friend-quest/result strings, Vercel inspect `Ready`, and bounded log watch with no runtime output.
  - 2026-05-04 10:59 Europe/Stockholm progress: added a `/path` “Before you play” proof eligibility checklist so first private-beta testers know to use their latest public standard Lichess/Chess.com game, play bullet/blitz/rapid, complete the quest rule, and win before checking the receipt; proof doc `docs/SQC_STARTER_PATH_PROOF_ELIGIBILITY_CHECKLIST_LIVE_DEPLOY_2026-05-04.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-ds1oruzzj-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, live smoke for deploy/canonical `/path`, canonical `/rules`, and canonical `/account`, canonical `/path` content assertions, plus bounded Vercel log watch with no error patterns.
  - 2026-05-02 23:58 Europe/Stockholm requested top-bar refinement: previous wordmark was clipped/not showing properly; make it a smaller picture wordmark with a logo-like serif treatment so it fits better.
  - 2026-05-03 00:10 Europe/Stockholm progress: shipped smaller PNG top-nav wordmark; proof doc `docs/SQC_TOP_NAV_WORDMARK_FIT_REFINEMENT_2026-05-02.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, prebuilt production deploy to `https://cc-1mo1cnifk-andreas-nordenadlers-projects.vercel.app`, manual alias set for apex/www, live smoke confirming `sqc-wordmark.png`/`nav-wordmark`, absence of old SVG and `Start quest`, and direct PNG route.
  - 2026-05-03 00:23 Europe/Stockholm requested launch-polish subtask: remove the visible “Side Quest Chess” top-bar brand/text-image and leave replacement branding for later.
  - 2026-05-03 00:30 Europe/Stockholm progress: removed the visible top-bar brand lockup while keeping primary nav/auth actions unchanged; proof doc `docs/SQC_REMOVE_TOP_BAR_WORDMARK_2026-05-03.md`. Verification: `pnpm lint`, `pnpm build`, production deploy from rebased latest `main` to `https://cc-isxhx0rp4-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, live smoke confirmed deploy/canonical `/` return HTTP 200, newer `Support` nav link remains present, and rendered top nav no longer contains `brand-text`, `wordmark-brand`, `nav-wordmark`, or `<strong>Side Quest Chess</strong>`.
  - 2026-05-03 01:55 Europe/Stockholm progress: restored `Home` as the first top-nav item after the wordmark removal left the primary nav starting at `Quests`; proof doc `docs/SQC_RESTORE_HOME_NAV_AFTER_WORDMARK_REMOVAL_2026-05-03.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-luvgvuna8-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, live smoke confirmed deploy/canonical `/` have `Home` before `Quests`, `Support` remains present, removed wordmark classes/text remain absent, and Vercel deployment error-log scan found no errors.
  - 2026-05-03 03:20 Europe/Stockholm progress: tightened the homepage trust card so first-time testers see public chess-data-only verification, an explicit no-password warning, and direct links to support/privacy plus proof rules; proof doc `docs/SQC_HOMEPAGE_PRIVATE_BETA_TRUST_CARD_LIVE_DEPLOY_2026-05-03.md`. Verification: `pnpm lint`, `pnpm build`, production deploy to `https://cc-dsfmecjgo-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, live smoke for deploy/canonical `/`, canonical `/support`, and canonical `/rules`, trust-string content assertions, and Vercel error-log check.
  - 2026-05-04 20:52 Europe/Stockholm progress: added a quest-detail friend-dare handoff so every `/challenges/[id]` rules page now exposes copy/share actions for the exact `/dare/[id]` invite without route hunting; proof doc `docs/SQC_QUEST_DETAIL_FRIEND_DARE_HANDOFF_LIVE_DEPLOY_2026-05-04.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-4na7vkqp2-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, live smoke for deploy/canonical `/challenges/knights-before-coffee` and `/dare/knights-before-coffee`, and Vercel 500 scan with no logs found.
  - 2026-05-03 05:18 Europe/Stockholm progress: tightened `/connect` private-beta handoff so testers move from username setup into account preflight, starter-route selection, and one latest-game receipt instead of treating connection as the end of setup; proof doc `docs/SQC_CONNECT_PRIVATE_BETA_HANDOFF_TIGHTENING_LIVE_DEPLOY_2026-05-03.md`. Verification: `pnpm lint`, `pnpm build`, production deploy from latest `origin/main` to `https://cc-b7h94co4k-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, live smoke for deploy/canonical `/connect`, canonical `/account`, canonical `/beta`, canonical `/support`, and Vercel production 500 scan with no logs found.
  - 2026-05-03 05:58 Europe/Stockholm progress: added a copyable `/support` packet so friends/private-beta testers can paste one diagnosable note when setup, receipt, rule, or UI moments go wrong; proof doc `docs/SQC_SUPPORT_COPYABLE_PACKET_LIVE_DEPLOY_2026-05-03.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-ha6qrn5cb-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, live smoke for deploy/canonical `/support`, canonical `/`, and canonical `/beta`, plus live content assertions for the copyable support packet fields.
  - 2026-05-03 10:22 Europe/Stockholm requested launch-polish terminology pass: enforce visible SQC wording as `quest` instead of `dare` or `challenge` across product copy, metadata/share text, verifier/result messages, nav labels, and support/beta/account surfaces. Proof doc: `docs/SQC_QUEST_TERMINOLOGY_COPY_PASS_2026-05-03.md`.
  - 2026-05-03 10:58 Europe/Stockholm progress: made the `/path` starter ladder the obvious first-run route by adding `Starter path` to primary nav, changing the homepage primary CTA to `Start starter path`, and keeping `Browse quests` plus `Connect account` as secondary choices; proof doc `docs/SQC_STARTER_PATH_FIRST_RUN_FLOW_LIVE_DEPLOY_2026-05-03.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-bh6tush77-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, live smoke for deploy/canonical `/` and `/path`, and Vercel production error-log scan with no logs found.
  - 2026-05-03 11:49 Europe/Stockholm progress: aligned the homepage, nav, quest hub, connect handoff, and account preflight around the same canonical Starter path trio (`Knights Before Coffee` → `Bishop Field Trip` → `Early King Walk`) so first-time runners do not see conflicting starter recommendations; proof doc `docs/SQC_STARTER_PATH_ALIGNMENT_LIVE_DEPLOY_2026-05-03.md`. Verification: `pnpm lint`, `pnpm build`, production deploy to `https://cc-5s8q5xna4-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, and live smoke for canonical `/`, `/path`, `/challenges`, and `/connect`.
  - 2026-05-03 13:05 Europe/Stockholm progress: tightened `/share-kit` around the core friend-share loop with a `10-second friend quest` block (`Invite → Play → Prove`) and fixed the featured quest to the queenless quest so the best-first-share copy points at the intended route; proof doc `docs/SQC_SHARE_KIT_TEN_SECOND_FRIEND_DARE_LOCAL_PROOF_2026-05-03.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-3p74z1o07-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, live smoke for preview/canonical `/share-kit` with content assertions, canonical `/path` starter trio preservation, canonical `/challenges`, `/dare/queen-never-heard-of-her`, `/result`, and `/proof-log`, plus bounded Vercel logs watch with no runtime errors emitted.
  - 2026-05-03 13:44 Europe/Stockholm progress: tightened `/result` away from beta-reporting language and toward the core public launch receipt loop (`Share → Retry → Continue`), so passed/failed/pending receipts each point to the next useful action; proof doc `docs/SQC_RESULT_LAUNCH_LOOP_TIGHTENING_LIVE_DEPLOY_2026-05-03.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-fwv5fnls1-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, live smoke for deploy/canonical `/result`, canonical `/proof-log`, and canonical `/share-kit`, plus Vercel production log check with no 500/runtime errors found.
  - 2026-05-03 14:44 Europe/Stockholm progress: tightened `/today` into a clearer daily launch loop (`one shared quest → one real game → one receipt`) with direct handoffs to connect chess account, result receipt, and proof log while keeping friend-share actions intact; proof doc `docs/SQC_TODAY_DAILY_LOOP_LAUNCH_TIGHTENING_LIVE_DEPLOY_2026-05-03.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-ikc433zh2-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, live smoke for deploy/canonical `/today`, canonical `/connect`, `/result`, and `/proof-log`, plus Vercel deployment error-log check with no logs found.
  - 2026-05-04 01:18 Europe/Stockholm progress: added a `/result` private-beta support shortcut so confusing pass/fail/pending receipts now point directly to the support packet with the needed quest/provider/username/game-link fields; proof doc `docs/SQC_RESULT_SUPPORT_PACKET_SHORTCUT_LIVE_DEPLOY_2026-05-04.md`. Verification: `pnpm lint`, `pnpm build`, production deploy, live smoke for `/result`, `/support`, and `/`.
  - 2026-05-04 01:44 Europe/Stockholm progress: added per-receipt next steps to `/proof-log` so saved passed/failed/pending receipts now point to sharing, rule review, account preflight, or support instead of becoming static history; proof doc `docs/SQC_PROOF_LOG_RECEIPT_NEXT_STEPS_LIVE_DEPLOY_2026-05-04.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-arlvxfdhs-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, live smoke for deploy/canonical `/proof-log`, canonical `/support`, and canonical `/account`, plus bounded Vercel log watch with no runtime errors observed.
  - 2026-05-04 09:58 Europe/Stockholm progress: changed challenge-detail active quest hero actions so an already-active signed-in quest points primarily to `Check latest games` instead of `Restart this bad idea`, reducing private-beta proof-loop friction; proof doc `docs/SQC_CHALLENGE_DETAIL_ACTIVE_CHECK_CTA_LIVE_DEPLOY_2026-05-04.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-52gpgnydw-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, live smoke for deploy/canonical `/challenges/knights-before-coffee`, canonical `/challenges`, canonical `/result`, Vercel inspect `Ready`, and Vercel production error-log scan with no logs found.
  - 2026-05-04 15:05 Europe/Stockholm progress: added completed-quest state to challenge detail pages so signed-in runners who already earned a quest see completed status, earned badge art, proof-log CTA, reward-banked context, and a next-quest handoff instead of an ordinary inactive/active page; proof doc `docs/SQC_COMPLETED_QUEST_DETAIL_STATE_LOCAL_PROOF_2026-05-04.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-pd6pxi19m-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, live smoke for deploy/canonical `/challenges/knights-before-coffee`, canonical `/challenges`, canonical `/proof-log`, source assertions for the signed-in completed branch, Vercel inspect `Ready`, and Vercel error-log scan with no logs found.
  - 2026-05-04 17:52 Europe/Stockholm requested quest-switch polish: make the active quest stamp much more visible on detail pages and warn before `Start quest` replaces an already-active unfinished quest, ideally with a two-coat-of-arms confirmation dialogue.
  - 2026-05-04 18:06 Europe/Stockholm progress: shipped higher-contrast active stamp plus quest-switch confirmation dialog with current/new coat-of-arms cards; proof doc `docs/SQC_ACTIVE_STAMP_SWITCH_DIALOG_LIVE_DEPLOY_2026-05-04.md`. Verification: `pnpm lint`, `pnpm build`, commit `9bf4c3e`, push to `origin/main`, production deploy to `https://cc-hkrv2m71l-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, and live smoke for canonical `/challenges/bishop-field-trip`, `/challenges/knights-before-coffee`, `/challenges`, plus `/active-quest-stamp.svg` confirming the new high-contrast stamp asset.
  - 2026-05-04 18:12 Europe/Stockholm requested active stamp style correction: SVG stamp looked too low-resolution; switch to the same crisp CSS style as the COMING SOON stamp, but green.
  - 2026-05-04 18:50 Europe/Stockholm progress: deployed the crisp CSS green active-quest stamp from commit `5cf9b13`, replacing the low-resolution SVG-style stamp treatment while preserving the quest-switch confirmation dialog; proof doc `docs/SQC_CRISP_CSS_ACTIVE_QUEST_STAMP_LIVE_DEPLOY_2026-05-04.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-mb9z01cdi-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, Vercel inspect `Ready`, live smoke for deploy/canonical `/challenges/bishop-field-trip`, canonical `/challenges`, canonical `/`, and live CSS assertion for `active-quest-stamp`/`ACTIVE QUEST`.
  - 2026-05-04 19:18 Europe/Stockholm requested active detail stamp placement tweak: move the stamp a bit lower so it clears the large title text and stays more visible.
  - 2026-05-04 19:24 Europe/Stockholm requested detail back-link casing fix: label must read `Back to Quest Hub` with B/Q/H capitalized.
  - 2026-05-04 19:29 Europe/Stockholm requested active stamp outline refinement: match the green outline treatment to the active quest card rather than the heavier sticker border.
  - 2026-05-04 19:34 Europe/Stockholm correction: Andreas meant the whole active quest-detail section should get the same green outline as quest cards; undo the stamp-outline change and apply active-card outline treatment to the full detail hero.
  - 2026-05-04 19:42 Europe/Stockholm requested active detail action-row polish: rename `Send to friend` to `Share this Quest`, replace ambiguous `Restart` with `Deactivate`, and require a confirmation dialog before clearing an active quest.
  - 2026-05-04 19:49 Europe/Stockholm requested latest-game checker UX change: remove the primary `Check latest games` hero button for active quests and add a status section directly under the hero with provider rows, last-checked stats, latest receipt, and a `Refresh` button.
  - 2026-05-04 19:55 Europe/Stockholm requested quest-status layout tweak: move the `Refresh` button from the status header/top-right to the bottom-left of the status panel.
  - 2026-05-04 19:58 Europe/Stockholm requested removal of redundant quest-detail `Proof check` block now that the active quest status panel owns latest-game proof/checker context.
  - 2026-05-04 20:02 Europe/Stockholm requested quest-detail content restructure: separate `What you need to do` section felt weak; integrate its useful three-step run flow after the stronger Rules list instead.
  - 2026-05-04 20:07 Europe/Stockholm diagnosed provider status issue: Refresh was checking Lichess first and stopping when both Lichess and Chess.com usernames existed, so Chess.com status could remain `No check recorded yet`; fix should refresh and record separate attempts for every connected provider.
  - 2026-05-04 20:10 Europe/Stockholm requested removal of remaining redundant lower quest-detail sections: `Badge reward`, `Send this quest`, and `Your run` are now duplicative of the hero/status/rules flow and should be removed.
  - 2026-05-04 20:16 Europe/Stockholm requested next SQC follow-up for tomorrow: when a logged-in user activates a quest, automatically run the latest-game checker immediately instead of requiring the first manual `Refresh`. **Cleared by 2026-05-05 fresh-baseline reset; do not execute unless Andreas re-requests it.**
  - 2026-05-04 20:18 Europe/Stockholm Andreas supplied an alternative ornate `SQC` logo for top-bar testing. Asset saved as `public/brand/sqc-alt-logo-topbar-test.jpg`; likely needs transparent/cropped treatment before final nav use because the supplied file includes a light checkerboard background. **Cleared by 2026-05-05 fresh-baseline reset; do not pursue unless Andreas re-requests it.**
  - 2026-05-04 20:24 Europe/Stockholm Andreas requested SQC planning tasks: expand/revisit Brutal and Absurd quests so they are truly viral/streamer-hard (possibly requiring rated games for Absurd); design rankings/top players/quest popularity/statistics loops; and explore showing a chessboard with the last move/final proof position for completed quests. Planning docs added: `docs/SQC_BRUTAL_ABSURD_QUEST_EXPANSION_NOTES_2026-05-04.md`, `docs/SQC_RANKINGS_TOP_PLAYERS_STATS_NOTES_2026-05-04.md`, and `docs/SQC_COMPLETED_QUEST_CHESSBOARD_LAST_MOVE_NOTES_2026-05-04.md`. **Cleared by 2026-05-05 fresh-baseline reset; these are historical only unless Andreas re-requests them.**
  - 2026-05-04 02:55 Europe/Stockholm progress: added a `/proof-log` receipt-state explainer so empty/new proof logs preview passed/failed/pending outcomes and their next actions before a tester has saved history; proof doc `docs/SQC_PROOF_LOG_RECEIPT_STATE_CLARITY_LIVE_DEPLOY_2026-05-04.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-nj5q94pjs-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, live smoke for deploy/canonical `/proof-log`, canonical `/result`, and canonical `/support`, plus Vercel inspect status `Ready`.
  - 2026-05-04 04:50 Europe/Stockholm progress: added a homepage proof-loop section so testers see `Pick the dare → Play real chess → Prove or retry` before choosing a quest, with direct routes into `/challenges`, `/account`, `/result`, and `/proof-log`; proof doc `docs/SQC_HOMEPAGE_PROOF_LOOP_CLARITY_LIVE_DEPLOY_2026-05-04.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-hecsfyvk3-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, live smoke for deploy/canonical `/`, canonical `/account`, and canonical `/proof-log`, plus bounded Vercel log stream with no fatal runtime log captured.
  - 2026-05-04 05:50 Europe/Stockholm progress: polished remaining proof-loop terminology so the homepage and proof log say `quest` / `quest back` instead of leaking older dare/challenge framing; proof doc `docs/SQC_QUEST_TERMINOLOGY_PROOF_LOOP_POLISH_LIVE_DEPLOY_2026-05-04.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-3i1s9e49n-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, live smoke for deploy/canonical `/`, canonical `/proof-log`, and canonical `/account`, homepage/proof-log content assertions, and Vercel inspect `Ready`.
  - 2026-05-04 22:00 Europe/Stockholm progress: clarified `/challenges` so the hub separates the live-backed deck from foggy coming-soon cards: hero copy now says to pick from the live-backed deck, the filter counter shows live quest count instead of combined live+future count, and coming-soon count is secondary. Proof doc `docs/SQC_CHALLENGE_HUB_LIVE_BACKED_COUNT_CLARITY_LIVE_DEPLOY_2026-05-04.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-c9r44q3y8-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, live smoke for deploy/canonical `/challenges`, and bounded Vercel runtime log watch with no errors observed.
  - Acceptance:
    - First-time public launch path is clear: pick quest → connect chess account → play real game → get receipt/badge.
    - Homepage and challenge hub emphasize the core product loop over secondary/admin/beta surfaces.
    - Roadmap prioritizes onboarding clarity, E2E reliability, UI simplification, quest-loop quality, and launch polish.
    - Trust basics are present before broader public traffic: privacy/data note, contact/support, and clear Lichess/Chess.com explanation.
  - Verification: future completion requires live deploy proof plus Andreas/user E2E test feedback.
  - 2026-04-30 01:50 Europe/Stockholm progress: tightened `/connect` provider copy so private-beta testers see accurate full starter-deck support on both Lichess and Chess.com instead of stale partial Chess.com parity wording; proof doc `docs/SQC_CONNECT_DUAL_HOST_COPY_LIVE_DEPLOY_2026-04-30.md`. Verification: `pnpm lint`, `pnpm build`, production deploy to `https://cc-73nvty5ae-andreas-nordenadlers-projects.vercel.app`, live smoke for `/connect` on deploy URL and `https://sidequestchess.com`, plus `/beta` smoke on the primary domain.
  - 2026-04-30 02:58 Europe/Stockholm progress: added `/result` receipt next-step guidance so private-beta testers know what to do after passed, failed, or pending latest-game checks; proof doc `docs/SQC_RESULT_RECEIPT_NEXT_STEP_GUIDANCE_LIVE_DEPLOY_2026-04-30.md`. Verification: `pnpm lint`, `pnpm build`, production deploy to `https://cc-g4q52l8qr-andreas-nordenadlers-projects.vercel.app`, live smoke for preview/canonical `/result`, canonical `/beta`, `/account`, and `/connect`, plus a Vercel error-log scan with no logs found.
  - 2026-04-30 03:52 Europe/Stockholm progress: added a `/result` beta report shortcut that turns the current receipt into copyable challenge/status/latest-check/game/next-action/fairness-note facts so testers do not have to reconstruct confusing moments; proof doc `docs/SQC_RESULT_BETA_REPORT_SHORTCUT_LIVE_DEPLOY_2026-04-30.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, canonical production deploy to `https://cc-1iahtqys6-andreas-nordenadlers-projects.vercel.app`, live smoke for preview/canonical `/result`, canonical `/beta`, and canonical `/account`, plus a bounded Vercel log stream with no emitted runtime errors.
  - 2026-04-28 12:50 Europe/Stockholm progress: promoted `Bishop Field Trip` from specified-only to live-backed Lichess latest-game verification and deployed it to `https://sidequestchess.com`; proof doc `docs/SQC_BISHOP_FIELD_TRIP_LICHESS_VERIFIER_LIVE_DEPLOY_2026-04-28.md`. `Early King Walk` remains the only specified-only beginner verifier.
  - 2026-04-28 14:45 Europe/Stockholm progress: promoted `Early King Walk` from specified-only to live-backed Lichess latest-game verification and deployed it to `https://sidequestchess.com`; proof doc `docs/SQC_EARLY_KING_WALK_LICHESS_VERIFIER_LIVE_DEPLOY_2026-04-28.md`. All three beginner starter quests are now live-backed on Lichess.
  - 2026-04-28 16:05 Europe/Stockholm progress: promoted `Knights Before Coffee` from Lichess-only to dual-host Lichess + Chess.com latest-game verification and deployed it to `https://sidequestchess.com`; proof doc `docs/SQC_CHESSCOM_KNIGHTS_BEFORE_COFFEE_LATEST_GAME_ADAPTER_LIVE_DEPLOY_2026-04-28.md`. The private-beta verifier path now has two dual-host quests: `Knights Before Coffee` and `No Castle Club`.
  - 2026-04-28 16:55 Europe/Stockholm progress: promoted `Bishop Field Trip` from Lichess-only to dual-host Lichess + Chess.com latest-game verification and deployed it to `https://sidequestchess.com`; proof doc `docs/SQC_CHESSCOM_BISHOP_FIELD_TRIP_LATEST_GAME_ADAPTER_LIVE_DEPLOY_2026-04-28.md`. The private-beta verifier path now has three dual-host quests: `Bishop Field Trip`, `Knights Before Coffee`, and `No Castle Club`; `Early King Walk` remains the next Lichess-only beginner adapter candidate.
  - 2026-04-28 17:55 Europe/Stockholm progress: promoted `Early King Walk` from Lichess-only to dual-host Lichess + Chess.com latest-game verification and deployed it to `https://sidequestchess.com`; proof doc `docs/SQC_CHESSCOM_EARLY_KING_WALK_LATEST_GAME_ADAPTER_LIVE_DEPLOY_2026-04-28.md`. All three beginner quests now support both Lichess and Chess.com latest-game checks; the private-beta verifier path now has four dual-host quests: `Bishop Field Trip`, `Early King Walk`, `Knights Before Coffee`, and `No Castle Club`.
  - 2026-04-28 18:50 Europe/Stockholm progress: added a dedicated `/beta` friends/private beta notes surface with tester checklist, public-game-data explanation, no-password trust warning, and support/reporting guidance; proof doc `docs/SQC_PRIVATE_BETA_TRUST_NOTES_LIVE_DEPLOY_2026-04-28.md`. Deployed to `https://sidequestchess.com`; smoke confirmed `/beta`, `/`, and `/connect` return 200 and live content includes the new trust/support strings.
  - 2026-04-28 19:52 Europe/Stockholm progress: tightened `/verifiers`, `/beta`, and `/connect` private-beta copy so the product accurately surfaces four dual-host latest-game quests today (all beginner quests plus No Castle Club) and names the remaining Lichess-only parity lane; proof doc `docs/SQC_PRIVATE_BETA_DUAL_HOST_STATUS_COPY_LIVE_DEPLOY_2026-04-28.md`. Deployed to `https://sidequestchess.com`; live smoke confirmed `/verifiers`, `/beta`, and `/connect` return 200 with the updated dual-host strings.
  - 2026-04-28 21:52 Europe/Stockholm progress: promoted `Queen? Never Heard of Her` from Lichess-only to dual-host Lichess + Chess.com latest-game verification and deployed it to `https://sidequestchess.com`; proof doc `docs/SQC_CHESSCOM_QUEEN_NEVER_HEARD_OF_HER_LATEST_GAME_ADAPTER_LIVE_DEPLOY_2026-04-28.md`. The private-beta verifier path now has five dual-host quests: the three beginner quests, `No Castle Club`, and `Queen? Never Heard of Her`.
  - 2026-04-28 22:40 Europe/Stockholm progress: promoted `Pawn Storm Maniac` from Lichess-only to dual-host Lichess + Chess.com latest-game verification and deployed it to `https://sidequestchess.com`; proof doc `docs/SQC_CHESSCOM_PAWN_STORM_MANIAC_LATEST_GAME_ADAPTER_LIVE_DEPLOY_2026-04-28.md`. The private-beta verifier path now has six dual-host quests: the three beginner quests, `No Castle Club`, `Queen? Never Heard of Her`, and `Pawn Storm Maniac`.
  - 2026-04-28 23:40 Europe/Stockholm progress: promoted `Rookless Rampage` from Lichess-only to dual-host Lichess + Chess.com latest-game verification locally; proof doc `docs/SQC_CHESSCOM_ROOKLESS_RAMPAGE_LATEST_GAME_ADAPTER_LOCAL_PROOF_2026-04-28.md`. The private-beta verifier path reached seven dual-host quests in the local build.
  - 2026-04-29 00:55 Europe/Stockholm progress: deployed the Rookless Rampage Chess.com latest-game adapter from a clean isolated worktree to avoid shipping unrelated dirty checkout files; proof doc `docs/SQC_CHESSCOM_ROOKLESS_RAMPAGE_LATEST_GAME_ADAPTER_LIVE_DEPLOY_2026-04-29.md`. The private-beta verifier path now has seven dual-host quests live on `https://sidequestchess.com`: the three beginner quests, `No Castle Club`, `Queen? Never Heard of Her`, `Pawn Storm Maniac`, and `Rookless Rampage`.
  - 2026-04-29 01:55 Europe/Stockholm progress: promoted `Knightmare Mode` from Lichess-only to dual-host Lichess + Chess.com latest-game verification and prepared it in the same clean isolated deploy worktree; proof doc `docs/SQC_CHESSCOM_KNIGHTMARE_MODE_LATEST_GAME_ADAPTER_LIVE_DEPLOY_2026-04-29.md`. The private-beta verifier path now has eight dual-host quests: the three beginner quests, `No Castle Club`, `Queen? Never Heard of Her`, `Pawn Storm Maniac`, `Knightmare Mode`, and `Rookless Rampage`.
  - 2026-04-29 03:46 Europe/Stockholm progress: promoted `One Bishop to Rule Them All` from Lichess-only to dual-host Lichess + Chess.com latest-game verification and deployed it to `https://sidequestchess.com`; proof doc `docs/SQC_CHESSCOM_ONE_BISHOP_LATEST_GAME_ADAPTER_LIVE_DEPLOY_2026-04-29.md`. The private-beta verifier path now has nine dual-host quests: the three beginner quests, `No Castle Club`, `Queen? Never Heard of Her`, `Pawn Storm Maniac`, `Knightmare Mode`, `Rookless Rampage`, and `One Bishop to Rule Them All`.
  - 2026-04-29 04:40 Europe/Stockholm progress: promoted `The Blunder Gambit` from Lichess-only to dual-host Lichess + Chess.com latest-game verification and deployed it to `https://sidequestchess.com`; proof doc `docs/SQC_CHESSCOM_BLUNDER_GAMBIT_LATEST_GAME_ADAPTER_LIVE_DEPLOY_2026-04-29.md`. The private-beta verifier path now has ten dual-host quests: the three beginner quests, `No Castle Club`, `Queen? Never Heard of Her`, `Pawn Storm Maniac`, `Knightmare Mode`, `Rookless Rampage`, `One Bishop to Rule Them All`, and `The Blunder Gambit`.
  - 2026-04-29 06:40 Europe/Stockholm verification: re-verified the full ten-quest private-beta deck from clean `origin/main` and production. All tests/lint/build passed, `/verifiers`, `/beta`, `/connect`, `/account`, and every challenge route returned 200 with dual-host live-backed copy; proof doc `docs/SQC_PRIVATE_BETA_FULL_DUAL_HOST_DECK_VERIFICATION_2026-04-29.md`.
  - 2026-04-29 07:50 Europe/Stockholm progress: updated `/beta` and `/verifiers` so the private-beta UI no longer talks like Chess.com parity is still partial after full starter-deck dual-host coverage landed; proof doc `docs/SQC_FULL_DUAL_HOST_BETA_COPY_LIVE_DEPLOY_2026-04-29.md`. Deployed to `https://sidequestchess.com`; live smoke confirmed `/beta` shows `full dual-host deck` / `All ten current starter-deck quests` and `/verifiers` shows `Full deck parity` / `0 left`.
  - 2026-04-29 08:42 Europe/Stockholm progress: tightened `/account` end-to-end test-drive and quest-launcher copy so the manual QA path now matches full dual-host coverage; proof doc `docs/SQC_ACCOUNT_TEST_DRIVE_FULL_DUAL_HOST_COPY_LIVE_DEPLOY_2026-04-29.md`. Deployed to `https://sidequestchess.com`; live `/account` smoke confirmed the new either-username, all-ten-dual-host, and pass/fail/pending receipt strings.
  - 2026-04-29 09:42 Europe/Stockholm progress: added a `/beta` live deck checklist so friends/private beta testers can see all ten dual-host starter quests, each objective, and direct rules links in one place before running the proof loop; proof doc `docs/SQC_PRIVATE_BETA_LIVE_DECK_CHECKLIST_DEPLOY_2026-04-29.md`. Deployed to `https://sidequestchess.com`; local proof passed `pnpm lint` and `pnpm build`, and live smoke confirmed the checklist strings on preview/canonical `/beta` while `/verifiers` retained full-deck quest names.
  - 2026-04-29 10:48 Europe/Stockholm progress: added a dedicated `/beta` five-minute tester script so friends can run the exact private-beta loop `identity → quest → receipt`; proof doc `docs/SQC_PRIVATE_BETA_FIVE_MINUTE_TESTER_SCRIPT_LIVE_DEPLOY_2026-04-29.md`. Deployed to `https://sidequestchess.com` via `https://cc-oste6sqk4-andreas-nordenadlers-projects.vercel.app`; smoke confirmed `/beta` contains the tester-script strings and `/account` plus `/connect` return 200.
  - 2026-04-29 11:42 Europe/Stockholm progress: added an adaptive `/account` private-beta preflight checklist so testers can see whether sign-in, chess identity, active dare, and latest-game receipt are ready before sharing feedback; proof doc `docs/SQC_ACCOUNT_PRIVATE_BETA_PREFLIGHT_LIVE_DEPLOY_2026-04-29.md`. Deployed to `https://sidequestchess.com` via `https://cc-o77pi64wd-andreas-nordenadlers-projects.vercel.app`; local proof passed `pnpm lint` and `pnpm build`, live `/account` smoke confirmed the new preflight strings, and `/beta` plus `/connect` returned 200.
  - 2026-04-29 12:55 Europe/Stockholm progress: added a `/beta` feedback packet so friends know exactly what to send back after a test run: challenge, chess source, receipt outcome, and screenshot/context if confusing; proof doc `docs/SQC_PRIVATE_BETA_FEEDBACK_PACKET_LIVE_DEPLOY_2026-04-29.md`. Deployed to `https://sidequestchess.com` via `https://cc-17o3n4vj9-andreas-nordenadlers-projects.vercel.app`; local proof passed `pnpm lint` and `pnpm build`, live `/beta` smoke confirmed the new feedback-packet strings, and `/account` plus `/connect` returned 200.
  - 2026-04-29 13:55 Europe/Stockholm progress: added a copyable `/beta` feedback template so friends can send one structured report with challenge, chess source, username, game link, receipt outcome, fairness note, confusing moment, and screenshot status; proof doc `docs/SQC_PRIVATE_BETA_COPYABLE_FEEDBACK_TEMPLATE_LIVE_DEPLOY_2026-04-29.md`. Deployed to `https://sidequestchess.com` via `https://cc-927qblgoa-andreas-nordenadlers-projects.vercel.app`; local proof passed `pnpm lint` and `pnpm build`, live smoke confirmed `/beta`, `/account`, and `/connect` return 200 with the new template strings on canonical and preview URLs.
  - 2026-04-29 15:58 Europe/Stockholm progress: added a filled `/beta` feedback example under the copy/paste template so friends can see the expected level of context without turning beta reports into homework; proof doc `docs/SQC_PRIVATE_BETA_FEEDBACK_EXAMPLE_LIVE_DEPLOY_2026-04-29.md`. Deployed to `https://sidequestchess.com` via `https://cc-2hifwwn6x-andreas-nordenadlers-projects.vercel.app`; local proof passed `pnpm lint` and `pnpm build`, live smoke confirmed preview/canonical `/beta` return 200 with `Example report`, `sampletester`, `casual game counted`, and the template markers, while `/account` and `/connect` returned 200.
  - 2026-04-29 16:42 Europe/Stockholm progress: added a ready-to-send `/beta` friend invite block so Andreas can ask a tester to run the exact private-beta loop without rewriting instructions; proof doc `docs/SQC_PRIVATE_BETA_FRIEND_INVITE_LIVE_DEPLOY_2026-04-29.md`. Deployed to `https://sidequestchess.com` via `https://cc-8c26ysnlt-andreas-nordenadlers-projects.vercel.app`; local proof passed `pnpm lint` and `pnpm build`, live smoke confirmed preview/canonical `/beta` return 200 with `Want to test Side Quest Chess?`, while `/account` and `/connect` returned 200.
  - 2026-04-29 17:52 Europe/Stockholm progress: added `/beta` receipt outcome guidance so friends know what to do after passed, failed, or pending latest-game checks instead of treating non-passes as dead ends; proof doc `docs/SQC_PRIVATE_BETA_RECEIPT_OUTCOME_GUIDANCE_LIVE_DEPLOY_2026-04-29.md`. Deployed to `https://sidequestchess.com` via `https://cc-i2wvz0bk5-andreas-nordenadlers-projects.vercel.app`; local proof passed `pnpm install --frozen-lockfile`, `pnpm lint`, and `pnpm build`, and live smoke confirmed preview/canonical `/beta` plus canonical `/account` and `/connect` return 200 with the new outcome-guidance strings.
  - 2026-04-29 18:42 Europe/Stockholm progress: added `/beta` private-beta green-light criteria so Andreas can decide when the next wider friend-tester wave is ready; proof doc `docs/SQC_PRIVATE_BETA_GREEN_LIGHT_CRITERIA_LIVE_DEPLOY_2026-04-29.md`. Deployed to `https://sidequestchess.com` via `https://cc-iygvu1eey-andreas-nordenadlers-projects.vercel.app`; local proof passed `pnpm install --frozen-lockfile`, `pnpm lint`, and `pnpm build`, and live smoke confirmed preview/canonical `/beta` plus canonical `/account` return 200 with the new green-light strings.
  - 2026-04-29 19:42 Europe/Stockholm progress: added a `/beta` first tester wave plan so the next private-beta invite round stays small, diagnostic, dual-provider, and gated by two clean tester loops before widening. Proof doc: `docs/SQC_PRIVATE_BETA_FIRST_TESTER_WAVE_PLAN_LIVE_DEPLOY_2026-04-29.md`.
  - 2026-04-29 20:42 Europe/Stockholm progress: added a `/beta` first-wave scorecard so Andreas can log each friend test with comparable provider, quest, receipt, fairness, friction, and clean-loop fields before widening the private beta. Proof doc: `docs/SQC_PRIVATE_BETA_FIRST_WAVE_SCORECARD_LIVE_DEPLOY_2026-04-29.md`.
  - 2026-04-29 23:42 Europe/Stockholm progress: added a `/beta` Sam-run internal beta pass so launch-readiness testing can continue even when external friend feedback is sparse; proof doc `docs/SQC_SAM_RUN_BETA_PASS_LIVE_DEPLOY_2026-04-29.md`.
  - 2026-04-30 06:50 Europe/Stockholm progress: added a private beta starter route to `/challenges` so testers have a recommended order (`Knights Before Coffee` → `No Castle Club` → `Queen? Never Heard of Her`) instead of facing the full quest deck cold; proof doc `docs/SQC_CHALLENGE_HUB_BETA_STARTER_ROUTE_LIVE_DEPLOY_2026-04-30.md`. Deployed to `https://sidequestchess.com`; live smoke confirmed `/challenges`, `/beta`, and `/account` return 200 and `/challenges` contains `Private beta starter route`, `Three picks that remove choice paralysis`, and the three starter-route quest names.
  - 2026-04-30 13:44 Europe/Stockholm progress: added a homepage `First run checklist` so new players can understand the core loop from `/` without route hunting: connect chess identity, choose one live-backed quest, then read the latest receipt after playing. Proof doc `docs/SQC_HOMEPAGE_FIRST_RUN_CHECKLIST_LIVE_DEPLOY_2026-04-30.md`. Verification: clean `origin/main` worktree, `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, pushed to `main`, production deploy to `https://cc-i098a76ma-andreas-nordenadlers-projects.vercel.app`, live smoke on deploy + canonical `/`, `/connect`, `/challenges`, and `/result`, plus Vercel 500 scan with 0 recent errors.
  - 2026-04-30 14:50 Europe/Stockholm progress: added a challenge-detail `First proof path` block so each quest page explains the exact launch loop after accepting a dare: start this quest, play and win one eligible public Lichess/Chess.com game, then check latest games for a pass/fail/pending receipt. Proof doc `docs/SQC_CHALLENGE_DETAIL_FIRST_PROOF_PATH_LIVE_DEPLOY_2026-04-30.md`. Verification: clean `origin/main` worktree, `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-7lb9fy73i-andreas-nordenadlers-projects.vercel.app`, live smoke on deploy + canonical `/challenges/no-castle-club`, canonical `/challenges`, `/connect`, and `/result`, live detail-string checks, plus bounded Vercel log scan with no 500/error strings.
  - 2026-04-30 15:54 Europe/Stockholm progress: added a `/connect` `Connection handoff` block so saving a chess identity leads directly to the core proof loop instead of ending at setup: choose a live-backed quest, play and win one eligible public game, then read the latest-game receipt. Proof doc `docs/SQC_CONNECT_HANDOFF_PATH_LIVE_DEPLOY_2026-04-30.md`. Verification: clean `origin/main` worktree, `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-ftop1c4m8-andreas-nordenadlers-projects.vercel.app`, live smoke on deploy + canonical `/connect`, canonical `/challenges`, and `/result`, plus bounded Vercel log scan with no suspicious error tokens.
  - 2026-04-30 16:44 Europe/Stockholm progress: added a `/challenges` latest-game proof-loop explainer so private-beta testers understand `accept → play a normal public Lichess/Chess.com game → verify latest game from Account` before choosing a dare, with explicit no-PGN-upload/no-engine-dashboard framing. Proof doc `docs/SQC_CHALLENGE_HUB_PROOF_LOOP_GUIDANCE_LIVE_DEPLOY_2026-04-30.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-l2tycn21b-andreas-nordenadlers-projects.vercel.app`, live smoke for preview/canonical `/challenges`, canonical `/account`, `/beta`, `/connect`, and `/result`, content-string smoke, and bounded Vercel log stream with no emitted runtime errors.
  - 2026-05-01 11:55 Europe/Stockholm progress: added a dedicated `/support` support/privacy route and linked it from the primary nav, homepage trust block, and private-beta guide so friends/private beta testers can see what data SQC reads, that chess-site passwords are never needed, and what to send when a receipt/setup/UI issue appears. Proof doc `docs/SQC_SUPPORT_PRIVACY_ROUTE_LIVE_DEPLOY_2026-05-01.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-h3hlsdh86-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, live smoke for `/support`, `/beta`, and `/`, plus bounded Vercel runtime-log scan with no emitted error/500/exception/crash lines.
  - 2026-05-01 14:18 Europe/Stockholm progress: tightened the challenge-detail `First proof path` into a stronger `Before you start` contract so every quest tells users upfront that the loop is one dare, one real public Lichess/Chess.com win, and one latest-game check with no PGN upload. Proof doc `docs/SQC_CHALLENGE_DETAIL_START_CONTRACT_LIVE_DEPLOY_2026-05-01.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-lpvt9n5cb-andreas-nordenadlers-projects.vercel.app`, live smoke for deploy/canonical `/challenges/knights-before-coffee`, canonical `/challenges`, and canonical `/account`, content-string smoke, plus bounded Vercel log watch with no emitted runtime errors.
  - 2026-05-01 20:58 Europe/Stockholm progress: added an `/account` first tester route so private-beta runners can make one of the three recommended starter dares active directly from account preflight instead of choosing from the full ten-quest deck cold; proof doc `docs/SQC_ACCOUNT_FIRST_TESTER_ROUTE_LIVE_DEPLOY_2026-05-01.md`. Verification: `pnpm lint`, `pnpm build`, production deploy to `https://cc-9qhj5qpfl-andreas-nordenadlers-projects.vercel.app`, live smoke on deploy/canonical `/account`, canonical `/challenges`, canonical `/result`, and Vercel error-log scan with no logs.
  - 2026-05-04 06:51 Europe/Stockholm progress: reordered `/challenges` so the recommended starter route appears before the full ten-quest deck, then added a `Full quest deck` bridge; proof doc `docs/SQC_CHALLENGE_HUB_STARTER_ROUTE_FIRST_LIVE_DEPLOY_2026-05-04.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-386fr0677-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, live smoke on deploy/canonical `/challenges` confirmed starter-route-before-full-deck ordering, canonical `/account` and `/result` returned 200, and a bounded Vercel log watch emitted no runtime log lines before timeout.
  - 2026-05-04 07:58 Europe/Stockholm progress: made `/path` directly activate the next starter quest for signed-in runners and each unfinished starter-path card, while signed-out visitors get a clear connect-first path; proof doc `docs/SQC_STARTER_PATH_DIRECT_ACTIVATION_LIVE_DEPLOY_2026-05-04.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, commit `672ce6c`, pushed to `origin/main`, production deploy to `https://cc-4uzz6sxrw-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`, live smoke for deploy/canonical `/path`, canonical `/challenges`, and canonical `/result`, Vercel inspect `Ready`, and bounded log watch with no runtime output.
  - 2026-05-02 02:44 Europe/Stockholm progress: simplified `/beta` after Andreas said no more beta-tester functionality is needed, removing the extra tester scripts/templates/wave-planning blocks while keeping the private-beta trust basics and correcting the page back to full ten-quest dual-host verifier copy; proof doc `docs/SQC_BETA_PAGE_SIMPLIFICATION_LIVE_DEPLOY_2026-05-02.md`. Verification: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, production deploy to `https://cc-hdwpy0ppc-andreas-nordenadlers-projects.vercel.app`, live smoke on deploy/canonical `/beta`, canonical `/account`, canonical `/challenges`, and Vercel production error-log scan with no logs.


- [x] Promote Early King Walk to dual-host Lichess + Chess.com latest-game verification.
  - added_at: 2026-04-28 17:40 Europe/Stockholm
  - completed_at: 2026-04-28 17:55 Europe/Stockholm
  - source: friends/private beta hardening item; after `Bishop Field Trip` reached Chess.com parity, `Early King Walk` was the remaining Lichess-only beginner quest.
  - Acceptance:
    - Chess.com PGN SAN moves normalize into the same Early King Walk verifier shape used by Lichess.
    - Castling is detected but does not count as a king walk.
    - The quest still requires player win, standard chess, and the existing bullet/blitz/rapid v1 eligibility posture.
    - `/verifiers`, `/account`, and the challenge detail page show dual-host live-backed verifier copy.
  - Verification: `pnpm exec node --experimental-strip-types --test tests/chesscom-early-king-walk-fixtures.mjs`, `pnpm exec node --experimental-strip-types --test tests/*.mjs`, `pnpm lint`, `pnpm build`, direct adapter smoke for Chess.com username `and72nor`, production deploy, live smoke for `/verifiers`, `/challenges/early-king-walk`, `/account`, and preview `/verifiers`, plus Vercel production error-log scan.
  - Proof: added `docs/SQC_CHESSCOM_EARLY_KING_WALK_LATEST_GAME_ADAPTER_LIVE_DEPLOY_2026-04-28.md`; live deployment `https://cc-bil366uw1-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `Early King Walk`, `Live-backed Lichess + Chess.com latest-game verifier`, `Chess.com PGN`, `non-castling king move`, `Quest launcher`, and `Chess.com:` on production surfaces.

- [x] Promote Early King Walk to a live Lichess latest-game verifier.
  - added_at: 2026-04-28 14:40 Europe/Stockholm
  - completed_at: 2026-04-28 14:45 Europe/Stockholm
  - source: friends/private beta hardening item; `Early King Walk` was the remaining specified-only beginner quest after Knights Before Coffee and Bishop Field Trip were promoted.
  - Acceptance:
    - `Early King Walk` latest-game checks normalize Lichess move feeds and verify a non-castling king move before the player's move 12.
    - Castling is tracked but does not count as the king walk.
    - The quest requires a player win, standard chess, and the existing bullet/blitz/rapid v1 eligibility posture.
    - `/verifiers`, `/account`, and the challenge detail page show it as live-backed rather than specified-only.
  - Verification: `pnpm exec node --experimental-strip-types --test tests/early-king-walk-fixtures.mjs`, `pnpm exec node --experimental-strip-types --test tests/*.mjs`, `pnpm lint`, `pnpm build`, production deploy, live smoke for `/verifiers`, `/challenges/early-king-walk`, `/account`, and `/path`, plus bounded Vercel deployment log watch.
  - Proof: added `docs/SQC_EARLY_KING_WALK_LICHESS_VERIFIER_LIVE_DEPLOY_2026-04-28.md`; live deployment `https://cc-ibigalde1-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `Early King Walk`, `Live-backed Lichess latest-game verifier`, `non-castling king move`, and `Castling does not count` on production surfaces.

- [x] Promote Bishop Field Trip to a live Lichess latest-game verifier.
  - added_at: 2026-04-28 12:40 Europe/Stockholm
  - completed_at: 2026-04-28 12:50 Europe/Stockholm
  - source: friends/private beta hardening item; next visible value was making the second beginner quest honest and live-backed.
  - Acceptance:
    - `Bishop Field Trip` latest-game checks normalize Lichess move feeds and verify both original player bishops moved before the player queen moved.
    - The quest requires a player win, standard chess, and the existing bullet/blitz/rapid v1 eligibility posture.
    - `/verifiers`, `/account`, and the challenge detail page show it as live-backed rather than specified-only.
  - Verification: `pnpm exec node --experimental-strip-types --test tests/bishop-field-trip-fixtures.mjs`, `pnpm exec node --experimental-strip-types --test tests/*.mjs`, `pnpm lint`, `pnpm build`, production deploy, live smoke for `/verifiers`, `/challenges/bishop-field-trip`, `/account`, and `/path`, plus bounded Vercel deployment log watch.
  - Proof: added `docs/SQC_BISHOP_FIELD_TRIP_LICHESS_VERIFIER_LIVE_DEPLOY_2026-04-28.md`; live deployment `https://cc-1jcho73px-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `Bishop Field Trip`, `Live-backed`, and bishop/queen rule copy on production surfaces.

- [x] Promote Knights Before Coffee to a live Lichess latest-game verifier.
  - added_at: 2026-04-28 11:40 Europe/Stockholm
  - completed_at: 2026-04-28 11:49 Europe/Stockholm
  - source: autonomous bounded burst after Andreas clarified beginner quests should be win-required and visually badged; highest visible next value was making the first beginner quest actually live-backed.
  - Acceptance:
    - `Knights Before Coffee` latest-game checks normalize Lichess move feeds and verify the first four player moves were knight moves.
    - The quest still requires a player win, standard chess, and the existing bullet/blitz/rapid v1 eligibility posture.
    - `/verifiers`, `/account`, and the challenge detail page show it as live-backed rather than specified-only.
  - Verification: `pnpm --dir /Users/sam/.openclaw/workspace/cc exec node --experimental-strip-types --test tests/knights-before-coffee-fixtures.mjs`, `pnpm lint`, `pnpm build`, production deploy, live smoke for `/verifiers`, `/challenges/knights-before-coffee`, `/account`, and `/path`, plus bounded Vercel deployment log watch.
  - Proof: added `docs/SQC_KNIGHTS_BEFORE_COFFEE_LICHESS_VERIFIER_LIVE_DEPLOY_2026-04-28.md`; live deployment `https://cc-aeb041pe2-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `Knights Before Coffee`, `Live-backed`, and `first four player moves` on production surfaces.

- [x] Correct beginner quests to require wins and add illustrated coat-of-arms assets.
  - added_at: 2026-04-28 11:27 Europe/Stockholm
  - completed_at: 2026-04-28 11:36 Europe/Stockholm
  - source: Andreas clarified that every quest should require a win and asked for the new quests to get coat-of-arms badges like the others.
  - Acceptance:
    - New beginner quest objectives/rules/proof callouts require winning, not just finishing.
    - SQC canon records that quests should require wins by default.
    - Each new beginner quest has a generated illustrated coat-of-arms badge wired into challenge metadata.
    - Badge assets follow the existing SQC badge style canon.
  - Verification: generated badge QA, `pnpm lint`, `pnpm build`, production deploy, live smoke for `/path`, `/challenges`, the three new detail pages, `/badges`, and `/account`.

- [x] Introduce three beginner quests and make the starter path use them.
  - added_at: 2026-04-28 11:05 Europe/Stockholm
  - completed_at: 2026-04-28 11:12 Europe/Stockholm
  - source: Andreas asked for three beginner quests: one very simple but still abnormal, then two gentle increases in difficulty.
  - Acceptance:
    - Add a very simple beginner quest based on moving only knights for the first four moves.
    - Add a second slightly harder but still easy beginner quest.
    - Add a third beginner stretch quest.
    - Starter path uses the beginner quests instead of jumping directly into harder live-backed dares.
    - Verifier status is honest when a new beginner quest is specified but not automated yet.
  - Verification: `pnpm lint`, `pnpm build`, production deploy, live smoke for `/path`, `/challenges`, each new challenge detail route, and `/account`.

- [x] Add an account-page quest launcher so the test-drive flow can start any live-backed starter dare from `/account`.
  - added_at: 2026-04-28 10:40 Europe/Stockholm
  - completed_at: 2026-04-28 10:47 Europe/Stockholm
  - source: continue the SQC account test-drive path so Andreas can test profile setup, quest selection, latest-game checking, and result review without route hunting.
  - Acceptance:
    - `/account` shows every starter dare with badge art, difficulty, reward points, and live-backed verifier status.
    - Signed-in runners can make a quest active directly from `/account`; signed-out visitors get rule-preview links.
    - Existing auth, verifier rules, metadata shape, and result receipts are unchanged.
  - Verification: `pnpm lint`, `pnpm build`, production deploy, live `/account` smoke on deploy URL and `sidequestchess.com`, `/challenges` and `/result` smoke, and bounded Vercel deployment log watch.
  - Proof: added `docs/SQC_ACCOUNT_QUEST_LAUNCHER_LIVE_DEPLOY_2026-04-28.md`; live deployment `https://cc-blg3xvowx-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; `/account` live smoke confirmed `Quest launcher`, `Pick a live-backed dare`, and `Preview rules`; `/challenges` and `/result` returned HTTP 200; Vercel deployment log stream showed no fresh error output during the bounded watch.

- [x] Add an account-page end-to-end test-drive checklist for the SQC login/profile/quest/result loop.
  - added_at: 2026-04-28 09:40 Europe/Stockholm
  - completed_at: 2026-04-28 09:52 Europe/Stockholm
  - source: Andreas wants to test logging in, editing profile, adding Lichess username, doing quests, and checking results.
  - Acceptance:
    - `/account` exposes a visible manual QA path for profile setup, quest selection, latest-game check, and result receipt review.
    - The checklist links directly to profile setup and either first quest selection or the latest result, without changing auth, verifier rules, or metadata shape.
  - Verification: `pnpm lint`, `pnpm build`, production deploy, live `/account` smoke on deploy URL and `sidequestchess.com`, `/profile` and `/result` smoke, and Vercel production error-log scan.
  - Proof: added `docs/SQC_ACCOUNT_TEST_DRIVE_CHECKLIST_LIVE_DEPLOY_2026-04-28.md`; live deployment `https://cc-rdms177zk-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; `/account` live smoke confirmed `Try the full SQC loop in five minutes.` and `manual QA path`; `/profile` and `/result` returned HTTP 200; Vercel production error-log scan returned no logs.

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
  - Verification: `pnpm lint`, `pnpm build`, local production smoke for `/challenges`, `/challenges/queen-never-heard-of-her`, and `/verifiers`; production deploy; production smoke for `https://sidequestchess.com/challenges`, `/challenges/queen-never-heard-of-her`, `/verifiers`, and `/rules`; bounded Vercel error-log scan with no logs found.
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
  - Verification: `pnpm lint`, `pnpm build`, local route smoke for `/today`, `/random`, and `/share-kit`, production deploy, production smoke for `https://sidequestchess.com/today`, `/random`, `/share-kit`, and `/challenges/queen-never-heard-of-her`, plus bounded Vercel error-log scan with no logs found.
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
