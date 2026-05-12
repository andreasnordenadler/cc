# CC Roadmap

Last updated: 2026-05-12 16:31 Europe/Stockholm
Owner: Sam  
Status: SQC-mobile-focus / website-feature-freeze

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

## Launch candidate baseline — 2026-05-07

Andreas confirmed at 2026-05-07 20:38 Europe/Stockholm that he is happy with the current SQC web state as-is. This marks the current production state as the **Side Quest Chess Launch Candidate** baseline.

- Baseline commit: `2a27d05` (`Remove homepage proof scroll backdrop`)
- Production URL: `https://sidequestchess.com`
- Baseline doc: `docs/SQC_LAUNCH_CANDIDATE_BASELINE_2026-05-07.md`
- Rule: future changes should be deliberate launch-candidate deltas and keep this baseline easy to identify for rollback/comparison.

## Website feature freeze — 2026-05-09

Andreas confirmed at 2026-05-09 10:21 Europe/Stockholm that the SQC **website** is good as it is right now.

Rules from this point:

- Freeze new SQC website features by default.
- Any new website feature requires Andreas approval before implementation.
- Allowed without extra approval: bug fixes, UI polish, copy clarity, production-hardening fixes, and regression fixes that preserve the current product shape.
- Exception: scheduled quest releases may continue according to the existing quest-release schedule.
- Do not use old autonomous backlog items as permission to add new website product features.
- Mobile app/auth work is separate from this website feature freeze unless Andreas explicitly extends the freeze to mobile.

- [x] Remove pill-style labels from auth pages.
  - added_at: 2026-05-11 15:00 Europe/Stockholm
  - completed_at: 2026-05-11 15:02 Europe/Stockholm
  - source: Andreas showed the sign-in page and asked to remove all the pills.
  - Proof: sign-in page no longer shows the `User login` eyebrow pill or the three reassurance pills; sign-up page received the same cleanup for consistency.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-dgddzxitb-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/sign-in` no longer includes `User login` or the three reassurance pill texts, and `/sign-up` no longer includes `Create user profile` or its reassurance pill texts.

- [x] Match auth left copy card height to right sign-in card.
  - added_at: 2026-05-11 15:05 Europe/Stockholm
  - completed_at: 2026-05-11 15:07 Europe/Stockholm
  - source: Andreas showed the sign-in page and asked to match the size of the left section to the right.
  - Proof: desktop auth layout now uses stretched/equal-height columns; left copy card has reduced heading scale, tighter copy rhythm, and centered compact content to visually match the right sign-in form card.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-ane5bghzq-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/sign-in` returns 200 with auth layout classes and copy still present.

- [x] Fill sign-in copy card with lightweight privacy reassurance.
  - added_at: 2026-05-11 15:10 Europe/Stockholm
  - completed_at: 2026-05-11 15:13 Europe/Stockholm
  - source: Andreas said the sign-in left card became too empty, asked to keep the headline at the top and add more text explaining what SQC does not ask for/store so users understand login is lightweight.
  - Proof: sign-in left card has top-aligned headline and useful non-pill copy about no chess-site passwords, public usernames/games, minimal saved quest/proof progress, and when sign-in is needed.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-7o78ocoax-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/sign-in` returns 200 with headline, `Lightweight by design.`, no-password reassurance, minimal-storage copy, and Multiplayer Quest sign-in context.

- [x] Update sign-in no-password reassurance copy.
  - added_at: 2026-05-11 15:23 Europe/Stockholm
  - completed_at: 2026-05-11 15:25 Europe/Stockholm
  - source: Andreas asked to change `We do not ask for your Lichess or Chess.com password.` to `We do not need or ask for any Lichess or Chess.com passwords.`
  - Proof: `/sign-in` uses the requested exact sentence.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-9u4r3e00c-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/sign-in` includes the new exact sentence and no longer includes the old sentence.

- [x] Preserve Multiplayer Quest create destination through sign-in.
  - added_at: 2026-05-11 15:35 Europe/Stockholm
  - completed_at: 2026-05-11 15:38 Europe/Stockholm
  - source: Andreas reported that logged-out users clicking `Create Multiplayer...` land on sign-in and then unexpectedly end up at `My Side Quests` instead of the create page.
  - Proof: anonymous `/groupquests/create` redirects to sign-in with a safe local return target; sign-in/sign-up pages consume safe local `redirect_url` and pass it to Clerk fallback redirects, while default sign-in still falls back to `/account`.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-nxadxupg3-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests` references the new SVG and the SVG asset returns 200 as `image/svg+xml`.

- [x] Replace Multiplayer Side Quest graphic with noble chess-table chaos scene.
  - added_at: 2026-05-11 15:48 Europe/Stockholm
  - completed_at: 2026-05-11 15:52 Europe/Stockholm
  - source: Andreas said he was still not happy with the graphic and requested noble men/women funnily fighting around a chess table on a transparent background.
  - Proof: logged-out Multiplayer Side Quests story card uses a transparent-background noble chess-table chaos illustration instead of the prior knight/proof-scroll image.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-nxadxupg3-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests` references the new SVG and the SVG asset returns 200 as `image/svg+xml`.

- [x] Upgrade Multiplayer Side Quest graphic to Coat of Arms quality.
  - added_at: 2026-05-11 16:00 Europe/Stockholm
  - completed_at: 2026-05-11 16:03 Europe/Stockholm
  - source: Andreas said the replacement did not work well and should match the Coat of Arms quality/style.
  - Proof: logged-out Multiplayer Side Quests story card uses a premium generated coat-of-arms-style noble chess-table chaos artwork with transparent PNG background, matching the SQC badge visual language better than the previous SVG.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-qaqehfqf9-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests` references the new PNG and the PNG asset returns 200 as `image/png`.

- [x] Remove logged-out Multiplayer Side Quest story graphic.
  - added_at: 2026-05-11 16:01 Europe/Stockholm
  - completed_at: 2026-05-11 16:04 Europe/Stockholm
  - source: Andreas showed the latest logged-out `/groupquests` graphic and asked to remove it.
  - Proof: logged-out `/groupquests` no longer renders the story-card illustration/graphic; surrounding text remains intact.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-oc4vhghfd-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests` returns 200, no longer contains the graphic wrapper or new/old artwork refs, and keeps the story text intact.

- [x] Add Invite stage to Multiplayer Side Quest flow.
  - added_at: 2026-05-11 16:02 Europe/Stockholm
  - completed_at: 2026-05-11 16:06 Europe/Stockholm
  - source: Andreas showed the logged-out `/groupquests` flow and noted it is missing `Invite` between stages 1 and 2.
  - Proof: Multiplayer Side Quest flow reads `Create. Invite. Play. Prove.` and renders Invite as stage 2, shifting Play/Prove to stages 3/4.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-3c8npmu0q-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests` returns 200 and includes `Create. Invite. Play. Prove.`, `Invite`, invite-link copy, and stage 4 numbering.

- [x] Match Multiplayer Quest create defaults to screenshot.
  - added_at: 2026-05-11 16:37 Europe/Stockholm
  - completed_at: 2026-05-11 16:40 Europe/Stockholm
  - source: Andreas showed the create Multiplayer Side Quest screen and asked to set the default choices as per the screenshot.
  - Proof: create form defaults to name `No Castle Night`, first side quest `Knights Before Coffee`, invite mode `Invite-only`, proof window `Fresh games after start`, duration `7 days`, time control `Any time control`, rated setting `Any rated state`, variant `Any variant`, and player color `Any color`.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-bapl0dgbg-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; deploy completed. Live form is auth-gated, so defaults were verified by build/source inspection rather than anonymous HTML smoke.

- [x] Add Active Multiplayer Side Quests section to logged-in homepage.
  - added_at: 2026-05-11 16:42 Europe/Stockholm
  - completed_at: 2026-05-11 16:44 Europe/Stockholm
  - source: Andreas showed the logged-in homepage and asked to list Active Multiplayer Side Quests in a separate section.
  - Proof: logged-in `/` has a distinct `Active Multiplayer Side Quests` section separate from the active solo side quest card, listing current multiplayer quest rows and linking to Multiplayer Quests.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-ptelidbnh-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; anonymous homepage smoke returned 200 and confirmed the new logged-in-only section is not leaked to signed-out visitors. Logged-in rendering was verified by build/source inspection.

- [x] Tighten logged-in homepage Active Multiplayer Side Quests section.
  - added_at: 2026-05-11 17:45 Europe/Stockholm
  - completed_at: 2026-05-11 17:47 Europe/Stockholm
  - source: Andreas asked to move green status text to the right, remove right-side row action text, remove section headline/body copy, and move/rename the button to bottom-right as `All Multiplayer Side Quests`.
  - Proof: logged-in homepage multiplayer section keeps only the eyebrow heading, rows show title/copy on left and green status on right, row action text is removed, and bottom-right button reads `All Multiplayer Side Quests`.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-k9v01ynqm-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; anonymous homepage smoke returned 200 and confirmed signed-out users do not receive old/new logged-in section copy. Logged-in layout was verified by build/source inspection.

- [x] Add Multiplayer Side Quest language to homepage.
  - added_at: 2026-05-11 17:50 Europe/Stockholm
  - completed_at: 2026-05-11 17:53 Europe/Stockholm
  - source: Andreas said `https://sidequestchess.com/` needs language around also having Multiplayer Side Quests.
  - Proof: homepage hero and signed-out explanatory copy mention solo and Multiplayer Side Quests; signed-out homepage includes a lightweight Multiplayer Side Quests callout linking to `/groupquests`.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-ly77rsusk-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/` includes `solo or multiplayer`, Multiplayer Side Quest copy, `Same nonsense, now with witnesses.`, `Browse Multiplayer Side Quests`, and multiplayer leaderboard proof language.

- [x] Reduce homepage hero headline font size.
  - added_at: 2026-05-11 18:39 Europe/Stockholm
  - completed_at: 2026-05-11 18:41 Europe/Stockholm
  - source: Andreas asked to make `Chess, but with stupidly hard side quests — solo or multiplayer.` smaller.
  - Proof: homepage main hero headline keeps the exact text but uses a smaller responsive font size than the global `h1`.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-prrrckzaf-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/` returns 200 with the exact headline and updated homepage CSS bundle includes `.simplified-home-hero h1`.

- [x] Change homepage multiplayer CTA from Browse to Join.
  - added_at: 2026-05-11 18:43 Europe/Stockholm
  - completed_at: 2026-05-11 18:45 Europe/Stockholm
  - source: Andreas said `Browse` does not seem right for the homepage Multiplayer Side Quest CTA and suggested Join/Participate.
  - Proof: signed-out homepage Multiplayer Side Quests callout CTA reads `Join Multiplayer Side Quests`.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-1glllut85-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/` includes `Join Multiplayer Side Quests` and no longer includes `Browse Multiplayer Side Quests`.

- [x] Remove remaining Browse wording from homepage multiplayer callout.
  - added_at: 2026-05-11 18:45 Europe/Stockholm
  - completed_at: 2026-05-11 18:47 Europe/Stockholm
  - source: Andreas caught remaining `Browse public Multiplayer Side Quests...` wording after the CTA was changed to Join.
  - Proof: homepage multiplayer callout body no longer uses `Browse`; it says `Join public Multiplayer Side Quests...`.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-7wtuh82x3-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/` includes the new `Join public Multiplayer Side Quests...` body copy and no longer includes `Browse public Multiplayer Side Quests`.

- [x] Restore graphic in logged-out Multiplayer story section.
  - added_at: 2026-05-11 18:49 Europe/Stockholm
  - completed_at: 2026-05-11 18:51 Europe/Stockholm
  - source: Andreas started a pass on non-logged-in `/groupquests` and noted the graphic is missing from the `A tiny chess tournament for bad ideas.` section.
  - Proof: logged-out `/groupquests` story card renders a contained Multiplayer Side Quest graphic beside the `A tiny...` copy instead of leaving the right side blank.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-oj7b1ot5f-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests` returns 200 with `A tiny...`, `groupquests-process-graphic`, and `multiplayer-side-quests-noble-chaos-coat-style.png`.

- [x] Make logged-out Multiplayer story graphic smaller.
  - added_at: 2026-05-11 18:50 Europe/Stockholm
  - completed_at: 2026-05-11 18:52 Europe/Stockholm
  - source: Andreas approved the restored graphic and asked to make it a bit smaller.
  - Proof: story-section Multiplayer graphic max width reduced from 430px to 340px so it supports the copy without dominating the card.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-9r9pkw9eb-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests` returns 200 and still references `multiplayer-side-quests-noble-chaos-coat-style.png`.

- [x] Remove logged-out Join with invite link section.
  - added_at: 2026-05-11 18:54 Europe/Stockholm
  - completed_at: 2026-05-11 18:56 Europe/Stockholm
  - source: Andreas showed the logged-out `/groupquests` `Join with invite link` section and asked to remove it.
  - Proof: logged-out `/groupquests` no longer renders the `Join with invite link` / example invite section; no internal page link targets the removed anchor.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-2mltz4fa5-andreas-nordenadlers-projects.vercel.app` completed; smoke confirmed `/groupquests` returns 200, no longer includes `Join with invite link`, `Review the rules before your proof counts.`, `Example invite`, or `join-group-side-quest`, and keeps `A tiny chess tournament for bad ideas.` intact.

- [x] Replace logged-out `See how it works` card with public join path.
  - added_at: 2026-05-11 18:58 Europe/Stockholm
  - completed_at: 2026-05-11 19:00 Europe/Stockholm
  - source: Andreas said the `See how it works` card does not make sense and suggested `Join a Public Multiplayer Side Quest`, plus the product should support hosts listing Multiplayer Side Quests as public for anyone to enter.
  - Proof: logged-out `/groupquests` second action card becomes `Join a Public Multiplayer Side Quest`, explains public host-listed quests, and links to a joinable public Multiplayer Side Quest/detail path.
  - follow_up: future create/manage flow should include a public listing option for hosts (`public anyone can enter`) beyond invite-only/private modes.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-gc2qjmsx2-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests` includes `Join a Public Multiplayer Side Quest`, `Find public Multiplayer Side Quests`, `Join public quest`, and no longer includes `See how it works` or `View the flow`.

- [x] Use full width for four Multiplayer flow subsections.
  - added_at: 2026-05-11 19:07 Europe/Stockholm
  - completed_at: 2026-05-11 19:09 Europe/Stockholm
  - source: Andreas showed the `Create. Invite. Play. Prove.` section and said it looks weird; use the full space with the four subsections.
  - Proof: `/groupquests` flow grid uses four equal columns on desktop so Create/Invite/Play/Prove fill the card width cleanly.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-be2bfc0w0-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests` returns 200 and includes `Create. Invite. Play. Prove.` plus all four stage labels.

- [x] Add mock public Multiplayer Side Quest listing page.
  - added_at: 2026-05-11 19:15 Europe/Stockholm
  - completed_at: 2026-05-11 19:18 Europe/Stockholm
  - source: Andreas asked what happens when clicking `Join Public Side Quest`, requested button text change, and suggested a mockup list of public multiplayer side quests.
  - Proof: logged-out `/groupquests` action button reads `Join Public Side Quest` and links to `/groupquests/public`; `/groupquests/public` renders a mock public Multiplayer Side Quest listing with multiple rows, rules/window metadata, and inspect/join links.
  - follow_up: add real host public-listing setting and real public join/entry flow later.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-45srzps05-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests` includes `Join Public Side Quest` linking to `/groupquests/public`, and `/groupquests/public` returns 200 with `Join a public bad idea.`, mock rows including `No Castle Night`, `Knights Before Coffee Ladder`, and `Inspect and join`.

- [ ] Keep `/groupquests/public` in the Multiplayer Side Quest product track.
  - added_at: 2026-05-11 19:20 Europe/Stockholm
  - source: Andreas said “let’s make sure we don’t forget about this page” after the mock public Multiplayer Side Quest listing page shipped.
  - acceptance: future Multiplayer Side Quest work treats `/groupquests/public` as a first-class page, not a throwaway mock; next iterations should connect it to real public listing settings, join states, filters/status, and public quest rows.
  - current_state: `/groupquests/public` is a mock listing page with public quest rows and inspect/join links.

- [x] Increase sign-in headline size to fill auth card.
  - added_at: 2026-05-11 19:21 Europe/Stockholm
  - completed_at: 2026-05-11 19:23 Europe/Stockholm
  - source: Andreas showed the sign-in page and asked to increase `Sign in, then go make terrible chess decisions.` so the unused bottom space is reduced.
  - Proof: sign-in left auth card headline is larger than the generic auth headline and better fills the card while keeping the lightweight reassurance copy.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-77ez15rb7-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/sign-in` returns 200 with the target headline.

- [x] Add public/private visibility choice to Multiplayer Quest create flow.
  - added_at: 2026-05-11 19:28 Europe/Stockholm
  - completed_at: 2026-05-11 19:31 Europe/Stockholm
  - source: Andreas approved adding a visibility choice so hosts can list Multiplayer Side Quests as public for anyone to enter, aligning `/groupquests/create` with `/groupquests/public`.
  - Proof: create builder step 3 is `Visibility` with choices `Public listing`, `Unlisted link`, and `Invite-only`; preview labels it as Visibility; create-page copy explains public/private visibility.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-fogv02j4d-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests/create` remains auth-gated and redirects to `/sign-in?redirect_url=%2Fgroupquests%2Fcreate`; `/groupquests/public` returns 200 with mock public listings; Vercel error logs for the deployment showed no logs in the last 30 minutes.

- [x] Restore create-flow explainer after wrong-section removal.
  - added_at: 2026-05-11 19:36 Europe/Stockholm
  - completed_at: 2026-05-11 19:38 Europe/Stockholm
  - source: Andreas corrected that I removed the wrong section from `/groupquests/create`.
  - Proof: restored the `Create flow` checklist/explainer section and logged the correction; next screenshot-based removal should confirm exact target if ambiguous.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-85pgoicti-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests/create` still redirects anonymous users to sign-in with return URL; source checks confirmed hero, create-flow explainer, and stage rail are removed; Vercel error logs had no recent logs.

- [x] Simplify logged-in Multiplayer Quest create page by removing intro chrome.
  - added_at: 2026-05-11 19:38 Europe/Stockholm
  - completed_at: 2026-05-11 19:40 Europe/Stockholm
  - source: Andreas clarified that both the top hero/intro area and the stage rail/checklist can be removed from logged-in `/groupquests/create`.
  - Proof: `/groupquests/create` keeps auth gating and the actual builder, but removes the top hero, create-flow explainer/checklist, and builder stage rail so logged-in hosts get straight to creating.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-85pgoicti-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests/create` still redirects anonymous users to sign-in with return URL; source checks confirmed hero, create-flow explainer, and stage rail are removed; Vercel error logs had no recent logs.

- [x] Add compact funny hero header to logged-in Multiplayer Quest create page.
  - added_at: 2026-05-11 19:42 Europe/Stockholm
  - completed_at: 2026-05-11 19:44 Europe/Stockholm
  - source: Andreas saw the stripped `/groupquests/create` page and said it probably needs a hero header, something SQC-funny.
  - Proof: `/groupquests/create` has a compact header with SQC-style funny copy (`Build a chess dare. Blame your friends later.`), without restoring the large explainer/checklist or builder stage rail.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-msbhrf7l5-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; anonymous smoke confirmed `/groupquests/create` still redirects to sign-in with return URL; source checks confirmed compact funny header is present, old big hero and stage rail remain absent; Vercel error logs had no recent logs.

- [x] Replace Multiplayer Quest duration dropdown with exact from/to schedule.
  - added_at: 2026-05-11 19:44 Europe/Stockholm
  - completed_at: 2026-05-11 19:47 Europe/Stockholm
  - source: Andreas asked whether `/groupquests/create` needs more duration options or a date/time picker from/to.
  - Proof: create builder uses `Opens` and `Closes` datetime fields plus separate proof-rule select; participant preview and local drafts show the exact schedule range instead of vague duration presets.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-q5ngc5ui6-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; anonymous smoke confirmed `/groupquests/create` still redirects to sign-in with return URL; source checks confirmed `Opens`/`Closes` datetime-local inputs and no old duration presets; Vercel error logs had no recent logs.

- [x] Update Multiplayer Quest create header wording.
  - added_at: 2026-05-11 19:44 Europe/Stockholm
  - completed_at: 2026-05-11 19:46 Europe/Stockholm
  - source: Andreas requested changing `Build a chess dare.` to `Build a Multiplayer Side Quest.`
  - Proof: `/groupquests/create` compact header reads `Build a Multiplayer Side Quest. Blame your friends later.`
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-j7vg5c9ol-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; anonymous smoke confirmed `/groupquests/create` still redirects to sign-in with return URL; source check confirmed new wording; Vercel error logs had no recent logs.

- [x] Remove confusing proof-rule dropdown from Multiplayer Quest create flow.
  - added_at: 2026-05-11 19:47 Europe/Stockholm
  - completed_at: 2026-05-11 19:50 Europe/Stockholm
  - source: Andreas noted Proof Rule was confusing and questioned whether it is needed now that the create flow has an Opens/Closes date picker.
  - Proof: create builder no longer shows Proof Rule dropdown; schedule section only has Opens/Closes; copy clarifies that qualifying games must be played inside that window for now; preview/local drafts no longer duplicate proof-rule language.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-nsz20g8mo-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; anonymous smoke confirmed `/groupquests/create` still redirects to sign-in with return URL; source checks confirmed proof-rule options are removed and schedule copy/fields remain; Vercel error logs had no recent logs.

- [x] Remove supporting paragraph from Multiplayer Quest create header.
  - added_at: 2026-05-11 19:47 Europe/Stockholm
  - completed_at: 2026-05-11 19:49 Europe/Stockholm
  - source: Andreas highlighted the compact create header paragraph and requested removing it.
  - Proof: `/groupquests/create` compact header keeps the title but removes the supporting paragraph text.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-b608jhzy5-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; anonymous smoke confirmed `/groupquests/create` still redirects to sign-in with return URL; source check confirmed title remains and supporting paragraph is removed; Vercel error logs had no recent logs.

- [x] Replace single side-quest select with multi-select picker in create flow.
  - added_at: 2026-05-11 19:50 Europe/Stockholm
  - completed_at: 2026-05-11 19:54 Europe/Stockholm
  - source: Andreas said the single first-side-quest select is problematic and users should be able to pick one or more side quests right away, suggesting checkboxes or another picker.
  - Proof: `/groupquests/create` shows selected side quests immediately, has an Add/Edit picker with checkboxes, prevents zero selected quests, and preview/local draft summaries show multiple selected side quests.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-iuzrusy4y-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; anonymous smoke confirmed `/groupquests/create` still redirects to sign-in with return URL; source checks confirmed checkbox picker, selected side quest chips/count, multi-quest preview/local summary support, and removal of the old single `First side quest` select; Vercel error logs had no recent logs.

- [x] Move side-quest picker Done action to bottom.
  - added_at: 2026-05-11 21:05 Europe/Stockholm
  - completed_at: 2026-05-11 21:07 Europe/Stockholm
  - source: Andreas liked the picker but asked for `Done Choosing` to be at the bottom and perhaps just `Done`.
  - Proof: when the side-quest picker is closed the top button reads `Add / edit side quests`; when open, the completion action is a bottom button labeled `Done`.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-5rik6s1nt-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; anonymous smoke confirmed `/groupquests/create` still redirects to sign-in with return URL; source checks confirmed bottom `Done`, removal of `Done choosing`, and top closed-state `Add / edit side quests`; Vercel error logs had no recent logs.

- [x] Tighten Multiplayer Quest time-control presets to verifiable provider metadata.
  - added_at: 2026-05-11 21:10 Europe/Stockholm
  - completed_at: 2026-05-11 21:14 Europe/Stockholm
  - source: Andreas asked to check that Lichess and Chess.com support the listed time controls and that proof can verify the used time controls.
  - evidence: live API spot-check showed Lichess game export returns `clock.initial`/`clock.increment` plus `speed/perf`; Chess.com public archive games return `time_control` and `time_class` plus PGN `[TimeControl]`.
  - Proof: removed questionable/advanced presets like `Bullet 0+1`, `Rapid 15+0`, `Classical 25+0`, `Classical 60+0`, and `Custom time control`; kept common exact presets that map to public metadata; updated create-copy to say time controls are limited to exact presets verifiable from Lichess/Chess.com metadata.
  - Follow-up: actual Multiplayer Side Quest proof enforcement still needs to compare selected locked rule against Lichess `clock` or Chess.com `time_control` when saved multiplayer proof exists.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-gzzc4hbyz-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; anonymous smoke confirmed `/groupquests/create` still redirects to sign-in with return URL; source checks confirmed questionable/custom time controls removed, representative exact presets kept, and provider metadata copy present; Vercel error logs had no recent logs.

- [ ] Wire locked time-control enforcement into real Multiplayer Side Quest proof.
  - added_at: 2026-05-11 21:14 Europe/Stockholm
  - source: Follow-up from Andreas asking whether selected time controls can actually be verified during proof.
  - acceptance: when Multiplayer Side Quests are persisted, proof verification compares the selected time-control rule against Lichess `clock.initial`/`clock.increment` or Chess.com `time_control` metadata and fails with a clear reason if the game does not match.
  - blocked_until: real persisted Multiplayer Side Quest proof flow exists.

- [x] Make side-quest picker Add/Edit button yellow.
  - added_at: 2026-05-11 21:11 Europe/Stockholm
  - completed_at: 2026-05-11 21:13 Europe/Stockholm
  - source: Andreas asked to make the `Add / edit side quests` button yellow.
  - Proof: closed side-quest picker button uses primary/yellow button styling.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-mj80jgrfc-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; anonymous smoke confirmed `/groupquests/create` still redirects to sign-in with return URL; source check confirmed `Add / edit side quests` uses primary/yellow styling; Vercel error logs had no recent logs.

- [x] Show all available Side Quests in Multiplayer create picker.
  - added_at: 2026-05-11 21:14 Europe/Stockholm
  - completed_at: 2026-05-11 21:16 Europe/Stockholm
  - source: Andreas asked whether the side-quest picker should display all available quests instead of a limited subset.
  - Proof: `/groupquests/create` passes all `CHALLENGES` into the picker instead of slicing to the first 8, so Add/Edit can choose from the complete current Side Quest catalogue.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-6pxxg2wnu-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; anonymous smoke confirmed `/groupquests/create` still redirects to sign-in with return URL; source check confirmed `CHALLENGES.map` with no first-8 slice; Vercel error logs had no recent logs.

- [x] Update Multiplayer Quest preview card for multiple selected quests.
  - added_at: 2026-05-11 21:18 Europe/Stockholm
  - completed_at: 2026-05-11 21:21 Europe/Stockholm
  - source: Andreas liked the preview card but noted it needs updating now that Multiplayer Side Quests can include multiple quests.
  - Proof: preview card shows a quest stack/list with selected count, handles one-or-many selected quests in copy, removes the old single side-quest stat, and updates maintenance/proof wording for per-quest review.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-r8doh6njx-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; anonymous smoke confirmed `/groupquests/create` still redirects to sign-in with return URL; source checks confirmed quest-stack preview, multi-quest copy, per-selected-side-quest maintenance wording, and no old single side-quest stat; Vercel error logs had no recent logs.

- [x] Make Multiplayer Side Quests standard-chess-only for now.
  - added_at: 2026-05-11 21:22 Europe/Stockholm
  - completed_at: 2026-05-11 21:24 Europe/Stockholm
  - source: Andreas doubted the `Variant` selector because non-standard variants may not be compatible with Side Quest proof.
  - Proof: removed the Variant dropdown from create rules; create copy and participant preview state that Multiplayer Side Quests use standard chess only for now.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-ks9rz9az4-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; anonymous smoke confirmed `/groupquests/create` still redirects to sign-in with return URL; source checks confirmed variant dropdown/options removed and standard-only copy/preview present; Vercel error logs had no recent logs.

- [x] Simplify Multiplayer Quest participant preview and use numeric share URL.
  - added_at: 2026-05-11 21:34 Europe/Stockholm
  - completed_at: 2026-05-11 21:37 Europe/Stockholm
  - source: Andreas said Participant Preview may include too much; `Locked Rules` is probably not needed; share link should be a complete URL; each Multiplayer Side Quest should have a unique numeric ID that is also the URL.
  - Proof: preview removes `Locked rules`, shows a complete `https://sidequestchess.com/groupquests/{numericId}` share URL, and mock local drafts use the numeric ID instead of a mutable name slug.
  - follow_up: when Multiplayer Side Quests become persisted, generate real unique numeric IDs server-side and route detail pages by that ID.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-fqf4vfr0v-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; anonymous smoke confirmed `/groupquests/create` still redirects to sign-in with return URL; source checks confirmed Locked Rules preview removal, complete numeric share URL, public ID helper, and no old slug helper; Vercel error logs had no recent logs.

- [ ] Generate real persisted numeric IDs for Multiplayer Side Quest URLs.
  - added_at: 2026-05-11 21:34 Europe/Stockholm
  - source: Follow-up from Andreas preference that each Multiplayer Side Quest should have a unique number that is shareable and is also the URL.
  - acceptance: persisted Multiplayer Side Quest records get stable unique numeric public IDs; invite/detail/share routes resolve by numeric ID; IDs do not change when the title changes.
  - blocked_until: real Multiplayer Side Quest persistence is implemented.

- [x] Add game-rule constraints to Multiplayer Quest preview card.
  - added_at: 2026-05-11 21:39 Europe/Stockholm
  - completed_at: 2026-05-11 21:42 Europe/Stockholm
  - source: Andreas clarified that the selected game-rule constraints should all appear in the participant preview card.
  - Proof: preview card includes compact participant-facing rule summary for Time control, Rated setting, Player color, and Standard chess only, while keeping share URL and quest stack visible.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-9vj0kjg1w-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; anonymous smoke confirmed `/groupquests/create` still redirects to sign-in with return URL; source checks confirmed preview rule grid includes Time control, Rated, Color, Variant, and Standard chess only; Vercel error logs had no recent logs.

- [x] Remove host/action controls from Participant Preview card.
  - added_at: 2026-05-11 21:44 Europe/Stockholm
  - completed_at: 2026-05-11 21:46 Europe/Stockholm
  - source: Andreas noted the Host Maintenance Preview/action area does not belong inside the Participant Preview card.
  - Proof: preview card is participant-facing only; host maintenance text and preview-only note are removed from it; create/copy actions live outside the preview card.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-4rc9nepre-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; anonymous smoke confirmed `/groupquests/create` still redirects to sign-in with return URL; source checks confirmed Host Maintenance Preview and Preview-only note are removed from preview while create/copy actions exist outside it; Vercel error logs had no recent logs.

- [x] Mock save flow to unique Multiplayer Side Quest URL with creator controls.
  - added_at: 2026-05-11 21:48 Europe/Stockholm
  - completed_at: 2026-05-11 21:54 Europe/Stockholm
  - source: Andreas asked how saving works and proposed that Save takes the creator to the unique URL where logged-in creators see extra controls compared with everyone else.
  - Proof: create page button reads `Save Multiplayer Side Quest` and redirects to `/groupquests/{numericId}`; a dynamic numeric-ID detail page exists; logged-in visitors see creator controls, logged-out visitors see public participant view and sign-in-to-manage prompt.
  - follow_up: replace mock client redirect/public ID with persisted server-side create action and real ownership checks.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-fvhpzrndi-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; anonymous smoke confirmed `/groupquests/create` still redirects to sign-in with return URL and `/groupquests/12345` returns 200 with numeric ID, share URL, public participant view, sign-in-to-manage prompt, and quest stack; source checks confirmed `Save Multiplayer Side Quest` button and redirect to `/groupquests/${publicId}`; Vercel error logs had no recent logs.

- [ ] Replace mock Multiplayer Quest save with persisted create action and ownership checks.
  - added_at: 2026-05-11 21:54 Europe/Stockholm
  - source: Follow-up from save-flow mock: real save must persist the Multiplayer Side Quest and only show creator controls to the actual owner.
  - acceptance: Save creates a database record with selected quests, schedule, visibility, rules, owner user ID, and stable numeric public ID; `/groupquests/{id}` resolves persisted data; host controls render only for the creator/owner.
  - blocked_until: persistence/schema implementation.

- [x] Clean up Multiplayer Quest create save action and unsaved-exit warning.
  - added_at: 2026-05-11 21:52 Europe/Stockholm
  - completed_at: 2026-05-11 22:00 Europe/Stockholm
  - source: Andreas asked to remove `Copy invite text` from create, keep it for the unique page, center `Save Multiplayer Side Quest`, and warn if users exit create before saving.
  - Proof: create page action row contains only centered `Save Multiplayer Side Quest`; copy-invite button moved to the unique page as `Copy invite text`; browser beforeunload warning appears if the user leaves/reloads before saving; save disables the warning before redirecting to the numeric URL.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-69at3af3i-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests/create` still redirects to sign-in, `/groupquests/12345` returns public participant view with `Copy invite text`, sign-in-to-manage prompt, and share URL; source checks confirmed create page has `beforeunload`, save disables warning before redirect, and no create-page copy-invite text remains; Vercel error logs had no recent logs.

- [x] Rename create preview label to Multiplayer Side Quest Preview.
  - added_at: 2026-05-11 21:56 Europe/Stockholm
  - completed_at: 2026-05-11 21:57 Europe/Stockholm
  - source: Andreas screenshot-requested changing `Participant preview` to `Multiplayer Side Quest Preview`.
  - Proof: `src/components/group-quest-draft-builder.tsx` preview eyebrow now uses `Multiplayer Side Quest Preview`.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-a7vct3xko-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; anonymous create smoke still redirects to sign-in with return URL; source checks confirmed new label exists and old `Participant preview` label is removed; Vercel error logs had no recent logs.

- [x] Extend create-page unsaved warning to internal navigation links.
  - added_at: 2026-05-11 21:58 Europe/Stockholm
  - completed_at: 2026-05-11 21:59 Europe/Stockholm
  - source: Andreas reported `beforeunload` only warned on reload, not when clicking site links like Home.
  - Proof: `/groupquests/create` now combines browser `beforeunload` with a captured same-origin anchor click guard that confirms before internal navigation when unsaved. Save marks the draft saved before redirect.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-e19xs9bos-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; anonymous create smoke still redirects to sign-in with return URL; source checks confirmed `beforeunload`, internal anchor click guard, confirmation copy, and save-then-redirect escape path; Vercel error logs had no recent logs.

- [x] Rework individual Multiplayer Side Quest page for participant competition focus.
  - added_at: 2026-05-11 22:08 Europe/Stockholm
  - completed_at: 2026-05-11 22:15 Europe/Stockholm
  - source: Andreas said `/groupquests/80303` should focus on participant experience: competition/leaderboard, automatic proof checks, and graphical quest/seal treatment.
  - Proof: dynamic `/groupquests/{id}` page is leaderboard-first, shows “how am I doing vs others,” automatic proof-check states, selected quest coat-of-arms graphics, SQC seal/trophy summary, share action, and participant-oriented rules/activity. Creator/admin controls are not the main participant page surface.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-h4ju09ziu-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke `https://sidequestchess.com/groupquests/80303` returned 200 and contained competition leaderboard, automatic proof checks, quest coats of arms, SQC seal, submit proof CTA, mock player rows, and badge image references; Vercel error logs had no recent logs.

- [x] Reframe individual Multiplayer Side Quest invite page around first-time invitee orientation before leaderboard density.
  - added_at: 2026-05-12 08:44 Europe/Stockholm
  - completed_at: 2026-05-12 09:15 Europe/Stockholm
  - source: Andreas said the Competition Leaderboard/progress bars idea is good, but a first-time invitee will first ask: what is this, what am I supposed to do, what are the side quests, next step, who else is participating, what are the rules, what about time? Andreas then approved adding onboarding before the actual side quest, ending with `Accept this Side Quest`.
  - Proof: `/groupquests/{id}` now defaults to an invite/onboarding view with plain-language premise, how-it-works steps, visible quest cards, participant leaderboard preview, rules/time summary, and repeated `Accept this Side Quest` CTA; accepting routes to `/groupquests/{id}?accepted=1`, which preserves the existing proof/leaderboard competition page.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; local smoke confirmed `/groupquests/80303` shows onboarding and `/groupquests/80303?accepted=1` shows the actual competition page; production deploy `https://cc-6l96415ut-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed both production routes return 200 with expected onboarding/dashboard text; Vercel production 500 log scan for the last 10m returned no entries.

- [x] Replace Multiplayer Side Quest invite summary red circle with silver SQC seal.
  - added_at: 2026-05-12 10:04 Europe/Stockholm
  - completed_at: 2026-05-12 10:04 Europe/Stockholm
  - source: Andreas approved the onboarding and asked to use the red SQC seal form, but silver instead of red, in place of the simple red circle.
  - Proof: the Multiplayer Side Quest invite/detail summary now renders the existing ornate SQC wax-seal asset as an image with a silver grayscale/brightness treatment instead of the flat red `SQC` circle.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-kthwyn40w-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests/80303` returns 200, references `quest-complete-premium-red-wax-sqc-v15.png`, uses `groupquest-seal`, and the stamp asset returns `200 image/png`; Vercel production 500 log scan for the last 10m returned no entries.

- [x] Fix Multiplayer Side Quest seal transparency and replace relative time with dates.
  - added_at: 2026-05-12 10:14 Europe/Stockholm
  - completed_at: 2026-05-12 10:14 Europe/Stockholm
  - source: Andreas said nothing inside the seal should be transparent, liked the black/dark grey feel, and asked to replace `38h left` with actual start/stop dates.
  - Proof: the silver SQC seal now sits inside a dark filled circular seal backing so transparent cutouts render as solid dark grey/black instead of showing the card through; the invite summary and rules now show `May 12, 10:00 CEST` start and `May 14, 00:00 CEST` end instead of `38h left`.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-9zw2k192z-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests/80303` and `/groupquests/80303?accepted=1` return 200, include `groupquest-seal-frame`, include `May 12, 10:00 CEST` and `May 14, 00:00 CEST`, and no longer include `38h left`; Vercel production 500 log scan for the last 10m returned no entries.

- [x] Rework Multiplayer Side Quest seal as original transparent file recolored black.
  - added_at: 2026-05-12 10:24 Europe/Stockholm
  - completed_at: 2026-05-12 10:24 Europe/Stockholm
  - source: Andreas said the prior dark backing was almost right but asked to use the original file with transparent background and just change the color to black.
  - Proof: removed the filled `groupquest-seal-frame`; the invite/detail summary now renders the original transparent SQC seal PNG directly with a black/dark grayscale filter, preserving transparent background behavior.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-arrua3fap-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests/80303` and `/groupquests/80303?accepted=1` return 200, include `Black Side Quest Chess seal`, no longer include `groupquest-seal-frame`, and keep the start/end dates; Vercel production 500 log scan for the last 10m returned no entries.

- [x] Use Andreas's newly supplied black SQC seal on Multiplayer Side Quest invite/detail.
  - added_at: 2026-05-12 10:58 Europe/Stockholm
  - completed_at: 2026-05-12 10:58 Europe/Stockholm
  - source: Andreas supplied a new black Side Quest Chess seal and asked to use that seal instead.
  - Proof: saved the supplied seal as `public/stamps/sqc-side-quest-chess-black-seal.jpg`, wired the Multiplayer Side Quest invite/detail seal image to that asset, and removed the old wax-stamp source from this surface.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-q1izn8t6j-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests/80303` and `/groupquests/80303?accepted=1` return 200, reference `sqc-side-quest-chess-black-seal.jpg`, keep start/end dates, and the seal asset returns `200 image/jpeg`; Vercel production 500 log scan for the last 10m returned no entries.

- [x] Switch Multiplayer Side Quest page to workspace black transparent seal PNG.
  - added_at: 2026-05-12 11:42 Europe/Stockholm
  - completed_at: 2026-05-12 11:42 Europe/Stockholm
  - source: Andreas added four local seal assets to `public/stamps` and asked to use the black one on the Multiplayer Side Quest page.
  - Proof: `/groupquests/{id}` invite/detail now references `public/stamps/SQCBLACK SEAL.png`, a real RGBA PNG asset, and no longer uses the earlier JPEG/blend workaround for this surface.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-ghbolivp1-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests/80303` and `/groupquests/80303?accepted=1` return 200, reference `SQCBLACK%20SEAL.png`, no longer reference the old JPEG seal, keep start/end dates, and the seal asset returns `200 image/png`; Vercel production 500 log scan for the last 10m returned no entries.

- [ ] Use gold/silver/bronze seals as top-three Multiplayer Side Quest finish prizes.
  - added_at: 2026-05-12 11:44 Europe/Stockholm
  - source: Andreas said the other three local seal assets should be used as prizes for the top three when a Multiplayer Side Quest finishes.
  - acceptance: ended Multiplayer Side Quest views/final results should award and display `side_quest_chess_seal_gold_transparent.png` for 1st place, `side_quest_chess_seal_silver_transparent.png` for 2nd place, and `side_quest_chess_seal_bronze_transparent.png` for 3rd place; wording should call them prizes/rewards for final placement, not active-progress badges.

- [x] Clean Multiplayer Side Quest invite seal summary layout.
  - added_at: 2026-05-12 11:50 Europe/Stockholm
  - completed_at: 2026-05-12 11:50 Europe/Stockholm
  - source: Andreas showed the seal/date summary and asked to remove the box around the section, make Start/End the same font size, and make participant count clearer.
  - Proof: the seal summary no longer has an enclosing border/background box; start/end render as matching labeled date rows; participant copy is separated as `4 players participating`.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-matvpxj4b-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests/80303` returns 200 with `groupquest-date-stack`, `4 players participating`, start/end dates, and `SQCBLACK%20SEAL.png`; `/groupquests/80303?accepted=1` returns 200; Vercel production 500 log scan for the last 10m returned no entries.

- [x] Reduce Multiplayer Side Quest invite seal/date summary clutter.
  - added_at: 2026-05-12 13:02 Europe/Stockholm
  - completed_at: 2026-05-12 13:02 Europe/Stockholm
  - source: Andreas showed the cleaned seal/date summary and said it still looked cluttered.
  - Proof: reduced seal size, tightened the summary min-height/gaps, made Start/End compact two-column metadata, softened labels, and reduced participant count emphasis so the summary reads as one quiet supporting block instead of three competing elements.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-811rf4q5b-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests/80303` returns 200 with black seal, compact date stack, participant count, and start/end dates; `/groupquests/80303?accepted=1` returns 200; Vercel production 500 log scan for the last 10m returned no entries.

- [x] Add Multiplayer Side Quest participant join profile step.
  - added_at: 2026-05-12 13:03 Europe/Stockholm
  - completed_at: 2026-05-12 15:08 Europe/Stockholm
  - source: Andreas noted that before/when accepting a Multiplayer Side Quest we need to collect the participant's chess username, leaderboard display name if different, and optional profile/contact fields such as email for updates and location.
  - acceptance: the invite/onboarding acceptance flow should include a lightweight participant setup step that collects required public chess username(s) for proof, required leaderboard display name, optional email updates with explicit consent, and optional location/timezone/profile fields; copy must reassure that Side Quest Chess never asks for Lichess/Chess.com passwords and uses public games/usernames only.
  - flow decision: clicking `Accept this Side Quest` opens an in-page modal/sheet (not navigate immediately). Modal actions: `Continue` saves/validates the participant setup and then routes to `/groupquests/{id}?accepted=1`; `Cancel` closes the modal and leaves the invite page unchanged.
  - Proof: added `GroupQuestAcceptModal`; Accept CTA and highlighted step 1 now open the modal; modal collects provider, public username, leaderboard name, optional email updates/email, and optional location/country; Continue validates required fields, stores a local participant mock record, and enters accepted route.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-6j99s2o95-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests/80303` and `/groupquests/80303?accepted=1` return 200; source smoke confirmed modal fields (`Public username`, `Leaderboard name`, email updates, location), `Cancel`, `Continue`, and accepted-route redirect wiring; Vercel production 500 log scan for the last 10m returned no entries.

- [x] Convert Multiplayer Side Quest invite summary metadata to a plain list.
  - added_at: 2026-05-12 13:06 Europe/Stockholm
  - completed_at: 2026-05-12 13:06 Europe/Stockholm
  - source: Andreas suggested using a list instead of the box-like Start/End metadata treatment.
  - Proof: the invite seal summary now uses a simple `Starts / Ends / Players` list under the seal with thin dividers instead of separate date boxes/columns.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-arrlarrja-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests/80303` returns 200 with `groupquest-summary-list`, no old `groupquest-date-stack`, and black seal PNG; `/groupquests/80303?accepted=1` returns 200; Vercel production 500 log scan for the last 10m returned no entries.

- [x] Convert Multiplayer Side Quest rules/time cards to a plain list.
  - added_at: 2026-05-12 13:40 Europe/Stockholm
  - completed_at: 2026-05-12 13:40 Europe/Stockholm
  - source: Andreas showed the `Rules and time` section and asked to do the same list cleanup there.
  - Proof: onboarding `Rules and time` now renders `Starts / Ends / Games allowed / Variant / Proof` as a plain aligned list using `groupquest-rules-list` instead of boxed status cards.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-9edp5hbez-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests/80303` returns 200 with `groupquest-rules-list`, no old boxed `groupquests-status-strip groupquest-onboarding-rules`, rules text, and black seal PNG; `/groupquests/80303?accepted=1` returns 200; Vercel production 500 log scan for the last 10m returned no entries.

- [x] Make Multiplayer Side Quest onboarding quest rows clickable.
  - added_at: 2026-05-12 13:43 Europe/Stockholm
  - completed_at: 2026-05-12 13:43 Europe/Stockholm
  - source: Andreas showed the `What are the side quests?` quest boxes and asked to make them clickable so users can check full quest info.
  - Proof: each onboarding quest row now links to its full `/challenges/{quest.id}` page, includes `View full quest` copy, and has hover/focus styling on the full row.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-2yc38j048-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests/80303` returns 200 and includes links to `/challenges/knights-before-coffee`, `/challenges/no-castle-club`, and `/challenges/rookless-rampage`, all three destination pages return 200, accepted route returns 200, and Vercel production 500 log scan for the last 10m returned no entries.

- [x] Highlight and link Multiplayer Side Quest onboarding step 1.
  - added_at: 2026-05-12 13:45 Europe/Stockholm
  - completed_at: 2026-05-12 13:45 Europe/Stockholm
  - source: Andreas showed the onboarding steps and asked to highlight step 1 and make it clickable with the same result as `Accept this Side Quest`.
  - Proof: step 1 now renders as a highlighted full-row link to `/groupquests/{id}?accepted=1`, matching the primary Accept CTA target; other steps remain passive rows.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-9533pxdl7-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests/80303` returns 200 with `primary-step` and link target `/groupquests/80303?accepted=1`, accepted route returns 200, and Vercel production 500 log scan for the last 10m returned no entries.

- [x] Add editable default invite message to Multiplayer Side Quest creation.
  - added_at: 2026-05-12 13:50 Europe/Stockholm
  - completed_at: 2026-05-12 13:50 Europe/Stockholm
  - source: Andreas showed the invite hero copy and said the creator should get this text as default, but be able to change/edit it on the Multiplayer Side Quest creation page.
  - Proof: `/groupquests/create` now includes step `2 · Invite message` with the current invite copy as default editable textarea text; the preview uses the edited message; saving stores the draft invite copy in localStorage for the generated invite route, while the public invite page keeps the same default fallback text.
  - Verification: `pnpm lint` passed with 3 known warnings after fixing a React hooks lint issue; `pnpm build` passed; production deploy `https://cc-6zjzs5ekk-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; source smoke confirmed the create builder contains `2 · Invite message`, default copy, localStorage draft save, and invite route localStorage reader; anonymous `/groupquests/create` still redirects to sign-in as expected; `/groupquests/80303` returns 200 with the default invite copy; Vercel production 500 log scan for the last 10m returned no entries.

- [x] Add allowed-provider setting to Multiplayer Side Quest creation.
  - added_at: 2026-05-12 13:56 Europe/Stockholm
  - completed_at: 2026-05-12 13:56 Europe/Stockholm
  - source: Andreas showed `Games allowed — Lichess or Chess.com` and said it should be a creation setting, default both, with creator able to limit to one provider.
  - Proof: `/groupquests/create` now has step `6 · Games allowed` with choices `Lichess or Chess.com`, `Lichess only`, and `Chess.com only`; default remains both. The preview includes `Games allowed`, saving stores `providerMode` and `providerLabel`, and invite/accepted route rules can read the stored provider label while falling back to both providers.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-qoyqlge5v-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; source smoke confirmed builder provider choices/save fields and invite route reader wiring; anonymous `/groupquests/create` still redirects to sign-in; `/groupquests/80303` and `/groupquests/80303?accepted=1` return 200 with `Games allowed` and default `Lichess or Chess.com`; Vercel production 500 log scan for the last 10m returned no entries.

- [x] Clarify Multiplayer Side Quest winner criteria.
  - added_at: 2026-05-12 14:00 Europe/Stockholm
  - completed_at: 2026-05-12 14:00 Europe/Stockholm
  - source: Andreas asked whether the winner should be first to complete all quests, with highest score winning at deadline if nobody completes all quests.
  - decision: yes; canonical success criteria is `First to complete all quests wins. If nobody finishes, highest points at the deadline wins.`
  - Proof: invite/onboarding rules list now includes `Winner`; rules explainer states the same condition in plain language; accepted competition hero and locked rules include the winner rule; creation preview includes a winner-rule preview so creators see the success criteria before sharing.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-oyhvf2pzv-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests/80303` and `/groupquests/80303?accepted=1` return 200 and include `Winner`, `First to complete all quests wins`, and `highest points at the deadline wins`; anonymous create still redirects to sign-in; Vercel production 500 log scan for the last 10m returned no entries.

- [x] Remove internal `SQC` wording from Multiplayer Side Quest onboarding copy.
  - added_at: 2026-05-12 14:03 Europe/Stockholm
  - completed_at: 2026-05-12 14:03 Europe/Stockholm
  - source: Andreas disliked `let SQC judge the receipt`, noted the product does not use `SQC`, and suggested language like `climb the leaderboard`.
  - Proof: onboarding heading now says `Accept the quest, play normally, climb the leaderboard.`; step 3 now says `Proof gets checked`; accepted proof heading now says `Submit once. The verifier checks the boring parts.`
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-hy5nli6gz-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests/80303` returns 200 with `climb the leaderboard` and `Proof gets checked`, no old `let SQC judge the receipt` or `SQC checks the proof`; accepted route returns 200 with `The verifier checks the boring parts`; Vercel production 500 log scan for the last 10m returned no entries.

- [x] Add expandable Multiplayer Side Quest player finish times.
  - added_at: 2026-05-12 14:07 Europe/Stockholm
  - completed_at: 2026-05-12 14:07 Europe/Stockholm
  - source: Andreas showed leaderboard/player boxes and asked that clicking one reveals date/time of each quest finished.
  - Proof: leaderboard rows now use accessible expandable player rows; clicking a player reveals each selected quest with its finish timestamp or `Not finished yet`; works on invite preview and accepted competition leaderboard.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-k8x3wl9v5-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests/80303` and `/groupquests/80303?accepted=1` return 200 with `groupquest-finished-detail`, sample finish timestamp `May 12, 10:37 CEST`, and `Not finished yet`; Vercel production 500 log scan for the last 10m returned no entries.

- [x] Add participant setup summary to accepted Multiplayer Side Quest page.
  - added_at: 2026-05-12 15:13 Europe/Stockholm
  - completed_at: 2026-05-12 15:13 Europe/Stockholm
  - source: Andreas liked the onboarding process and asked to continue with the accepted participant page, explicitly noting it should differ from the creator/admin page.
  - Proof: accepted participant page now includes a `You’re in` participant summary card before standings; it reads the locally saved join setup and shows provider, username, leaderboard name, email updates, and location fallback; hero also links directly to the leaderboard.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-pvdh765fu-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed accepted route `/groupquests/80303?accepted=1` returns 200 with `groupquest-participant-summary`, `You’re in`, `Provider`, `Leaderboard`, `Email updates`, and hero `#leaderboard` link; invite route stays onboarding-only; Vercel production 500 log scan for the last 10m returned no entries.

- [x] Remove duplicate Accept button from onboarding step 1 card.
  - added_at: 2026-05-12 15:16 Europe/Stockholm
  - completed_at: 2026-05-12 15:16 Europe/Stockholm
  - source: Andreas showed the highlighted step 1 card and asked to remove the embedded `Accept this Side Quest` button from there.
  - Proof: step 1 remains highlighted as onboarding guidance, but no longer renders its own nested Accept button; the main hero/bottom Accept CTAs remain the modal triggers.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-4qnegdrph-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests/80303` returns 200, primary step exists, no `button primary` inside the primary-step chunk, accepted route returns 200, and Vercel production 500 log scan for the last 10m returned no entries.

- [x] Compact accepted participant hero and `You’re in` section.
  - added_at: 2026-05-12 15:31 Europe/Stockholm
  - completed_at: 2026-05-12 15:31 Europe/Stockholm
  - source: Andreas showed the accepted participant page and asked to remove the buttons, integrate all parts of the `You’re in` section, and keep it very compact.
  - Proof: accepted hero action buttons were removed; unused share wiring removed; `You’re in` is now a compact status strip with leaderboard name, next action copy, provider, username, leaderboard name, email, and location in one tight row/grid.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-1gji50sgx-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed accepted route `/groupquests/80303?accepted=1` returns 200 with compact participant summary and next-action copy, no `Submit proof` or `Share` hero/button text, and invite route remains onboarding-only; Vercel production 500 log scan for the last 10m returned no entries.

- [x] Move accepted participant quest checklist near the top.
  - added_at: 2026-05-12 15:40 Europe/Stockholm
  - completed_at: 2026-05-12 15:40 Europe/Stockholm
  - source: Andreas showed the quest stack lower on the accepted participant page and asked to see the quests to complete somewhere at the top so it is clear what to complete.
  - Proof: accepted participant page now shows a compact `Quests to complete` checklist immediately after the `You’re in` strip and before standings; each quest row links to its full challenge page with badge, title, points, and proof callout; lower quest-card area was converted to a progress tip to avoid duplicating the checklist.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-as76l18jb-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed accepted route `/groupquests/80303?accepted=1` returns 200 with `groupquest-top-quest-stack`, `Quests to complete`, quest rows and challenge links, no old `The stack to beat`; invite route remains onboarding-only; Vercel production 500 log scan for the last 10m returned no entries.

- [x] Replace misplaced leaderboard live-check pill with refresh action.
  - added_at: 2026-05-12 15:45 Europe/Stockholm
  - completed_at: 2026-05-12 15:45 Europe/Stockholm
  - source: Andreas noted the `Live checks on` pill felt misplaced and requested a refresh button to force an update on the check.
  - Proof: accepted participant leaderboard header now removes the `Live checks on` badge and shows a compact `Refresh checks` button aligned with the header instead.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-gj114vfqp-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed accepted route `/groupquests/80303?accepted=1` returns 200 with `Refresh checks` and `groupquest-refresh-button`, no `Live checks on`; invite route remains unchanged; Vercel production 500 log scan for the last 10m returned no entries.

- [x] Clean accepted quest checklist numbering and label.
  - added_at: 2026-05-12 16:27 Europe/Stockholm
  - completed_at: 2026-05-12 16:27 Europe/Stockholm
  - source: Andreas asked to remove the quest row numbers and change pills from `quests` to `Side Quests`.
  - Proof: accepted participant quest checklist rows now show quest titles without numeric prefixes; gold count pill and other compact count labels now use `Side Quests` instead of lower-case `quests`.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed.

- [x] Highlight accepted-page Multiplayer Side Quest ID and add date pill.
  - added_at: 2026-05-12 16:31 Europe/Stockholm
  - completed_at: 2026-05-12 16:31 Europe/Stockholm
  - source: Andreas asked to highlight the quest ID number in the `Multiplayer Side Quest #80303` pill and add a second pill to the right with start/stop dates only.
  - Proof: accepted participant hero now renders two compact pills: `Multiplayer Side Quest #80303` with the ID highlighted green, and `May 12 → May 14` as the date-only pill.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed.

## Approved hidden implementation — Multiplayer / group quests — 2026-05-09

- [x] Gate Multiplayer Quest creation/management behind login.
  - added_at: 2026-05-11 14:51 Europe/Stockholm
  - completed_at: 2026-05-11 14:55 Europe/Stockholm
  - source: Andreas chose the starting access policy: browse and open invite links without logging in; create and manage only when logged in.
  - Proof: `/groupquests/create` redirects anonymous visitors to `/sign-in`; invite/detail page stays public but replaces host maintenance controls with a sign-in-to-manage card for anonymous visitors.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-9tip83vw2-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests` stays public, `/groupquests/gq_demo_no_castle_01` stays public with sign-in-to-manage card and rules visible, and `/groupquests/create` redirects anonymous visitors to `/sign-in`.

- [x] Add proof-scroll details to Multiplayer Side Quests artwork.
  - added_at: 2026-05-11 11:13 Europe/Stockholm
  - completed_at: 2026-05-11 11:15 Europe/Stockholm
  - source: Andreas asked to put the SQC red seal on the proof scroll held by the knight, plus text indication and one coat of arms at the top of the scroll.
  - Proof: generated a new transparent RGBA illustration with a red SQC-style wax seal, `QUEST PROOF` text indication, and coat-of-arms style mark on the scroll; replaced `public/illustrations/group-side-quests-knight-competition.png`.
  - Verification: local visual inspection confirmed the scroll details are present; `file public/illustrations/group-side-quests-knight-competition.png` reports `PNG image data, 1536 x 1024, 8-bit/color RGBA`; `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-4hj4ughyj-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests` references the artwork and `/illustrations/group-side-quests-knight-competition.png` returns `200 image/png`.

- [x] Replace Multiplayer Side Quests overview art with new simpler funny transparent artwork.
  - added_at: 2026-05-11 10:51 Europe/Stockholm
  - completed_at: 2026-05-11 10:52 Europe/Stockholm
  - source: Andreas approved using the newly generated less-busy/funnier transparent Multiplayer Side Quests artwork on the site.
  - Proof: replaced `public/illustrations/group-side-quests-knight-competition.png` with the new transparent RGBA PNG.
  - Verification: `file public/illustrations/group-side-quests-knight-competition.png` reports `PNG image data, 1536 x 1024, 8-bit/color RGBA`; `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-21pg600sf-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests` references the artwork and `/illustrations/group-side-quests-knight-competition.png` returns `200 image/png`.

- [x] Replace Multiplayer Side Quests overview art with transparent PNG.
  - added_at: 2026-05-11 10:39 Europe/Stockholm
  - completed_at: 2026-05-11 10:40 Europe/Stockholm
  - source: Andreas asked to use the transparent PNG version of the knight/chess artwork in the Multiplayer Side Quests section.
  - Proof: replaced `public/illustrations/group-side-quests-knight-competition.png` with the transparent RGBA PNG generated from Andreas's image.
  - Verification: `file public/illustrations/group-side-quests-knight-competition.png` reports `PNG image data, 1018 x 662, 8-bit/color RGBA`; `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-f3iqluchk-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests` references the artwork and `/illustrations/group-side-quests-knight-competition.png` returns `200 image/png`.

- [x] Update footer copyright text.
  - added_at: 2026-05-11 09:59 Europe/Stockholm
  - completed_at: 2026-05-11 10:01 Europe/Stockholm
  - source: Andreas asked to change footer text from `sidequestchess.com anno 2026` to `copyright anno 2026 sidequestchess.com`.
  - Proof: global footer in `src/app/layout.tsx` displays the requested exact text.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-4uxmii8yg-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/` returns 200 with `copyright anno 2026 sidequestchess.com` and without the old footer text.

- [x] Align Side Quests hub card CTA placement/color.
  - added_at: 2026-05-11 09:55 Europe/Stockholm
  - completed_at: 2026-05-11 09:58 Europe/Stockholm
  - source: Andreas showed the two `/challenges` hub cards and asked for the buttons to be placed in the same position and have the same yellow color.
  - Proof: both solo and multiplayer card CTAs are yellow primary buttons and CSS aligns them consistently at the card bottom/right on desktop, bottom/start on mobile.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-heoawhmla-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/challenges` returns 200, both CTAs are present, and the multiplayer CTA no longer uses `button secondary`.

- [x] Replace user-facing “room(s)” metaphor with Multiplayer Quest(s).
  - added_at: 2026-05-11 09:55 Europe/Stockholm
  - completed_at: 2026-05-11 09:57 Europe/Stockholm
  - source: Andreas questioned whether “room/rooms” adds unnecessary metaphor and suggested simply using “Multiplayer Quest/Multiplayer Quests”.
  - Proof: visible copy on `/challenges`, `/account`, and `/groupquests` now uses Multiplayer Quest(s) instead of room(s) where referring to the product object; internal variable/class names remain.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-hknos0dy5-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/challenges` and `/groupquests` return 200 with Multiplayer Quest copy and no visible `room`/`rooms` terms in extracted HTML text.

- [x] Sweep leftover public “group” terminology after Multiplayer rename.
  - added_at: 2026-05-11 09:50 Europe/Stockholm
  - completed_at: 2026-05-11 09:53 Europe/Stockholm
  - source: Andreas showed a screenshot with remaining “group” copy after approving Multiplayer Side Quests and asked Sam to look through where “group” should become “multiplayer”.
  - Proof: updated stale visible product-mode copy including `Open group quest(s)`, `Group rooms`, `All group rooms`, `group leaderboards`, `group proof`, `group ledger`, and `group celebration`; route/class/internal `groupquests` identifiers remain unchanged.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; production deploy `https://cc-dul3ubqcx-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/challenges`, `/groupquests`, `/groupquests/create`, and `/groupquests/gq_demo_no_castle_01` return 200, include Multiplayer text, and have no visible `group`/`groups` word in extracted HTML text for these pages.

- [x] Rename public Group Side Quests language to Multiplayer Side Quests.
  - added_at: 2026-05-11 09:43 Europe/Stockholm
  - completed_at: 2026-05-11 09:47 Europe/Stockholm
  - source: Andreas accepted Sam’s recommendation to use **Multiplayer Side Quests** publicly instead of **Group Side Quests**.
  - Proof: public-facing app copy in `/challenges`, `/account`, `/groupquests`, `/groupquests/create`, `/groupquests/gq_demo_no_castle_01`, and the draft builder now uses Multiplayer Side Quests / Multiplayer Side Quest terminology while keeping `/groupquests` route unchanged.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed and built `/challenges`, `/account`, `/groupquests`, `/groupquests/create`, and `/groupquests/gq_demo_no_castle_01`; production deploy `https://cc-22x7usj89-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/challenges`, `/groupquests`, `/groupquests/create`, and `/groupquests/gq_demo_no_castle_01` return 200 with Multiplayer Side Quest(s) terminology and no old Group Side Quest(s) text in HTML.

- [x] Aggressively reduce wasted space in Side Quests top hero.
  - added_at: 2026-05-11 09:40 Europe/Stockholm
  - completed_at: 2026-05-11 09:42 Europe/Stockholm
  - source: Andreas showed the compacted `/challenges` top section still wastes way too much space.
  - Proof: top hero keeps text but is now a much shorter banner with tighter padding, smaller heading, reduced page gap, and flatter background.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed and built `/challenges`; production deploy `https://cc-o8ggkzqj0-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/challenges` returns 200 with compact hero class and preserved text.

- [x] Compact Side Quests top hero section.
  - added_at: 2026-05-11 09:38 Europe/Stockholm
  - completed_at: 2026-05-11 09:40 Europe/Stockholm
  - source: Andreas clarified the compactness request was about the top section, not the solo/group mode cards; keep the card changes.
  - Proof: `/challenges` top hero keeps the existing heading/copy but uses tighter padding, smaller copy rhythm, and a desktop two-column alignment to reduce vertical space.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed and built `/challenges`; production deploy `https://cc-c92g6tepx-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/challenges` returns 200, includes the compact hero class, keeps hero text, and keeps the updated multiplayer card heading.

- [x] Update Group Side Quests hub heading copy.
  - added_at: 2026-05-11 09:35 Europe/Stockholm
  - completed_at: 2026-05-11 09:38 Europe/Stockholm
  - source: Andreas asked to change “Same nonsense, now with witnesses.” to “Multiplayer. Same nonsense, now with witnesses.” on the Side Quests hub.
  - Proof: `/challenges` Group Side Quests card now uses the requested heading text.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed and built `/challenges`; production deploy `https://cc-64xc0gdmo-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/challenges` returns 200 and includes the new heading.

- [x] Compact Side Quests hub mode cards without removing text.
  - added_at: 2026-05-11 09:34 Europe/Stockholm
  - completed_at: 2026-05-11 09:36 Europe/Stockholm
  - source: Andreas said the new solo/group hub is much better but takes too much space, and asked to keep all texts while making it more compact.
  - Proof: `/challenges` mode cards keep all existing copy but use tighter card padding, smaller eyebrow/button treatments, more compact heading/body line-height, and desktop button placement beside the copy to reduce vertical height.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed and built `/challenges`; production deploy `https://cc-jvwjf9p8o-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/challenges` returns 200 and retains all solo/group mode text.

- [x] Unify Side Quests / Group Side Quests / My Side Quests IA.
  - added_at: 2026-05-11 09:26 Europe/Stockholm
  - completed_at: 2026-05-11 09:32 Europe/Stockholm
  - source: Andreas said the current split between “Side Quests”, “Group Side Quests”, and “My Side Quests” is confusing, proposed keeping “My Side Quests” as the place that also shows active Group Quests, and making “Side Quests” the hub for both individual and Group Side Quests.
  - Proof: top nav now removes the separate `Group Side Quests` item; `/challenges` frames Side Quests as a hub for solo and group modes; `/account` now includes active Group Quests alongside the current solo quest.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed and built `/challenges`, `/account`, and `/groupquests`; production deploy `https://cc-fijy8pbe4-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/challenges` returns 200 with hub copy and no separate Group Side Quests top-nav item, `/groupquests` returns 200, and `/account` redirects anonymous users to sign-in.

Andreas approved starting implementation live at `/groupquests` while keeping it unlinked from user-facing navigation. This is an explicit exception to the website feature freeze for the hidden group quests workbench only.

- [x] Deep-dive Group Side Quests access and invite model.
  - added_at: 2026-05-10 21:12 Europe/Stockholm
  - completed_at: 2026-05-10 21:18 Europe/Stockholm
  - source: Andreas asked how Group Side Quests should be accessed, especially how to invite people without an SQC account and whether they enter chess IDs themselves.
  - Proof: added `docs/SQC_GROUP_SIDE_QUESTS_ACCESS_MODEL_2026-05-10.md` defining link-first access, guest joins, creator-added chess IDs, invite claim links, signed-in confirmation, proof identity rules, guest-to-account claiming, privacy, and MVP sequence.
  - Verification: planning doc written; no product code changed.

- [x] Reshape logged-in Group Side Quests overview into clearer dashboard.
  - added_at: 2026-05-10 22:05 Europe/Stockholm
  - completed_at: 2026-05-10 22:18 Europe/Stockholm
  - source: Andreas said he was still not happy with the logged-in Group Side Quests main page clarity and agreed to the dashboard/control-center direction.
  - Proof: `/groupquests` signed-in state now leads with My Group Side Quests, direct Create/Join actions, Needs your attention, and room sections for Live now, Starting soon, Drafts you manage, and Finished. Proof doc: `docs/SQC_GROUP_SIDE_QUESTS_LOGGED_IN_DASHBOARD_CLARITY_2026-05-10.md`.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed and built `/groupquests`, `/groupquests/create`, and `/groupquests/gq_demo_no_castle_01`; production deploy `https://cc-l3rm76xwr-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests`, `/groupquests/create`, and `/groupquests/gq_demo_no_castle_01` return 200; authenticated Chrome Apple Events check confirmed signed-in dashboard text.

- [x] Simplify Group Side Quests dashboard for many rooms.
  - added_at: 2026-05-10 22:24 Europe/Stockholm
  - completed_at: 2026-05-10 22:30 Europe/Stockholm
  - source: Andreas said the logged-in page was much better, but should be simplified further with many Finished/Live/etc. rooms in mind.
  - Proof: signed-in `/groupquests` now prioritizes `What needs me?`, keeps `Needs your attention`, collapses live/upcoming/drafts into one compact Active list, and moves Finished rooms into a compact recent-results side panel with `View all finished`. Proof doc: `docs/SQC_GROUP_SIDE_QUESTS_SCALABLE_DASHBOARD_SIMPLIFICATION_2026-05-10.md`.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed and built `/groupquests`, `/groupquests/create`, and `/groupquests/gq_demo_no_castle_01`; production deploy `https://cc-dlrf1aio0-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests`, `/groupquests/create`, and `/groupquests/gq_demo_no_castle_01` return 200; authenticated Chrome Apple Events check confirmed signed-in scalable dashboard text.

- [x] Trim remaining signed-in Group Side Quests explainer content.
  - added_at: 2026-05-10 23:12 Europe/Stockholm
  - completed_at: 2026-05-10 23:18 Europe/Stockholm
  - source: Andreas asked if anything else could be removed or moved from the page after the scalable dashboard pass.
  - Proof: signed-in `/groupquests` no longer shows the separate hero, large invite explainer, `Create. Play. Prove.`, or proof-ledger explainer; those explanatory sections now remain for signed-out users only, while signed-in users get a compact invite hint inside the dashboard. Proof doc: `docs/SQC_GROUP_SIDE_QUESTS_SIGNED_IN_PAGE_TRIM_2026-05-10.md`.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed and built `/groupquests`, `/groupquests/create`, and `/groupquests/gq_demo_no_castle_01`; production deploy `https://cc-d4x5f9w1p-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests`, `/groupquests/create`, and `/groupquests/gq_demo_no_castle_01` return 200; authenticated Chrome Apple Events check confirmed signed-in trim.

- [x] Restore `Create. Play. Prove.` at the bottom for signed-in users.
  - added_at: 2026-05-10 23:17 Europe/Stockholm
  - completed_at: 2026-05-10 23:22 Europe/Stockholm
  - source: Andreas asked to keep `Create. Play. Prove.` at the bottom after the signed-in trim.
  - Proof: signed-in `/groupquests` once again includes the lightweight `Create. Play. Prove.` flow at the bottom, while the larger hero/invite/proof-ledger explainers stay removed from the signed-in flow. Proof doc: `docs/SQC_GROUP_SIDE_QUESTS_RESTORE_BOTTOM_FLOW_2026-05-10.md`.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed and built `/groupquests`, `/groupquests/create`, and `/groupquests/gq_demo_no_castle_01`; production deploy `https://cc-m68h8pznl-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/groupquests`, `/groupquests/create`, and `/groupquests/gq_demo_no_castle_01` return 200; authenticated Chrome Apple Events check confirmed the bottom flow is restored.

- [x] Ship hidden `/groupquests` MVP shell.
  - added_at: 2026-05-09 12:02 Europe/Stockholm
  - completed_at: 2026-05-09 12:08 Europe/Stockholm
  - source: Andreas said to start implementing SQC multiplayer live, work on it, and put it in a folder such as `sidequestchess.com/groupquests` with no user links for now.
  - Proof: added `src/app/groupquests/page.tsx` as an unlinked live workbench with single quest race framing, group settings, quest set preview, leaderboard mock, live event feed, and separate personal-vs-group proof rule.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed and listed `/groupquests` as a built route. Production deploy/smoke pending.

- [x] Reshape `/groupquests` into a logged-in group hub.
  - added_at: 2026-05-09 18:55 Europe/Stockholm
  - completed_at: 2026-05-09 18:58 Europe/Stockholm
  - source: Andreas asked for high tempo on group quest work and described a logged-in hub with groups users belong to and groups they manage.
  - Proof: `/groupquests` now leads with a hub model: create draft group quest, managed rooms, member rooms, then focused room prototype with leaderboard/feed.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed and listed `/groupquests` as a built route. Production deploy/smoke pending.

- [x] Add client-side Group Quest draft builder.
  - added_at: 2026-05-09 20:39 Europe/Stockholm
  - completed_at: 2026-05-09 20:48 Europe/Stockholm
  - source: Andreas confirmed Sam should autonomously build the next slice: name group → choose quest → invite mode → preview draft room.
  - Proof: added `src/components/group-quest-draft-builder.tsx` and wired it into `/groupquests`; users can edit group name, choose an initial quest, choose invite mode/proof window/duration, and see a live draft room preview.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed and listed `/groupquests` as a built route. Production deploy/smoke pending.

- [x] Add local draft room creation and mandatory game-rule constraints.
  - added_at: 2026-05-09 20:54 Europe/Stockholm
  - completed_at: 2026-05-09 20:58 Europe/Stockholm
  - source: Andreas said to continue and consider users manipulating rules, including making provider settings mandatory from a Lichess screenshot to follow.
  - Proof: builder now supports local draft room creation, copy-invite placeholder, and mandatory game settings for speed, rated state, variant, and player color; exact Lichess screenshot options can be mapped next.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed and listed `/groupquests` as a built route. Production deploy/smoke pending.

- [x] Map visible Lichess time-control presets into mandatory rules.
  - added_at: 2026-05-09 21:04 Europe/Stockholm
  - completed_at: 2026-05-09 21:06 Europe/Stockholm
  - source: Andreas sent a Lichess create-game screenshot showing time-control presets: Bullet 0+1/1+0/1+1/2+1, Blitz 3+0/3+2/5+0/5+3, Rapid 10+0/10+5/15+0/15+10, Classical 25+0/30+0/30+20/60+0, plus Custom.
  - Proof: mandatory rule builder now has a `Time control` selector with those exact visible presets and defaults to `Blitz 5+3` from the screenshot.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed and listed `/groupquests` as a built route. Production deploy/smoke pending.

- [x] Split Group Quests into overview, create, and room pages.
  - added_at: 2026-05-09 23:06 Europe/Stockholm
  - completed_at: 2026-05-09 23:10 Europe/Stockholm
  - source: Andreas said Group Quests looks good but needs multiple pages behind it; top page should be overview.
  - Proof: `/groupquests` is now a clean overview hub, `/groupquests/create` holds the draft builder, and `/groupquests/gq_demo_no_castle_01` holds the focused room prototype.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed and listed `/groupquests`, `/groupquests/create`, and `/groupquests/gq_demo_no_castle_01`; production deploy `https://cc-indpqm6mo-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; smoke confirmed `/`, `/groupquests`, `/groupquests/create`, and `/groupquests/gq_demo_no_castle_01` return 200, and `/` still has no `/groupquests` public link.

- [x] Use stable unique group quest identifiers in room URLs.
  - added_at: 2026-05-09 23:30 Europe/Stockholm
  - completed_at: 2026-05-09 23:31 Europe/Stockholm
  - source: Andreas pointed out room names can duplicate, so group quest links need a unique identifier rather than the display name.
  - Proof: the No Castle Night prototype route moved from a name slug to `/groupquests/gq_demo_no_castle_01`, while the displayed room name remains `No Castle Night`.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed and listed `/groupquests/gq_demo_no_castle_01`.

- [x] Collaboratively refine the Group Quests overview page.
  - added_at: 2026-05-10 14:46 Europe/Stockholm
  - completed_at: 2026-05-10 14:59 Europe/Stockholm
  - source: Andreas said to work together on group challenges and start with the overview page.
  - naming: Andreas suggested **Group Side Quests** because it aligns with **My Side Quests**; use that as the user-facing overview-page term while keeping `/groupquests` as the internal route.
  - Proof: `/groupquests` now uses the Group Side Quests naming, explains the shared My Side Quests model, adds a `Create. Play. Prove.` explainer, separates `Create`, `Hosting`, and `Playing` sections, and keeps the hidden route unlinked from public nav.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; commit `50444cb` (`Refine Group Side Quests overview`) pushed to `main`; production deploy `https://cc-gr46lsqjp-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; live smoke confirmed `/groupquests`, `/groupquests/create`, and `/groupquests/gq_demo_no_castle_01` return 200, and `/groupquests` contains `Group Side Quests` plus `Create. Play. Prove.`.

- [x] Make Group Side Quests overview launch-ready.
  - added_at: 2026-05-10 15:16 Europe/Stockholm
  - completed_at: 2026-05-10 15:25 Europe/Stockholm
  - source: Andreas reviewed the overview screenshot and said to make it launch ready.
  - Proof: `/groupquests` now removes visible hidden/prototype/internal wording, presents a launch-style `Multiplayer side quests` hero, clarifies create/play/prove flow, replaces fake active-room dashboard sections with host/play/join product states, adds invite-link join framing, and keeps `/groupquests/create` plus stable room links.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed; commit `bf8d8c0` (`Make Group Side Quests overview launch ready`) pushed to `main`; production deploy `https://cc-ghpd346rc-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; live smoke confirmed `/groupquests` 200 and visible launch copy including `Multiplayer side quests`, `Join with invite link`, and `Pick one or more side quests`.

- [x] Lock Group Side Quests overview as logged-in launch-ready baseline.
  - added_at: 2026-05-10 16:39 Europe/Stockholm
  - completed_at: 2026-05-10 16:39 Europe/Stockholm
  - source: Andreas said, “Great! I think we can lock this group quest page as the launch ready for logged in.”
  - Proof: recorded `docs/SQC_GROUP_SIDE_QUESTS_LOGGED_IN_LAUNCH_READY_2026-05-10.md` with the locked decisions and latest baseline commit `bf7024c` (`Make only create step clickable`).
  - Verification: latest locked page was deployed to `https://cc-dyxldolh9-andreas-nordenadlers-projects.vercel.app` and aliased to `https://sidequestchess.com`; `pnpm lint`, `pnpm build`, production deploy guard, and live `/groupquests` smoke all passed before the lock.

- [x] Add Group Side Quests to top navigation.
  - added_at: 2026-05-10 16:41 Europe/Stockholm
  - completed_at: 2026-05-10 16:43 Europe/Stockholm
  - source: Andreas said, “Let us add Group Side Quests to the top bar.”
  - Proof: top nav now links to `/groupquests` with label `Group Side Quests`; `/groupquests` uses the active nav state for that item.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed and listed `/groupquests`; commit `6518a97` (`Add Group Side Quests to top nav`) pushed to `main`; production deploy `https://cc-4owfollpl-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; live smoke confirmed `/` and `/groupquests` return 200 and top nav includes `/groupquests` with label `Group Side Quests`, active on `/groupquests`.

- [x] Four-hour logged-in Group Side Quests UX/UI implementation block.
  - added_at: 2026-05-10 16:52 Europe/Stockholm
  - completed_at: 2026-05-10 17:18 Europe/Stockholm
  - source: Andreas asked Sam to spend the next 4 hours on logged-in Group Side Quest user experience and UI, covering participating, creating, and maintaining Group Side Quests.
  - scope: logged-in `/groupquests`, `/groupquests/create`, and Group Side Quest detail/maintenance flows; prioritize user-visible UX/UI improvements with deployable proof.
  - Proof: `/groupquests` now has a logged-in dashboard with summary stats, next-best-action proof CTA, clearer current/previous Group Side Quests, quick actions, and invite-link rule review; `/groupquests/create` now has a staged create checklist plus participant/host maintenance preview; `/groupquests/gq_demo_no_castle_01` now separates participant proof status from host maintenance controls with proof checklist, invite/proof/window controls, labeled activity feed, and clearer leaderboard proof states. Details recorded in `docs/SQC_GROUP_SIDE_QUESTS_LOGGED_IN_UX_BLOCK_2026-05-10.md`.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed and listed `/groupquests`, `/groupquests/create`, and `/groupquests/gq_demo_no_castle_01`; production deploy guard passed; production deploy `https://cc-96x3cukfs-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; live smoke confirmed `/groupquests`, `/groupquests/create`, and `/groupquests/gq_demo_no_castle_01` return 200 with expected launch copy.

## Future planning — Multiplayer / group competitions — 2026-05-09

Planning completed; implementation is now approved only for the hidden `/groupquests` workbench and should remain unlinked until Andreas says otherwise.

- [x] Plan SQC multiplayer/group competitions.
  - added_at: 2026-05-09 11:44 Europe/Stockholm
  - completed_at: 2026-05-09 11:55 Europe/Stockholm
  - source: Andreas requested planning for group competitions: single/multiple quests, shareable leaderboard/landing pages, time controls, quest order rules, group messaging, invites, open/closed and public/private competitions, live status, celebrations, proof, and handling cases where quests were completed individually before but not inside competition.
  - Proof: wrote `docs/SQC_MULTIPLAYER_COMPETITIONS_PLAN_2026-05-09.md` covering product model, data/state separation, creator/participant flows, settings, competition modes, live view, messaging, proof/fairness rules, MVP stages, APIs, and open questions.
  - Verification: planning/doc-only artifact; no code or website feature implementation.

## Active focus — SQC Mobile UI review — 2026-05-09

Andreas requested full focus on SQC Mobile. The next lane is a big UI review before further mobile implementation.

- [x] Complete SQC Mobile UI audit against website look/feel and comparable mobile app best practices.
  - added_at: 2026-05-09 10:27 Europe/Stockholm
  - completed_at: 2026-05-09 10:34 Europe/Stockholm
  - source: Andreas asked for full focus on SQC Mobile, a big UI review, best-practice comparison against popular similar apps, and a rule that look/feel should always follow the SQC website.
  - Proof: wrote `docs/SQC_MOBILE_UI_REVIEW_2026-05-09.md` with current-state audit, website parity canon, comparable app pattern summary, priority recommendations, and safe app-only implementation slices.
  - Verification: direct doc inspection; no code/test gate needed for review-only artifact.

- [x] Implement SQC Mobile Slice 1: website-parity IA and first-screen cockpit.
  - added_at: 2026-05-09 10:34 Europe/Stockholm
  - completed_at: 2026-05-09 10:47 Europe/Stockholm
  - source: follow-up from `docs/SQC_MOBILE_UI_REVIEW_2026-05-09.md` plus Andreas screenshot feedback showing the hero/debug-heavy first screen.
  - Proof: `apps/mobile` now uses a compact website-style hero, a “Today’s Side Quest” cockpit above the fold, `1 Read → 2 Play → 3 Verify` flow strip, clearer `View coat reward` CTA, lower-priority debug/readiness cards, and website-canon tab labels. Proof doc: `docs/SQC_MOBILE_FIRST_SCREEN_COCKPIT_2026-05-09.md`. Latest build label: `Android preview 0.2.13 / cockpit pass`.
  - Verification: `pnpm --dir apps/mobile typecheck`; Android `expo export --platform android --output-dir dist-android-ui-cockpit`; `pnpm lint` (passed with 3 pre-existing warnings).

- [x] Fix SQC Mobile Android safe-area overlap using real window insets.
  - added_at: 2026-05-09 11:37 Europe/Stockholm
  - completed_at: 2026-05-09 11:45 Europe/Stockholm
  - source: Andreas screenshot feedback: prior safe-area fix was not working; top still rendered under/too close to Android status area and bottom must avoid navigation buttons.
  - Proof: replaced manual Android offset approach with `react-native-safe-area-context`, wrapped app in `SafeAreaProvider`, used safe-area edges on the root screen, configured Android status/navigation bar colors, and bumped build label to `Android preview 0.2.14 / safe-area fix`. Proof doc: `docs/SQC_MOBILE_SAFE_AREA_CONTEXT_FIX_2026-05-09.md`.
  - Verification: `pnpm --dir apps/mobile typecheck`; Android `expo export --platform android --output-dir dist-android-safe-area-context`; `pnpm lint` (passed with 3 known warnings). Fresh APK build remains blocked by EAS auth (`Not logged in`).

- [ ] Continue SQC Mobile UI Slice 2: first-class Coat of Arms surface.
  - added_at: 2026-05-09 10:47 Europe/Stockholm
  - source: next recommendation from `docs/SQC_MOBILE_UI_REVIEW_2026-05-09.md`.
  - Acceptance: mobile `Coats` surface more clearly mirrors the website Coat of Arms page with earned/locked reward previews and less generic proof-preview language; website remains unchanged.

## Approved UI polish — Quest Hub order — 2026-05-09

- [x] Move Streamer-hard lane to the bottom of Quest Hub.
  - added_at: 2026-05-09 19:01 Europe/Stockholm
  - completed_at: 2026-05-09 19:03 Europe/Stockholm
  - source: Andreas sent a screenshot of the Streamer-hard lane and asked to move this section to the bottom.
  - Proof: reordered `src/app/challenges/page.tsx` so the Streamer-hard lane now renders after the recommended starting quests section.
  - Verification: `pnpm lint` passed with 3 known warnings; `pnpm build` passed. Production deploy/smoke pending.

## Reconfirmed wanted backlog — 2026-05-05

- [x] Surface Brutal/Absurd streamer-hard tier canon on Quest Hub.
  - added_at: 2026-05-09 04:51 Europe/Stockholm
  - completed_at: 2026-05-09 04:51 Europe/Stockholm
  - source: Scoped autonomous SQC backlog burst revisiting the reconfirmed Brutal/Absurd item against current launch-candidate baseline.
  - Proof: `/challenges` now has a visible Streamer-hard lane explaining the tier decision: Brutal is clip-worthy and can be casual/rated, while Absurd is rated-only for proof/leaderboard value. The lane highlights live Brutal/Absurd quests (`Queen? Never Heard of Her`, `Knightmare Mode`, `Rookless Rampage`) and the high-difficulty Coming Soon queue now has scheduled Brutal/Absurd release dates exposed through the difficulty filters.
  - Verification: `pnpm lint`; `pnpm build`; proof doc: `docs/SQC_BRUTAL_ABSURD_STREAMER_HARD_LANE_2026-05-09.md`.

- [x] Polish SQC mobile proof/status/account states without Clerk Native dependency.
  - added_at: 2026-05-09 02:15 Europe/Stockholm
  - completed_at: 2026-05-09 08:58 Europe/Stockholm
  - source: Overnight SQC mobile polish lane asked for coherent high-impact mobile GUI polish before Clerk help around 10:00; final pre-10 pass asked to review overnight polish, ship only a small safe bugfix if useful, verify, document, and produce the latest Android APK if possible.
  - Proof: `apps/mobile` now shows clearer account state progression, status confidence cards, native share/link handoff cards for quest/proof screens, guarded Android website handoffs, website parity dock, mobile mission/proof prep cards, and a final pre-10 pull-to-refresh fix that refreshes both the live quest catalog and account mirror. Latest build label: `Android preview 0.2.12 / pre-10 polish`; proof docs: `docs/SQC_MOBILE_PROOF_STATUS_ACCOUNT_POLISH_2026-05-09.md`, `docs/SQC_MOBILE_WEBSITE_PARITY_DOCK_OVERNIGHT_PASS3_2026-05-09.md`, `docs/SQC_MOBILE_PRE10_POLISH_2026-05-09.md`.
  - Verification: `pnpm --dir apps/mobile typecheck`; Android `expo export --platform android --output-dir dist-android-pre10-polish`; `pnpm lint` (passed with 3 pre-existing warnings). Fresh EAS APK build blocked because Expo/EAS auth is unavailable (`EXPO_TOKEN`/`EAS_TOKEN` missing; EAS CLI reports `Not logged in`).

- [x] Bring SQC mobile GUI close to website design parity before Clerk auth help.
  - added_at: 2026-05-09 00:30 Europe/Stockholm
  - completed_at: 2026-05-09 00:45 Europe/Stockholm
  - source: Andreas said he can help with Clerk tomorrow and asked Sam to make as much progress as possible until then; ideal target is a full mobile GUI on par with the website design.
  - Acceptance: Android APK has a polished SQC-branded interface, not an alpha shell; quest catalog/detail/account/status/proof screens visually align with the website; sign-in/Clerk-disabled states are graceful; app remains stable on emulator; fresh APK build is produced for Andreas testing.
  - Proof: mobile app UI was redesigned into a branded SQC mobile quest board with website-aligned dark/gold styling, stronger hero, polished quest cards, clearer tabs, intentional account/status/proof states, graceful auth-disabled copy, and fresh APK build `https://expo.dev/accounts/and72nor/projects/side-quest-chess/builds/8214849b-fb48-4f85-bccd-6294535670e0`; proof doc: `docs/SQC_MOBILE_DESIGN_PARITY_ALPHA_2026-05-09.md`.
  - Verification: `pnpm --filter @sidequestchess/mobile typecheck`; Android `expo export`; `pnpm lint`; EAS Android alpha build; `adb install -r`; emulator launch + screenshot confirmed polished UI loaded with no fatal crash.

- [x] Fix first Android alpha APK crash report.
  - added_at: 2026-05-08 13:12 Europe/Stockholm
  - completed_at: 2026-05-08 13:24 Europe/Stockholm
  - source: Andreas reported the first SQC Android APK crashes and asked whether Sam can test it on the Mac mini.
  - Proof: Local Expo validation first found SDK-54 dependency mismatches; mobile dependencies were aligned, `expo-doctor` passed all 17 checks, and APK build `d84b42fa-8893-4fc4-8f7a-8e6717f745aa` completed. After Andreas reported the app installed but stayed on the loading catalog screen, Android emulator tooling was installed on the Mac mini, the public catalog load was decoupled from Clerk auth readiness, request timeouts were added, and replacement APK build `https://expo.dev/accounts/and72nor/projects/side-quest-chess/builds/2c311146-efc0-4d25-990e-d86d801125d6` loaded the quest catalog visibly on the emulator. A harder catalog/account startup split then shipped in build `https://expo.dev/accounts/and72nor/projects/side-quest-chess/builds/733b2ee7-c599-4767-b97e-3664a02ed033`; Andreas confirmed on real Android device that it works great with no crashes. Proof doc: `docs/SQC_MOBILE_ANDROID_CRASH_FIX_BUILD_2026-05-08.md`.
  - Verification: `pnpm --filter @sidequestchess/mobile typecheck`; `expo-doctor`; local Android JS export; `pnpm lint`; EAS Android alpha APK build success; `adb install`; emulator launch and screenshot confirmed catalog visible.

- [x] Produce first SQC mobile Android alpha APK.
  - added_at: 2026-05-08 12:15 Europe/Stockholm
  - completed_at: 2026-05-08 12:33 Europe/Stockholm
  - source: Andreas created Expo access for SQC mobile and asked what was needed next; after Clerk redirect/key setup, build a real Android test package.
  - Proof: Expo/EAS project linked and first Android alpha APK build completed: `https://expo.dev/accounts/and72nor/projects/side-quest-chess/builds/6b054f4c-9e80-40c8-a03b-674433883d3b`; proof doc: `docs/SQC_MOBILE_ANDROID_ALPHA_APK_BUILD_2026-05-08.md`.
  - Verification: `pnpm --filter @sidequestchess/mobile typecheck`; `pnpm lint`; local Android JS export; EAS Android alpha APK build success.

- [x] Put quest name above coat-of-arms name on proof scrolls.
  - added_at: 2026-05-08 08:31 Europe/Stockholm
  - completed_at: 2026-05-08 08:43 Europe/Stockholm
  - source: Andreas suggested the proof/victory scroll should put the quest name on top instead of leading with the coat-of-arms name.
  - Proof: `VictoryScroll`, generated proof image route, and public proof page now lead with quest completion/title and show the coat-of-arms name as the unlocked reward beneath; proof doc: `docs/SQC_PROOF_SCROLL_QUEST_TITLE_FIRST_2026-05-08.md`.
  - Verification: `pnpm lint`; `pnpm build`; production deploy to `https://cc-hzv6zht6x-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; anonymous live smoke confirmed `/result`, `/challenges/finish-any-game`, and `/badges` return 200.

- [x] Rename Proof Loop Test coat of arms to clearer non-idiomatic English.
  - added_at: 2026-05-08 08:29 Europe/Stockholm
  - completed_at: 2026-05-08 08:36 Europe/Stockholm
  - source: Andreas screenshot feedback: “The Rubber Stamp Rampart” is hard to understand, especially for non-native English speakers.
  - Proof: `finish-any-game` badge identity now uses `The First Game Shield`, with simpler first-proof flavor, charge, motto, meaning, and weirdness copy; proof doc: `docs/SQC_PROOF_LOOP_TEST_CLEAR_BADGE_NAME_2026-05-08.md`.
  - Verification: `pnpm lint`; `pnpm build`; production deploy to `https://cc-3m4f5xh28-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`; live smoke confirmed `/challenges/finish-any-game` and `/badges` return 200, contain `The First Game Shield`, and no longer contain `Rubber Stamp Rampart`.

Andreas clarified that the previously listed items are still wanted and should be treated as the fresh post-reset SQC backlog; newer explicit requests are inserted above them:

- [x] Record SQC web launch candidate baseline.
  - added_at: 2026-05-07 20:38 Europe/Stockholm
  - completed_at: 2026-05-07 20:39 Europe/Stockholm
  - source: Andreas said he is happy with SQC as-is and asked to make a note that this is the launch candidate.
  - Proof: `docs/SQC_LAUNCH_CANDIDATE_BASELINE_2026-05-07.md` records the launch candidate status, baseline commit, production URL, included product state, and verification evidence.
  - Verification: production smoke checks after note.

- [x] Try and then remove signed-out homepage sample proof scroll backdrop.
  - added_at: 2026-05-07 20:24 Europe/Stockholm
  - completed_at: 2026-05-07 20:35 Europe/Stockholm
  - source: Andreas suggested showing the example proof scroll as a blurred, slanted background image behind the signed-out explainer text, then rejected the treatment and asked to remove it.
  - Proof: attempted in `27f955e` / documented in `80fcef1`, then removed in `2a27d05`; the current launch-candidate homepage does not include the proof-scroll backdrop.
  - Verification: `pnpm lint`; `pnpm build`; production smoke after deploy; homepage HTML no longer contains proof backdrop/demo proof markers.

- [x] Replace broken generic proof Share button with explicit social share buttons.
  - added_at: 2026-05-07 20:00 Europe/Stockholm
  - completed_at: 2026-05-07 20:17 Europe/Stockholm
  - source: Andreas reported the completed-quest `Share` button did not work or make sense and requested working social media sharing buttons instead; follow-up screenshot feedback asked for logo buttons instead of text buttons and removal of the explanatory goblins line.
  - Proof: `ShareProofActions` now renders compact logo/icon buttons for X, Facebook, Reddit, WhatsApp, Telegram, and LinkedIn, plus utility buttons for copying the proof link, copying the direct proof-image link, and downloading the generated proof PNG. The idle helper microcopy is removed.
  - Verification: `pnpm lint`; `pnpm build`; production smoke after deploy.

- [x] Update external SQC product review with current logged-in launch-candidate status.
  - added_at: 2026-05-07 18:45 Europe/Stockholm
  - completed_at: 2026-05-07 19:00 Europe/Stockholm
  - source: Andreas asked to use GPT 5.5 Pro, revisit `docs/research/sqc-review-2026-05-06/SQC_EXTERNAL_PRODUCT_REVIEW_2026-05-06.md`, update it based on current SQC status, and include logged-in experience.
  - Proof: review doc rewritten with updated current assessment, authenticated production E2E evidence, logged-in `/account` and completed proof findings, current launch recommendations, and updated 30/60/90 roadmap.
  - Verification: model switched to `openai-codex/gpt-5.5-pro`; live smoke checks for key pages; doc grep checks; git diff inspection.

- [x] Keep active quest next-step copy on one themed line.
  - added_at: 2026-05-07 18:12 Europe/Stockholm
  - completed_at: 2026-05-07 18:16 Europe/Stockholm
  - source: Andreas screenshot feedback on My Side Quest next-step copy wrapping and sounding too plain.
  - Proof: active next-step copy now uses SQC tone (`on the royal docket`, `summon the checker`) and the next-step paragraph is kept on one line on normal desktop widths.
  - Verification: `pnpm lint`; `pnpm build`; production smoke after deploy.

- [x] Launch Candidate 1 hardening pass.
  - added_at: 2026-05-07 17:54 Europe/Stockholm
  - completed_at: 2026-05-07 18:10 Europe/Stockholm
  - source: Andreas and Sam agreed SQC is close to launch ready. Andreas agreed with final launch-hardening checks except mobile web polish, because a proper SQC mobile app is planned for the next phase.
  - Proof: state-aware quest CTAs, sign-in/sign-up reassurance, My Side Quests next-step module, legal/support trust hygiene, beta-copy cleanup, and LC1 proof doc: `docs/SQC_LAUNCH_CANDIDATE_1_HARDENING_2026-05-07.md`.
  - Verification: `pnpm lint`; `pnpm build`; production smoke after deploy. Authenticated E2E remains the final manual launch gate because no clean test login/session is available in this run.

- [x] Start SQC mobile app foundation.
  - added_at: 2026-05-07 20:45 Europe/Stockholm
  - completed_at: 2026-05-07 20:58 Europe/Stockholm
  - source: Andreas agreed with the shared-backend mobile app approach and asked if I could start building it.
  - Proof: added `GET /api/mobile/bootstrap` as the first app-facing anti-drift API contract; added Expo/React Native scaffold under `apps/mobile/` with a first catalog/detail screen that fetches the live web-backed quest catalog; proof doc: `docs/SQC_MOBILE_APP_FOUNDATION_2026-05-07.md`.
  - Verification: `pnpm lint`; `pnpm build`; production deploy/smoke for `/api/mobile/bootstrap`.

- [x] Accelerate SQC Android alpha shell.
  - added_at: 2026-05-07 23:27 Europe/Stockholm
  - completed_at: 2026-05-07 23:45 Europe/Stockholm
  - source: Subagent task to continue the mobile app toward an Android-testable MVP while preserving the web launch candidate.
  - Proof: added root EAS profiles for Android internal APK alpha; updated Expo Android config; refactored the mobile app into Catalog, Quest Detail, Account, Status, and Proof shells that still consume `/api/mobile/bootstrap`; proof doc: `docs/SQC_MOBILE_ANDROID_ALPHA_SLICE_2026-05-07.md`.
  - Verification: `pnpm --filter @sidequestchess/mobile typecheck`; `pnpm lint`. Root build intentionally skipped because this slice did not change web API/runtime code.

- [x] Add read-only mobile account/status API contract.
  - added_at: 2026-05-07 23:32 Europe/Stockholm
  - completed_at: 2026-05-07 23:40 Europe/Stockholm
  - source: Andreas told Sam to keep working on the Android app without asking for each next step.
  - Proof: added `GET /api/mobile/account` as an authenticated, read-only app-facing endpoint; wired the Expo app to fetch it alongside `/api/mobile/bootstrap`; Account, Status, and Proof screens now render signed-out/auth-ready state or live authenticated account/progress/active-quest/latest-proof data when a session is available; proof doc: `docs/SQC_MOBILE_ACCOUNT_STATUS_API_2026-05-07.md`.
  - Verification: `pnpm --filter @sidequestchess/mobile typecheck`; `pnpm lint`; `pnpm build`; production smoke for anonymous `/api/mobile/account` should return auth-gated JSON.

- [x] Add native Google sign-in shell to SQC mobile app.
  - added_at: 2026-05-07 23:53 Europe/Stockholm
  - completed_at: 2026-05-07 23:59 Europe/Stockholm
  - source: Andreas told Sam to keep working on the Android app without asking for each next step.
  - Proof: installed `expo-web-browser`, added Expo auth-session completion, wired Clerk Expo `useSSO()` with Google, added `Sign in with Google` and `Sign out` controls in the mobile auth card, and kept account refreshes using the Clerk bearer token; proof doc: `docs/SQC_MOBILE_GOOGLE_SIGN_IN_SHELL_2026-05-07.md`.
  - Verification: `pnpm --filter @sidequestchess/mobile typecheck`; `pnpm lint`. No production deploy required because this slice only changes the mobile app shell.

- [x] Plan proper SQC mobile app phase after web launch candidate.
  - added_at: 2026-05-07 17:54 Europe/Stockholm
  - completed_at: 2026-05-07 20:45 Europe/Stockholm
  - source: Andreas said the next phase should be creating a mobile app for SQC, and clarified that when the website is updated the Android/iOS app should follow those updates.
  - Proof: `docs/SQC_MOBILE_APP_PLAN_2026-05-07.md` records React Native + Expo/EAS as the recommended direction, with the existing SQC backend as the source of truth and a strict anti-drift rule: app should fetch shared/API-backed product state rather than duplicating quest/verifier/proof logic.
  - Verification: plan doc committed; future implementation should start with app-facing API contract/shared schema before Expo UI work.

- [x] Add footer Terms & Conditions link and anno text.
  - added_at: 2026-05-07 17:46 Europe/Stockholm
  - completed_at: 2026-05-07 17:46 Europe/Stockholm
  - source: Andreas asked to add `Terms & Conditions` linking to `/terms` and the text `sidequestchess.com anno 2026` to the footer.
  - Proof: global footer now includes `sidequestchess.com anno 2026`, Support, and Terms & Conditions links; proof doc: `docs/SQC_FOOTER_TERMS_AND_ANNO_2026_2026-05-07.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Remove Leaderboard from top nav and move Support to footer.
  - added_at: 2026-05-07 17:41 Europe/Stockholm
  - completed_at: 2026-05-07 17:41 Europe/Stockholm
  - source: Andreas asked to remove Leaderboard for now and suggested Support could live in a bottom footer link.
  - Proof: top nav now shows Home, Side Quests, Coat of Arms, and account/auth controls only; global footer now includes a Support link to `/support`; proof doc: `docs/SQC_NAV_LEADERBOARD_SUPPORT_FOOTER_2026-05-07.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Make homepage coat-of-arms preview section fully clickable.
  - added_at: 2026-05-07 15:36 Europe/Stockholm
  - completed_at: 2026-05-07 15:38 Europe/Stockholm
  - source: Andreas said clicking anywhere on the homepage coat-of-arms section should take the user to the coat-of-arms page.
  - Proof: homepage coat-of-arms preview card is now a single full-card link to `/badges`, with nested image links removed and hover/focus affordance on the whole section. Proof doc: `docs/SQC_HOME_COAT_OF_ARMS_CARD_LINK_2026-05-07.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Replace SQC topbar alternate logo asset.
  - added_at: 2026-05-07 15:28 Europe/Stockholm
  - completed_at: 2026-05-07 15:31 Europe/Stockholm
  - source: Andreas uploaded a new image and asked to replace `sqc-alt-logo-topbar-transparent.png`.
  - Proof: `public/brand/sqc-alt-logo-topbar-transparent.png` replaced with the uploaded image; previous asset backed up locally at `tmp/sqc-alt-logo-topbar-transparent.previous.png`; cache-bust added versioned assets, latest `public/brand/sqc-alt-logo-topbar-20260507-v2.png`, and updated topbar references; proof doc: `docs/SQC_TOPBAR_LOGO_REPLACEMENT_2026-05-07.md`.
  - Verification: `sips` image metadata check; `pnpm lint`; `pnpm build`.

- [x] Add dated Coming Soon release schedule for hidden/draft quests.
  - added_at: 2026-05-07 15:10 Europe/Stockholm
  - completed_at: 2026-05-07 15:18 Europe/Stockholm
  - source: Andreas asked whether Coming Soon quests can have scheduled release dates shown in the stamp, with Sam developing and testing each quest beforehand.
  - Proof: visible Coming Soon queue now has weekly Thursday dates in the stamp: Pawn-Only Picnic 2026-05-14, Back Rank Goblin 2026-05-21, Late Castle Lifestyle 2026-05-28, Rook Lift Internship 2026-06-04. Proof doc: `docs/SQC_DATED_COMING_SOON_RELEASE_QUEUE_2026-05-07.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [ ] Prepare Pawn-Only Picnic for scheduled release on 2026-05-14.
  - added_at: 2026-05-07 15:18 Europe/Stockholm
  - source: First dated Coming Soon release in the weekly SQC release queue.
  - Acceptance: verifier implemented for supported providers; latest-game flow tested; reset/repeat behavior tested; proof receipt/image tested; production smoke passed before making it live.

- [x] Fix completed active quest state on Side Quest page.
  - added_at: 2026-05-07 15:12 Europe/Stockholm
  - completed_at: 2026-05-07 15:16 Europe/Stockholm
  - source: Andreas reported that the Side Quest page did not update that Any Game Counts was finalized.
  - Proof: completed quests now visually win over active state on `/challenges`; active id is only passed for incomplete quests, and completed cards always show completed award while suppressing active stamp.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Limit visible Coming Soon quests to at most four.
  - added_at: 2026-05-07 15:06 Europe/Stockholm
  - completed_at: 2026-05-07 15:10 Europe/Stockholm
  - source: Andreas cited report feedback that there are too many Coming Soon quests and asked to either make 6 live/tested or hide 6, with at most 4 Coming Soon cards.
  - Proof: `ChallengeDeckBrowser` now caps the rendered Coming Soon list to `MAX_VISIBLE_COMING_SOON_QUESTS = 4` after active filters/sort, hiding the excess six Coming Soon concepts from the public quest deck while preserving the underlying draft data.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Further shrink My Side Quest current coat and top-card height.
  - added_at: 2026-05-07 12:21 Europe/Stockholm
  - completed_at: 2026-05-07 12:23 Europe/Stockholm
  - source: Andreas asked to make the Current Quest coat of arms even smaller so the two top sections can be shorter.
  - Proof: Current Quest coat-of-arms max size reduced again; mobile size reduced; top hero/card padding, gaps, title scale, stat chip padding, and caption scale tightened further.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Cache generated proof scroll images instead of regenerating on every visit.
  - added_at: 2026-05-07 12:15 Europe/Stockholm
  - completed_at: 2026-05-07 12:20 Europe/Stockholm
  - source: Andreas noticed the proof image felt like it regenerated every page visit and asked if we could generate it once and save it/display faster.
  - Proof: `/api/og/proof/[token]` now returns long-lived public immutable cache headers; `ProofImage` waits for the browser timezone before setting `src`, avoiding the prior no-timezone SSR image request followed by a timezone image request.
  - Verification: `pnpm lint`; `pnpm build`; response-header smoke for proof image route.

- [x] Compact My Side Quest top cards and remove duplicate coat-of-arms rack.
  - added_at: 2026-05-07 12:09 Europe/Stockholm
  - completed_at: 2026-05-07 12:13 Europe/Stockholm
  - source: Andreas asked to remove the coat-of-arms display from the left section, make Current Quest coat of arms smaller, and reduce the height of the two top sections.
  - Proof: removed the left hero coat-of-arms rack; reduced left hero padding/title scale; reduced Current Quest badge size and card spacing for a more compact top grid.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Clean up My Side Quest trophy cabinet chrome.
  - added_at: 2026-05-07 12:05 Europe/Stockholm
  - completed_at: 2026-05-07 12:08 Europe/Stockholm
  - source: Andreas asked to remove the “10 susp...” pill and “Awkward...” banner, and check alignment of the text under the quest name.
  - Proof: removed the suspicious-points pill and diagonal certification banner from `/account`; centered/tightened trophy-card title and awkward subtitle alignment.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Remove the current-quest “View victory proof” button from My Side Quest.
  - added_at: 2026-05-07 12:00 Europe/Stockholm
  - completed_at: 2026-05-07 12:02 Europe/Stockholm
  - source: Andreas said the target page is not needed from the current quest card.
  - Proof: removed the `/result?challengeId=...` CTA from the completed current quest card on `/account`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Make completed quests on My Side Quest feel fancy, funny, and awkward.
  - added_at: 2026-05-07 11:59 Europe/Stockholm
  - completed_at: 2026-05-07 12:08 Europe/Stockholm
  - source: Andreas requested that completed quests should feel like you are supposed to be really proud, but not really.
  - Proof: `/account` completed-quest section is now an awkward trophy cabinet with ceremonially suspicious summary stats, larger coat-of-arms cards, ribbons like “Regrettably earned”, and funny explanatory copy per completed badge.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Prevent reset/restart from reusing a pre-activation game and localize proof time.
  - added_at: 2026-05-07 11:15 Europe/Stockholm
  - completed_at: 2026-05-07 11:25 Europe/Stockholm
  - source: Andreas reported that reset worked, but reactivating the quest immediately completed again from the old latest game, and noticed proof time did not account for user timezone.
  - Proof: latest-game and manual submitted-game verification now require the proof game to have `completedGameAt` after the active quest `startedAt`; old/missing game times become pending with explicit copy; proof receipt fields are preserved; visible proof times render in browser-local timezone; generated proof images accept a validated `tz` query from the share action. Proof doc: `docs/SQC_RESET_ACTIVATION_WINDOW_AND_LOCAL_PROOF_TIME_2026-05-07.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Add completed quest reset button with irreversible confirmation.
  - added_at: 2026-05-07 11:05 Europe/Stockholm
  - completed_at: 2026-05-07 11:10 Europe/Stockholm
  - source: Andreas shared a screenshot and asked for a button to reset/undo a completed quest so users can do it again, with a warning/confirmation that the action cannot be undone.
  - Proof: added `Reset quest` control to completed quest proof details, confirmation dialog, and `resetCompletedChallenge` server action that removes the quest from completed progress, recalculates points, removes saved attempts/proof receipts for that quest, and clears active state for that quest. Proof doc: `docs/SQC_COMPLETED_QUEST_RESET_CONTROL_2026-05-07.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Generate the full victory scroll as one shareable image.
  - added_at: 2026-05-07 10:40 Europe/Stockholm
  - completed_at: 2026-05-07 10:45 Europe/Stockholm
  - source: Andreas shared a screenshot and asked whether the whole scroll, including text, could be generated as one image looking exactly like the current scroll so sharing is easier.
  - Proof: converted `/api/og/proof/[token]` into a full vertical 1200×1600 victory-scroll PNG with badge art, scroll copy, proof line, date/points, and wax seal; result/public proof sharing now uses the user-specific proof URL. Proof doc: `docs/SQC_FULL_VICTORY_SCROLL_IMAGE_SHARE_2026-05-07.md`.
  - Verification: `pnpm lint`; `pnpm build`; local `/api/og/proof/[token]` smoke returned `200 image/png` at `1200 x 1600`; visual inspection confirmed a complete scroll image.

- [x] Remove proof log page and add simple completed side quest list to My Side Quests.
  - added_at: 2026-05-06 23:22 Europe/Stockholm
  - completed_at: 2026-05-06 23:28 Europe/Stockholm
  - source: Andreas said `/proof-log` is not needed and asked for a simple completed quest list on My Side Quests showing coat of arms, quest name, and finish date.
  - Proof: deleted `/proof-log`, removed proof-log links/copy, replaced account collected grid with a simple completed side quest list, and kept each row linked to the quest page. Proof doc: `docs/SQC_REMOVE_PROOF_LOG_ADD_COMPLETED_LIST_2026-05-06.md`.
  - Verification: grep for `proof-log`/`Proof log`; `pnpm lint`; `pnpm build`.

- [x] Replace completed proof utility buttons with one social Share action.
  - added_at: 2026-05-06 23:15 Europe/Stockholm
  - completed_at: 2026-05-06 23:21 Europe/Stockholm
  - source: Andreas corrected the share controls: only a single Share is needed, and it should share the scroll image plus home-page link.
  - Proof: simplified `ShareProofActions` to one button, made completed proof share fetch the scroll image and pass it to the Web Share API when supported, set the share URL to `/`, and removed proof page/image/log utility buttons from completed proof details. Proof doc: `docs/SQC_SINGLE_SOCIAL_SHARE_SCROLL_IMAGE_2026-05-06.md`.
  - Verification: grep for removed utility labels; `pnpm lint`; `pnpm build`.

- [x] Make completed proof sharing user-specific with public proof image preview.
  - added_at: 2026-05-06 23:05 Europe/Stockholm
  - completed_at: 2026-05-06 23:12 Europe/Stockholm
  - source: Andreas asked whether scroll proof can be made into an image to share, or a link to this specific user's proof, noting current links appear generic.
  - Proof: added signed public proof URLs at `/proof/[token]`, scroll-style OG image route at `/api/og/proof/[token]`, updated completed proof and result share actions to use the public proof URL, and added a proof image link. Proof doc: `docs/SQC_PUBLIC_PROOF_SHARE_LINKS_AND_IMAGE_2026-05-06.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Put proof details buttons on one row.
  - added_at: 2026-05-06 23:01 Europe/Stockholm
  - completed_at: 2026-05-06 23:04 Europe/Stockholm
  - source: Andreas shared a screenshot and asked to “put all buttons on one row”.
  - Proof: `Copy proof`, `Share proof`, `Proof page`, and `Proof log` now render in one action row, with mobile wrapping only for narrow screens. Proof doc: `docs/SQC_PROOF_DETAILS_SINGLE_BUTTON_ROW_2026-05-06.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Rename visible Quests labels to Side Quests.
  - added_at: 2026-05-06 22:56 Europe/Stockholm
  - completed_at: 2026-05-06 22:59 Europe/Stockholm
  - source: Andreas shared a screenshot of the nav and asked “Rename Quests to Side Quests”.
  - Proof: changed the top nav label plus matching visible hub/share/brand/terms copy while leaving URLs unchanged. Proof doc: `docs/SQC_SIDE_QUESTS_NAV_LABEL_2026-05-06.md`.
  - Verification: grep for standalone `Quests`; `pnpm lint`; `pnpm build`.

- [x] Simplify completed proof details below the victory scroll.
  - added_at: 2026-05-06 22:49 Europe/Stockholm
  - completed_at: 2026-05-06 22:55 Europe/Stockholm
  - source: Andreas shared a screenshot of the proof details area and said “Simplify this.”
  - Proof: replaced the grid/data-heavy proof details section with one short receipt line, simplified share button labels, compact proof-page/proof-log links, and removed the redundant completed active quest status dashboard. Proof doc: `docs/SQC_PROOF_DETAILS_SIMPLIFICATION_2026-05-06.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Clean up Completed Proof section into visual scroll plus separate proof details.
  - added_at: 2026-05-06 20:44 Europe/Stockholm
  - completed_at: 2026-05-06 20:50 Europe/Stockholm
  - source: Andreas said the left side of the Completed Proof section did not make sense and suggested removing it and using a separate section for links/data.
  - Proof: made `ProofPositionBoard` visual-only, centered the scroll, and added a separate `Proof details` section with receipt data, sanitized proof summary, share actions, and links. Proof doc: `docs/SQC_COMPLETED_PROOF_SECTION_CLEANUP_2026-05-06.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Rotate victory scroll wax seal slightly clockwise.
  - added_at: 2026-05-06 17:49 Europe/Stockholm
  - completed_at: 2026-05-06 17:52 Europe/Stockholm
  - source: Andreas shared a screenshot and asked to rotate the seal a little bit clockwise.
  - Proof: changed `.victory-scroll-seal` rotation from `-6deg` to `4deg`, preserving size and position. Proof doc: `docs/SQC_PROOF_SCROLL_SEAL_CLOCKWISE_ROTATION_2026-05-06.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Fix Any Game Counts evidence wording and move proof-scroll seal upward.
  - added_at: 2026-05-06 17:44 Europe/Stockholm
  - completed_at: 2026-05-06 17:48 Europe/Stockholm
  - source: Andreas noted `are accepted for` should not dangle and asked to move the wax seal higher into the middle of the empty space below the text.
  - Proof: rephrased Any Game Counts evidence to `Win, loss, draw, color, and time control all count.`, added sanitizer coverage for old receipts/truncated wording, and moved the proof-scroll seal upward. Proof doc: `docs/SQC_ANY_GAME_COUNTS_EVIDENCE_AND_SEAL_POSITION_2026-05-06.md`.
  - Verification: grep for `are accepted for`; `pnpm lint`; `pnpm build`.

- [x] Remove `accepted` pill from Completed Proof header.
  - added_at: 2026-05-06 17:40 Europe/Stockholm
  - completed_at: 2026-05-06 17:43 Europe/Stockholm
  - source: Andreas shared a screenshot and asked to remove the `accepted` pill.
  - Proof: removed the green `accepted` badge from the completed proof section header while keeping the victory scroll/proof content intact. Proof doc: `docs/SQC_COMPLETED_PROOF_REMOVE_ACCEPTED_PILL_2026-05-06.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Rephrase leftover Any Game Counts pass summary and proof-scroll punctuation.
  - added_at: 2026-05-06 17:35 Europe/Stockholm
  - completed_at: 2026-05-06 17:39 Europe/Stockholm
  - source: Andreas noticed `the Proof Loop Test passed.` still appeared and asked to rephrase it and examine the punctuation of the last sentence.
  - Proof: changed new verifier summaries to `Any Game Counts is complete.`, added `sanitizeAttemptSummary` for old saved receipts, and changed proof-scroll final line punctuation to `Proof accepted: <quest> — <summary>`. Proof doc: `docs/SQC_SANITIZE_ANY_GAME_COUNTS_SUMMARY_2026-05-06.md`.
  - Verification: grep for old pass strings in `src`; `pnpm lint`; `pnpm build`.

- [x] Remove internal `proof loop` / `loop` language from user-facing copy.
  - added_at: 2026-05-06 17:29 Europe/Stockholm
  - completed_at: 2026-05-06 17:34 Europe/Stockholm
  - source: Andreas said the text mentions `proof loop` and `loop`, which does not make sense for users.
  - Proof: renamed visible `Proof Loop Test` to `Any Game Counts`, changed loop/test badge/status wording to completion language, rewrote any-game victory scroll copy, verifier summaries, pending copy, and other user-facing `loop` copy in `src/`. Proof doc: `docs/SQC_REMOVE_LOOP_LANGUAGE_FROM_USER_COPY_2026-05-06.md`.
  - Verification: grep for loop/proof-loop strings in `src`; `pnpm lint`; `pnpm build`.

- [x] Fix Completed Proof victory scroll bottom pill visibility.
  - added_at: 2026-05-06 17:23 Europe/Stockholm
  - completed_at: 2026-05-06 17:28 Europe/Stockholm
  - source: Andreas loved the scroll but noted the date/points pill at the bottom was not visible and suggested making the scroll wider while compacting the text to the left.
  - Proof: updated Completed Proof layout CSS so the left copy column is more compact, the scroll column is wider/taller, scroll text wraps less, and date/points pills have bottom clearance above the seal. Proof doc: `docs/SQC_COMPLETED_PROOF_SCROLL_LAYOUT_FIX_2026-05-06.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Use victory scroll in Completed Proof fallback when board data is missing.
  - added_at: 2026-05-06 17:16 Europe/Stockholm
  - completed_at: 2026-05-06 17:20 Europe/Stockholm
  - source: Andreas showed the completed quest page still displaying the simple `PROOF ACCEPTED` panel and clarified he only saw that, not the intended scroll/certificate surface.
  - Proof: reworked `ProofPositionBoard` missing-board fallback into a parchment victory scroll with coat of arms, quest-specific SQC-tone achievement copy, proof line, date/points, and canonical wax seal; final-board rendering remains intact when FEN exists. Proof doc: `docs/SQC_COMPLETED_PROOF_SCROLL_FALLBACK_2026-05-06.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Replace passed-result share card with a parchment victory scroll.
  - added_at: 2026-05-06 16:24 Europe/Stockholm
  - completed_at: 2026-05-06 16:31 Europe/Stockholm
  - source: Andreas rejected the ornate monogram direction as too complicated and requested a better good-news sharing artifact: handwritten scroll, coat of arms at top, quest-relevant SQC-tone achievement text, and seal at bottom.
  - Proof: updated `/result` passed-state share card into a `victory-scroll` with unlocked coat of arms, quest-specific mocking achievement copy, proof/game line, date/points, and canonical SQC wax seal. Proof doc: `docs/SQC_VICTORY_SCROLL_SHARE_CARD_2026-05-06.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Remove active quest indicator from homepage badge preview section.
  - added_at: 2026-05-06 16:27 Europe/Stockholm
  - completed_at: 2026-05-06 16:31 Europe/Stockholm
  - source: Andreas pointed at the specific coat-of-arms preview section and said not to show the active quest indicator there.
  - Proof: removed active stamp/green active class logic from the homepage `Every bad idea deserves a coat of arms` badge preview row, while keeping active quest treatment elsewhere. Proof doc: `docs/SQC_HOME_BADGE_PREVIEW_REMOVE_ACTIVE_INDICATOR_2026-05-06.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Center completed quest wax seal on completed quest cards.
  - added_at: 2026-05-06 16:23 Europe/Stockholm
  - completed_at: 2026-05-06 16:25 Europe/Stockholm
  - source: Andreas shared a completed quest card screenshot and asked to move the seal to the center of the card.
  - Proof: updated `.card-completed-award` CSS to center via `left: 50%`, `top: 50%`, and `translate(-50%, -50%)`, keeping the compact seal and pill treatment. Proof doc: `docs/SQC_COMPLETED_CARD_SEAL_CENTERING_2026-05-06.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Remove `Check latest games` from the My Side Quests Current Quest card.
  - added_at: 2026-05-06 16:19 Europe/Stockholm
  - completed_at: 2026-05-06 16:21 Europe/Stockholm
  - source: Andreas shared a My Side Quests screenshot and asked to remove the `Check latest games` button.
  - Proof: removed the incomplete active quest check form/button from `src/app/account/page.tsx` while keeping completed-state proof actions intact. Proof doc: `docs/SQC_CURRENT_QUEST_REMOVE_CHECK_LATEST_GAMES_BUTTON_2026-05-06.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Rename visible `My Quest Log` label to `My Side Quests`.
  - added_at: 2026-05-06 16:15 Europe/Stockholm
  - completed_at: 2026-05-06 16:17 Europe/Stockholm
  - source: Andreas shared a screenshot of the nav pill and asked to change `My Quest Log` to `My Side Quests`.
  - Proof: replaced visible UI strings in `src/` including the site nav pill and related account CTAs/helper copy. Proof doc: `docs/SQC_MY_SIDE_QUESTS_LABEL_RENAME_2026-05-06.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Clean connected accounts card on My Quest Log.
  - added_at: 2026-05-06 16:10 Europe/Stockholm
  - completed_at: 2026-05-06 16:12 Europe/Stockholm
  - source: Andreas shared a screenshot and asked to remove `Ready for proof`, the `2/2 connected` pill, and the `Update accounts` button.
  - Proof: updated `src/app/account/page.tsx` so connected state no longer shows the ready headline, count pill, or update button; connect CTA remains only when no chess identity exists. Proof doc: `docs/SQC_ACCOUNT_CONNECTED_ACCOUNTS_CLEANUP_2026-05-06.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Replace old yellow completed stamp on quest cards with canonical wax seal treatment.
  - added_at: 2026-05-06 16:03 Europe/Stockholm
  - completed_at: 2026-05-06 16:07 Europe/Stockholm
  - source: Andreas shared a screenshot showing the old yellow completed stamp on a quest card and said the seal plus `Quest completed...` pill should be used there too and everywhere.
  - Proof: updated `ChallengeCard` completed state to render the canonical wax seal plus `Quest completed` pill, and added compact `.card-completed-award` CSS for card layouts while keeping the detail hero treatment intact. Proof doc: `docs/SQC_GLOBAL_COMPLETED_SEAL_TREATMENT_2026-05-06.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Replace Completed Proof placeholder with polished Victory Proof receipt.
  - added_at: 2026-05-06 15:53 Europe/Stockholm
  - completed_at: 2026-05-06 15:58 Europe/Stockholm
  - source: Andreas agreed to convert the Completed Proof section into a proper Victory Proof card with a real board when available, polished fallback when not, and share/copy actions.
  - Proof: reworked `ProofPositionBoard` to show final board data when present, an accepted-proof receipt fallback when board data is missing, receipt facts, and `ShareProofActions`; updated the challenge detail section heading to `Victory proof is ready.` and removed dev-facing placeholder copy. Proof doc: `docs/SQC_COMPLETED_PROOF_VICTORY_RECEIPT_POLISH_2026-05-06.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Move completed-date pill below the seal without covering it.
  - added_at: 2026-05-06 15:42 Europe/Stockholm
  - completed_at: 2026-05-06 15:46 Europe/Stockholm
  - source: Andreas shared a screenshot showing the pill was not centered under the seal and was covering the bottom part; he asked for it below the seal.
  - Proof: removed rotation from the award wrapper, rotated only the seal layer, kept the pill horizontal in the unrotated wrapper, and moved it below the seal with `top: calc(100% + ...)`. Proof doc: `docs/SQC_COMPLETED_QUEST_PILL_BELOW_SEAL_2026-05-06.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Center completed-date pill horizontally under canonical wax seal.
  - added_at: 2026-05-06 15:39 Europe/Stockholm
  - completed_at: 2026-05-06 15:43 Europe/Stockholm
  - source: Andreas said the `Quest completed...` pill would be hard to perfect when slanted and asked to place it centered right under the seal, horizontal/no slant.
  - Proof: adjusted `.completed-quest-award small` to sit lower under the seal and counter-rotate against the seal group so it appears horizontal. Proof doc: `docs/SQC_COMPLETED_QUEST_PILL_CENTERED_UNDER_SEAL_2026-05-06.md`.
  - Verification: `pnpm lint`; `pnpm build`.

- [x] Preserve Andreas-provided canonical SQC wax seal and use it in completed quest hero.
  - added_at: 2026-05-06 15:34 Europe/Stockholm
  - completed_at: 2026-05-06 15:39 Europe/Stockholm
  - source: Andreas provided the final wax seal image and said to use it as the wax seal and keep the file because it will be reused a lot.
  - Proof: preserved exact source as `public/stamps/sqc-wax-seal-canonical-source.png`, created transparent UI asset `public/stamps/sqc-wax-seal-canonical.png`, and updated completed quest CSS to use the canonical asset. Proof doc: `docs/SQC_CANONICAL_WAX_SEAL_ASSET_2026-05-06.md`.
  - Verification: dark-background visual preview; `pnpm lint`; `pnpm build`.

- [x] Redo completed wax seal with original coat-of-arms text built in.
  - added_at: 2026-05-06 15:25 Europe/Stockholm
  - completed_at: 2026-05-06 15:31 Europe/Stockholm
  - source: Andreas rejected the patched seal text and asked to redo the whole seal, ensuring the original coat-of-arms text is included.
  - Proof: regenerated the seal as `public/stamps/quest-complete-premium-red-wax-sqc-v15.png` from the original SQC coat-of-arms reference so `SIDE QUEST CHESS` is integrated into the generated lower banner/ribbon, removed the magenta background/fringe locally, and updated CSS to use v15. Proof doc: `docs/SQC_COMPLETED_QUEST_FULL_SEAL_REDO_WITH_ORIGINAL_TEXT_2026-05-06.md`.
  - Verification: visual preview; `pnpm lint`; `pnpm build`.

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
  - Follow-up shipped 2026-05-09: Chess.com successful manual and latest-game verification receipts now carry `finalPositionFen`/`lastMoveUci` when public PGN parsing succeeds, so the existing proof board can render Chess.com final positions too. Proof doc: `docs/SQC_CHESSCOM_FINAL_POSITION_PROOF_RECEIPTS_2026-05-09.md`.
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
