# SQC Mobile Clerk Tomorrow Readiness — 2026-05-09

## Goal

Give the next operator a clean checklist for turning the Android preview from public quest browsing into authenticated account mirroring without disturbing the website-owned source of truth.

## Current Android preview state

- Build label in-app: `Android preview 0.2.6 / polish pass 7`.
- Expo app version: `0.1.7`; Android `versionCode`: `8`.
- Public mode loads the live quest board and reward previews from `sidequestchess.com`.
- Website handoff remains the safe path for connecting chess usernames, starting quests, submitting proof, and sharing receipts.
- Mobile Clerk bridge is installed and guarded behind `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`.

## Clerk setup checklist

1. Add the Expo public publishable key to local/EAS env as `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`.
2. In Clerk, allow the Android redirect URL:

```text
sidequestchess://sso-callback
```

3. Confirm Google OAuth is enabled for the Clerk instance backing `sidequestchess.com`.
4. Install/open the Android APK and tap **Sign in with Google**.
5. Open **Me**.
   - Pass: account profile, connected chess usernames, progress, active quest, and latest receipt render from `/api/mobile/account`.
   - Blocker: app says Google sign-in is local but the website API did not accept the mobile token yet.

## If the blocker appears

- Keep the app as a public quest browser; do not remove the website handoff.
- Add/adjust the Next.js mobile API bearer-verification helper so `/api/mobile/account` accepts the Clerk Expo session token.
- Re-run the auth test before exposing account mutation actions in mobile.

## Guardrails

- Do not commit Clerk secret keys.
- Do not fork quest definitions, verifier logic, proof receipt logic, or progress state into mobile-only storage.
- Keep mobile copy honest: it is an Android preview, but it should feel like a real product shell rather than a technical alpha.
