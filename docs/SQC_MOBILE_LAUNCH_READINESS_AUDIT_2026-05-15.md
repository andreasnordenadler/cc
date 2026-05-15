# SQC Mobile Launch Readiness Audit — 2026-05-15

## Executive status

**Readiness: Yellow / not launch-ready yet.** The Expo mobile app is a credible Android preview shell with live backend-backed catalog, Clerk Expo auth foundation, username save, start/check quest actions, account mirror, coat shelf, and native share-link handoff. It is not yet a launch-ready app because the core solo quest loop is incomplete on mobile: users still cannot submit a specific game/link, reset/deactivate/repeat quests, view/share proof images natively, or rely on verified production mobile auth without a device smoke.

The critical path is now narrow: finish **solo quest loop parity**, prove **production device auth**, run **emulator/device QA**, then cut an **internal Android APK release candidate**. Multiplayer parity and deep website parity can follow after the first launch-ready build if the launch definition is “usable public/mobile v1” rather than “full website parity.”

## Sources inspected

- `apps/mobile/README.md`
- `apps/mobile/package.json`
- `apps/mobile/app.json`
- `apps/mobile/eas.json`
- `apps/mobile/App.tsx`
- `apps/mobile/src/api/sqc.ts`
- `apps/mobile/src/types/sqc.ts`
- `src/app/api/mobile/*`
- `src/proxy.ts`
- `ROADMAP.md`
- `docs/SQC_MOBILE_APP_PLAN_2026-05-07.md`
- `docs/SQC_MOBILE_FEATURE_PARITY_MATRIX_2026-05-14.md`
- `docs/SQC_MOBILE_QUEST_ACTIONS_SLICE_2026-05-14.md`
- `docs/SQC_MOBILE_USERNAME_SAVE_SLICE_2026-05-14.md`
- `docs/SQC_MOBILE_COAT_SHELF_SLICE_2026-05-14.md`
- `docs/SQC_MOBILE_EMULATOR_SCREENSHOT_WORKFLOW_2026-05-14.md`
- `docs/SQC_MOBILE_UI_REVIEW_2026-05-09.md`
- `docs/SQC_LAUNCH_QA_2026-05-13.md`

## Checks run

- `pnpm --filter @sidequestchess/mobile typecheck` — **PASS**
- `pnpm lint` — **PASS with 3 known warnings**
  - `scripts/deploy-production-guard.mjs` unused `envOutput`
  - `src/components/proof-image.tsx` `<img>` warning
  - `src/components/site-nav.tsx` `<img>` warning
- `pnpm --dir apps/mobile exec expo export --platform android --output-dir dist-android-launch-audit` — **PASS**
- Production API smoke:
  - `GET https://sidequestchess.com/api/mobile/bootstrap` — **200**, `apiVersion: 1`, `11` challenges
  - anonymous `GET https://sidequestchess.com/api/mobile/account` — **401 expected JSON**
  - anonymous `POST https://sidequestchess.com/api/mobile/quest` — **401 expected JSON**

## Current mobile capabilities

### Working / implemented

- Expo + React Native app under `apps/mobile`.
- Android package: `com.sidequestchess.app`.
- iOS bundle identifier configured: `com.sidequestchess.app`.
- Live quest catalog via `GET /api/mobile/bootstrap`.
- Offline bootstrap fallback if live API is unavailable.
- Quest list/detail/rules/reward/coats rendering.
- Account mirror via `GET /api/mobile/account`.
- Clerk Expo provider, SecureStore token cache, Google SSO redirect shell: `sidequestchess://sso-callback`.
- Native username save via `PATCH /api/mobile/profile`.
- Native quest start/check via `POST /api/mobile/quest` actions `start` and `check`.
- Coat shelf / latest receipt display from account mirror.
- Native share sheet for SQC links.
- EAS profiles for Android internal APK builds.
- Emulator screenshot workflow documented with `sqc_pixel_35`.

### Important partials

- Google SSO is wired, but production device acceptance of the Clerk bearer token still needs a real Android smoke with the production key and Clerk redirect allow-list.
- Proof/receipt display exists, but proof image viewer/share/download parity is not native yet.
- Website handoffs exist for scoreboard, badges, verifier, and account management, but this is not the same as mobile parity.
- The app has a good preview cockpit, but the bottom navigation is still `Side Quests / Mission / Coats / My SQC / Proof`, not the cleaner Home-first IA recommended in the UI review.

## Launch-ready definition

For a credible **mobile v1 launch-ready build by end of next week**, I would define launch-ready as:

1. **Core solo loop works natively for a signed-in user**
   - sign in with Google;
   - connect/update Lichess and Chess.com usernames;
   - browse quests;
   - start one active quest;
   - check latest public game;
   - submit a specific public game URL when latest-game detection misses;
   - see passed/failed/pending result;
   - reset/deactivate/retry quest;
   - view earned coat/proof receipt;
   - share proof/link via native share sheet.
2. **Backend remains single source of truth**
   - mobile calls app-facing API routes or shared server semantics;
   - no forked verifier rules or quest definitions.
3. **Production auth is proven on a real Android build**
   - Google SSO completes;
   - `/api/mobile/account` accepts mobile bearer token;
   - mobile mutations work with the same user on production.
4. **Usability is clean enough for first users**
   - no clipped bottom nav;
   - first screen has one obvious next action;
   - copy does not over-apologize about website handoff;
   - empty states are actionable.
5. **Release artifacts are repeatable**
   - EAS Android APK/AAB build can be produced;
   - version/versionCode incremented;
   - smoke checklist documented;
   - screenshots captured;
   - known limitations documented.

This definition deliberately excludes full Multiplayer Side Quest parity, full scoreboard parity, and full static page parity from the first launch-ready cut. Those are larger P1/P2 additions after a usable solo-loop mobile v1.

## Missing capabilities / gaps

### P0 launch blockers

1. **Specific game submit is missing**
   - Website has `submitChallengeAttempt` semantics.
   - Mobile API currently supports only `start` and `check`.
   - App has no native public game URL input.

2. **Reset/deactivate/retry controls are missing**
   - Website has `deactivateActiveChallenge` and `resetCompletedChallenge` style flows.
   - Mobile API/action client does not expose them.
   - Current user could get stuck with an active/completed state unless they hand off to web.

3. **Production Android auth/device smoke is not documented as passed**
   - Code is configured for Clerk Expo + production publishable key.
   - The docs still describe the pass/blocker test rather than proof that it passed on a production APK/dev client.

4. **Proof image/native sharing is incomplete**
   - Mobile can share links, but not view/download/share the canonical generated proof image natively.
   - This weakens SQC’s most viral loop.

5. **First-run UI polish blockers from emulator pass remain**
   - Rightmost bottom tab was observed clipped/off-screen.
   - Hero text truncation was observed on emulator width.

### P1 gaps for strong v1

- Account/profile parity only covers chess usernames; display name/bio remain website-only.
- Quest Hub grouping/filtering/scheduled context missing.
- Path/suggested quest and random quest are missing as native actions.
- Full badge collection parity is partial.
- Production signed-in QA automation is not available.
- Older fixture tests under `tests/*.mjs` are not clean launch gates.
- App metadata/privacy/store-readiness has not been fully audited.

### P2 / post-v1 parity gaps

- Multiplayer Side Quest native list/create/join/status/leaderboard/proof states.
- Native scoreboard.
- Native support/terms/rules/verifier info screens instead of handoffs.
- Deep links to quest/proof/dare/share routes.
- Push/local reminders after starting a quest.
- iOS build/device QA.

## Risk list

| Risk | Severity | Why it matters | Mitigation |
|---|---:|---|---|
| Clerk mobile bearer token not accepted by production backend | High | Signed-in mobile becomes browse-only | Run real Android APK auth smoke first; if blocked, implement dedicated Clerk bearer verification helper/API path. |
| Solo loop remains handoff-heavy | High | App feels like a website companion, not launch-ready | Add submit/reset/deactivate native API + UI before RC. |
| Proof sharing is link-only | Medium/High | Reduces viral reward loop | Add proof image metadata endpoint/viewer and native share/download. |
| Mobile UI clipping/truncation | Medium | First impression quality issue | Run emulator screenshot pass after each UI slice; fix nav/hero before RC. |
| EAS/store signing not rehearsed | Medium | Launch week surprise | Cut internal APK RC early; document build artifact and signing owner. |
| App Store / Play policy metadata absent | Medium | Blocks public store launch | Prepare privacy/data safety copy and screenshots in parallel. |
| Full website parity scope is too large | Medium | Deadline miss | Launch solo-loop v1; defer Multiplayer/native static screens. |
| Existing repo has unrelated dirty/untracked files | Low/Medium | Release hygiene / accidental commits | Isolate mobile branch/commit; review `git status` before any deploy/build release. |

## Critical path

1. **Confirm production mobile auth** on a real Android build/dev client.
2. **Add mobile solo quest mutation parity**:
   - submit specific game URL;
   - deactivate active quest;
   - reset completed quest.
3. **Make result/proof useful natively**:
   - latest receipt details;
   - proof image URL/viewer where available;
   - native share sheet with proof/deep link.
4. **Fix launch UI issues**:
   - bottom nav clipping;
   - hero truncation;
   - reduce repeated website-handoff copy;
   - make one primary next action obvious.
5. **Cut Android RC and test end-to-end**:
   - clean EAS APK build;
   - install on emulator/device;
   - sign in;
   - save usernames;
   - start/check/submit/reset;
   - share proof;
   - smoke public API fallback/offline behavior.

## Day-by-day plan through end of next week

### Fri 2026-05-15 — auth proof + solo-loop API design

- Run/install current Android build on emulator or device with production Clerk key.
- Confirm Google SSO redirect is allowed and `/api/mobile/account` accepts bearer token.
- If auth fails, implement/fix mobile bearer verification before any more feature work.
- Design exact `POST /api/mobile/quest` action contract expansion:
  - `submit` with `challengeId`, `provider` or parsed URL, `gameUrl`;
  - `deactivate`;
  - `reset`.

### Sat 2026-05-16 — implement submit/deactivate/reset backend + client

- Extend mobile API route using existing website server-action semantics.
- Extend `MobileQuestActionResponse` with receipt/status fields if useful.
- Extend `runMobileQuestAction` client.
- Add anonymous/auth error JSON coverage.
- Run mobile typecheck, lint, Next build, anonymous API smoke.

### Sun 2026-05-17 — implement native UI for solo-loop completion

- Add public game URL input and submit CTA on quest/status surfaces.
- Add deactivate/reset controls with confirmation copy.
- Refresh account mirror after every mutation.
- Add clear empty/error states for no username, no active quest, pending result, failed result.
- Emulator screenshot pass for affected screens.

### Mon 2026-05-18 — proof/share parity slice

- Add proof/receipt metadata needed by mobile if current account payload is insufficient.
- Add native proof viewer surface for latest/completed proof.
- Add native share sheet payload for proof/result link and, if feasible, proof image URL.
- Validate passed/failed/pending receipt rendering.

### Tue 2026-05-19 — UI launch polish + IA cleanup

- Fix bottom tab clipping and hero text truncation.
- Consider adding a Home/Today cockpit or at least make the top card one-action-first.
- Reduce repeated “website owns this” copy to one diagnostics/handoff card.
- Capture screenshot set: Side Quests, Mission, Coats, My SQC, Proof/status, sign-in state.

### Wed 2026-05-20 — Android RC build and end-to-end QA

- Bump app version/versionCode/build label.
- Build internal Android APK with EAS or reproducible local debug equivalent.
- Install on emulator/device.
- Run end-to-end smoke:
  - launch;
  - live catalog;
  - Google sign-in;
  - username save;
  - start quest;
  - check latest;
  - submit specific game URL;
  - reset/deactivate;
  - proof/share;
  - sign out/in persistence.

### Thu 2026-05-21 — release hardening + store/beta prep

- Fix RC issues only; no new scope.
- Prepare Play internal testing notes, screenshots, privacy/data safety notes, and known limitations.
- Confirm no accidental generated Android artifacts or secrets are staged.
- Optional: iOS simulator build smoke if time allows, but do not let iOS block Android RC unless Andreas requires simultaneous launch.

### Fri 2026-05-22 — launch-ready decision gate

- Re-run launch gates:
  - mobile typecheck;
  - lint;
  - Next build if backend changed;
  - Expo Android export/build;
  - production API smoke;
  - emulator/device signed-in smoke.
- Write final `SQC_MOBILE_RC_...` proof doc with APK/build ID, screenshots, checks, known limitations.
- If all P0s are green, mark Android v1 launch-ready/internal-release-ready.
- If any P0 remains red, ship a narrowed RC only if it is honestly labeled preview/beta, not launch-ready.

## Immediate next code tasks, prioritized

1. **Production auth proof/fix**
   - Run real Android auth smoke.
   - If bearer token fails, add dedicated server-side Clerk bearer verification path for mobile endpoints.

2. **Add mobile `submit` quest action**
   - Backend: extend `/api/mobile/quest` using website submit semantics.
   - App: add game URL input + submit button + result message.

3. **Add mobile `deactivate` and `reset` quest actions**
   - Backend JSON actions.
   - App controls on active/completed status cards.

4. **Return richer mobile receipt/proof data**
   - Include enough result/proof/share metadata in `/api/mobile/account` or a new proof endpoint.
   - Avoid duplicating proof-generation logic in the app.

5. **Proof viewer/share slice**
   - Show latest proof/coat clearly.
   - Native share sheet should share proof/result, not only generic challenge links.

6. **Fix emulator UI defects**
   - Bottom nav clipping.
   - Hero truncation.
   - Card density / repeated limitation copy.

7. **RC build hygiene**
   - Version bump.
   - Clean git status review.
   - EAS build proof.
   - Screenshot pack and QA doc.

## Recommended first implementation slice

Start with **production auth proof + mobile specific-game submit**.

Reason: start/check already exist, but without verified auth and specific submit, a real user can fail the mobile loop for ordinary reasons: latest-game detection misses the intended game, or the API never accepts their mobile session. Fixing these two gives the fastest movement from preview shell to real app.
