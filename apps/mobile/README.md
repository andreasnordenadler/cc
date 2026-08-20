# Side Quest Chess Mobile

React Native + Expo shell for the Side Quest Chess Android/iOS app.

## Architecture rule

The app must follow `sidequestchess.com` updates by reading the same backend/API state wherever practical. Do not fork quest definitions, verifier rules, proof logic, or user progress into mobile-only code.

Current API contracts:

- `GET https://sidequestchess.com/api/mobile/bootstrap`
- `GET https://sidequestchess.com/api/mobile/account`
- `PATCH https://sidequestchess.com/api/mobile/profile`
- `POST https://sidequestchess.com/api/mobile/quest`
- `POST https://sidequestchess.com/api/mobile/support`
- `POST https://sidequestchess.com/api/mobile/groupquests/{id}`

Bootstrap returns the live quest catalog and mobile compatibility metadata from the web backend. Account returns signed-out JSON when unauthenticated and backend-owned user/profile/progress/status/proof data when a Clerk session is present.

## Distribution status

Android build `0.1.349` / code `350` has been accepted to the private Google Play Internal testing track. Android production/public launch is not verified. There is no verified App Store, TestFlight, or EAS Update production channel yet. GitHub Releases APKs remain historical/direct QA artifacts rather than evidence of a store launch.

Launch-channel rule: treat a candidate as distributed only when the exact store/test-track state and artifact identity have been verified. EAS/local builds, emulator installs, Expo dev-client sessions, and GitHub artifacts are QA inputs unless a release receipt explicitly promotes them. Apple account, signing, build, TestFlight, submission, and release actions remain separately approval-gated.

For every mobile release candidate, verify and record:

- GitHub release tag, APK filename, version name, and Android version code.
- APK SHA256.
- `pnpm mobile:release:candidate-check` passes, confirming `REAL_DEVICE_SMOKE.md`, `apps/mobile/app.json`, latest non-draft `mobile-v*` GitHub Release metadata, exactly one APK asset plus matching `.apk.sha256` sidecar, release-note SHA256, downloaded APK hash, and APK manifest all describe the same candidate.
- `application-debuggable` is absent/false (the candidate check verifies `debuggable=false` from the downloaded APK manifest).
- Install + launch succeeds on a real signed Android device, not only an emulator.
- Native Google sign-in succeeds through Clerk with `sidequestchess://sso-callback` configured.
- Account sync, Solo start/check/explicit proof/reset, Custom Side Quest create/edit/lifecycle, Multiplayer create/join/leave/refresh/proof, support form, proof share/copy, and logout all work on device.

Do not commit APKs, exported `dist-*` directories, or generated release artifacts.

## Local commands

```bash
pnpm --filter @sidequestchess/mobile start
pnpm --filter @sidequestchess/mobile ios
pnpm --filter @sidequestchess/mobile android
pnpm --filter @sidequestchess/mobile typecheck
pnpm --filter @sidequestchess/mobile build:android:alpha
```

Set a non-production API while developing with:

```bash
EXPO_PUBLIC_SQC_API_BASE_URL=http://localhost:3000 pnpm --filter @sidequestchess/mobile start
```

Copy the local env template before testing the Clerk mobile bridge:

```bash
cp apps/mobile/.env.example apps/mobile/.env.local
```

Then set `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` in `.env.local` or EAS environment variables. Do **not** commit Clerk secret keys. The current bridge uses `@clerk/clerk-expo` with Expo SecureStore token cache; account fetches attach `Authorization: Bearer <session token>` when Clerk reports a signed-in mobile session.

For Android alpha Google SSO, allow this redirect URL in Clerk before testing the APK/dev client:

```text
sidequestchess://sso-callback
```

The app also displays that redirect in the auth card so an on-device tester can confirm the expected Clerk dashboard entry. After sign-in, the Account tab distinguishes between:

- local Expo Clerk session present + `/api/mobile/account` accepted the bearer token (test pass), and
- local Expo Clerk session present + `/api/mobile/account` still returned signed-out JSON (server bearer-verification blocker).

## Current scope

This is the shared Android/iOS mobile shell. It currently:

- loads the live web-backed quest catalog;
- renders native Home, Solo Side Quests, Multiplayer Side Quests, Account, Support, and Coat of Arms surfaces;
- supports signed-out browsing and authenticated Clerk-backed account state;
- supports chess username, runner display name, and brag-line profile editing;
- supports Solo quest start, latest-game check, explicit game/link proof submission, reset, proof viewing, proof-link copy, and native proof sharing;
- supports Custom/Community Solo browse, safe rule summaries, creator context, public-link sharing, a support-report handoff, active proof controls, and saved-rule editing;
- supports Multiplayer discovery, details, host context, create/join/leave/refresh/proof flows, native content/creator reporting and creator blocking, podium trophies, and shareable public links;
- keeps raw custom quest config and private account metadata hidden from public/mobile display;
- includes root and mobile EAS profiles for internal Android QA plus approval-gated Android and iOS production builds; profile presence is not authorization to build, sign, upload, or release.

Next app milestones:

1. Complete the approval-gated Android production launch and verify public storefront availability.
2. Reconcile the iOS candidate with the correct Crowdler AB Apple team and dedicated operational identity, then complete signing, TestFlight, and exact-candidate real-device QA.
3. Keep closing standalone parity gaps only when they directly affect app-first launch readiness.
