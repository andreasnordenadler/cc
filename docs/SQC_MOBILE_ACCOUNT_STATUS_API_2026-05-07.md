# SQC Mobile Account Status API — 2026-05-07

## Goal

Continue Android-alpha work without asking Andreas for decisions and add the next anti-drift API slice: read-only authenticated mobile account/status state.

## Added API

- `GET /api/mobile/account`

### Signed out response

When there is no Clerk session, the endpoint returns `401` with a small JSON body:

- `authenticated: false`
- `signInUrl`
- explanatory message

This lets the mobile app distinguish "not signed in yet" from an actual API failure.

### Signed in response

When authenticated, the endpoint returns backend-owned account state derived from Clerk public metadata:

- profile display name / bio / image URL
- connected Lichess and Chess.com usernames
- progress totals and proof receipt count
- active quest status, title, started/verified timestamps, completion state, and badge image URL
- completed quest summaries
- latest proof receipt summary

No verifier logic or private credentials are moved into the app.

## Mobile app wiring

Updated the Expo app to fetch both:

- `/api/mobile/bootstrap`
- `/api/mobile/account`

The Account, Status, and Proof screens now render either:

- signed-out/auth-ready state, or
- live authenticated account/status/proof receipt data once the mobile auth session is available.

## Anti-drift impact

This keeps the Android app following the web/backend source of truth for:

- connected usernames;
- active quest state;
- completed quests;
- points;
- proof receipt count;
- latest proof status.

## Verification

- `pnpm --filter @sidequestchess/mobile typecheck`
- `pnpm lint`
- `pnpm build`
- production smoke after deploy for `/api/mobile/account` should return `401` JSON when anonymous, proving the route is live and auth-gated.

## Next step

Add mobile auth/session bridge so the Android app can call `/api/mobile/account` as the signed-in user, then add read/write action endpoints for start/check/reset.
