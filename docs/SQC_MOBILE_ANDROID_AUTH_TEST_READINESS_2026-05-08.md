# SQC Mobile Android Auth Test Readiness — 2026-05-08

## Goal

Move the Expo Android shell to the next concrete user-testable auth state: a tester can configure Clerk, complete Google SSO, and see whether `/api/mobile/account` accepts the mobile bearer token.

## What changed

- Added `expo-auth-session` as an explicit mobile dependency because the app now owns the Android OAuth redirect URL instead of relying only on Clerk's internal default.
- Set the mobile Google SSO redirect URL to:

```text
sidequestchess://sso-callback
```

- Passed that redirect URL into Clerk Expo `startSSOFlow({ strategy: "oauth_google" })`.
- Showed the expected Clerk redirect URL directly in the mobile auth card for device-test diagnostics.
- Refreshes backend state after sign-in/sign-out actions so the tester does not need to manually pull-to-refresh immediately after Google SSO.
- Improved the Account tab blocker signal: if Clerk says the Expo app is locally signed in but `/api/mobile/account` still returns signed-out JSON, the app now explicitly labels that as a backend bearer-token verification blocker.
- Updated `apps/mobile/README.md` with Android auth test setup and expected pass/blocker signals.

## User-testable state

A tester can now run the app on Android with:

- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` configured locally or in EAS env;
- `sidequestchess://sso-callback` allowed in the Clerk dashboard for SSO redirect URLs;
- Google OAuth enabled for the Clerk instance used by `sidequestchess.com`.

Then test:

1. Open the Android app.
2. Confirm live quest catalog loads from `https://sidequestchess.com/api/mobile/bootstrap`.
3. Tap **Sign in with Google**.
4. Complete Google SSO.
5. Open **Account**.
6. Pass condition: Account shows authenticated profile/progress from `/api/mobile/account`.
7. Blocker condition: Account says local Clerk Expo session exists but backend did not accept the bearer token, meaning the Next.js mobile API needs dedicated Clerk bearer verification work.

## Verification

- `pnpm --filter @sidequestchess/mobile typecheck`
- Anonymous production smoke still returns auth-gated mobile account JSON from `https://sidequestchess.com/api/mobile/account`.

No production deploy was performed in this slice; mobile shell/docs/dependency metadata changed only.
