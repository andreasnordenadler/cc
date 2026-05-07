# SQC Mobile Google Sign-In Shell — 2026-05-07

## Goal

Continue Android-alpha app work by moving from a passive Clerk provider to an actual native Google sign-in entry point in the Expo shell, without committing any secrets.

## What changed

- Added `expo-web-browser` as an explicit mobile dependency.
- Called `WebBrowser.maybeCompleteAuthSession()` for Expo auth-session completion.
- Wired Clerk Expo `useSSO()` with `strategy: "oauth_google"`.
- Added a `Sign in with Google` button in the mobile auth card when Clerk is configured and the user is signed out.
- Added a `Sign out` button when the mobile Clerk session is signed in.
- Kept session token forwarding to `/api/mobile/account` via `Authorization: Bearer <session token>`.

## Secrets / configuration

No secret keys are committed.

The app still requires local/EAS environment configuration before real Android device sign-in:

- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`

Clerk/Expo redirect URLs may also need to be allowed in the Clerk dashboard before the first full device auth test.

## Verification

- `pnpm --filter @sidequestchess/mobile typecheck`
- `pnpm lint`

No web runtime/API code changed in this slice, so no production deploy is required.

## Next step

Run the Android app with the Clerk publishable key configured, complete Google SSO on-device, and verify whether `/api/mobile/account` accepts the Expo session bearer token as intended. If not, add a dedicated server-side Clerk token verification helper for the mobile API.
