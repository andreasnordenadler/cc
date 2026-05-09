# Side Quest Chess Mobile

React Native + Expo shell for the Side Quest Chess Android/iOS app.

## Architecture rule

The app must follow `sidequestchess.com` updates by reading the same backend/API state wherever practical. Do not fork quest definitions, verifier rules, proof logic, or user progress into mobile-only code.

Current API contracts:

- `GET https://sidequestchess.com/api/mobile/bootstrap`
- `GET https://sidequestchess.com/api/mobile/account`

Bootstrap returns the live quest catalog and mobile compatibility metadata from the web backend. Account returns signed-out JSON when unauthenticated and backend-owned user/profile/progress/status/proof data when a Clerk session is present.

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

This is the Android preview shell, not the finished app. It currently:

- loads the live web-backed quest catalog;
- renders a mobile quest board, first-run tour, quest detail screen, and reward preview;
- includes app-side state/screen shells for Catalog, Quest Detail, Account, Status, and Proof;
- fetches the read-only account/status/proof API and renders signed-out or authenticated state;
- installs the Clerk Expo provider foundation and safely waits for `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` before enabling mobile sessions;
- attaches a Clerk bearer token to account refreshes when a signed-in Expo session is available;
- includes explicit Android SSO redirect configuration and an on-device bearer-auth acceptance/rejection signal;
- documents the anti-drift rule in-app;
- includes root EAS profiles for an internal Android APK preview.

Next app milestones:

1. Run the Android app/APK with `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` configured and `sidequestchess://sso-callback` allowed in Clerk; confirm whether `/api/mobile/account` accepts the Expo bearer token directly or needs a dedicated server-side Clerk request-auth helper.
2. Add chess username connection/update flow.
3. Add start/check/reset quest actions.
4. Add proof image viewer and native share sheet.
5. Run the first internal Android APK build once EAS auth/signing choices are ready.
