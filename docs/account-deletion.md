# Account deletion

SQC exposes permanent account deletion from **My Account** in both the Next.js web app and the Expo mobile app.

## User flow

1. The signed-in user opens the account screen and chooses **Delete account**.
2. SQC explains that deletion is permanent and lists the affected data.
3. The user must type the exact phrase `DELETE MY ACCOUNT`; the destructive button remains disabled otherwise.
4. The first-party backend derives the user ID exclusively from the authenticated Clerk session or verified mobile bearer token and calls Clerk's Backend API `users.deleteUser` for that ID.
5. After success, the client clears/signs out the local session and returns home.

No endpoint accepts a target user ID. This prevents IDOR: a caller cannot select another account, even by adding a `userId` field to the JSON body.

## Data and failure behavior

Clerk deletion permanently removes the Clerk identity and all SQC data owned in that user's Clerk public/private metadata, including profile details, chess usernames, progress, proof records, custom quests, hosted multiplayer metadata, likes, and support messages.

If Clerk rejects or cannot complete deletion, SQC returns a generic retryable `503` response, does not expose Clerk error details or secrets, and does not report deletion as complete. The UI keeps the user signed in so they can retry. SQC does not call Clerk deletion from the browser or ship `CLERK_SECRET_KEY` to mobile.

## Verification

```bash
pnpm test
pnpm lint
pnpm --dir apps/mobile typecheck
pnpm build
```

Tests use injected fake deletion functions and mocked local `fetch`; they never call Clerk or a production mutation endpoint.

## Clerk / release checklist for Andreas

- Confirm `CLERK_SECRET_KEY` is configured only in the server deployment environment and belongs to the same Clerk instance as the public publishable keys.
- Confirm the deployed Clerk Backend API key has permission to delete users (`DELETE /v1/users/{user_id}`); no client-side Clerk setting is required.
- Exercise deletion only with a dedicated non-production test tenant/account before store submission. Do not test with a real user account.
- Include the in-app path **My Account → Delete account** in App Store / Play review notes.
