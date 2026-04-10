# CC Account Protection Audit

Date: 2026-04-10
Checked by: Sam
Target route: `/account`
Exact live URL checked: https://cc-andreas-nordenadlers-projects.vercel.app/account

## What is happening now

- Live `GET /account` is currently returning `404 Not Found` on the checked production URL.
- The response headers show Clerk is actively involved in that 404, which means this is not a simple missing-route failure.

## Captured production evidence

`curl -I -L https://cc-andreas-nordenadlers-projects.vercel.app/account`

Key headers observed on 2026-04-10:

- `HTTP/2 404`
- `x-clerk-auth-reason: protect-rewrite, dev-browser-missing`
- `x-clerk-auth-status: signed-out`
- `x-matched-path: /404`
- `server: Vercel`

## Local code and config evidence

- The route exists locally at `src/app/account/page.tsx`.
- Local route protection is implemented in `src/middleware.ts` with `auth.protect()` for `/account(.*)`.
- Local build evidence previously recorded `ƒ /account` in the app manifest.
- Local development config in `.env.local` currently uses Clerk test/dev keys:
  - `CLERK_SECRET_KEY` starts with `sk_test_`
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` starts with `pk_test_`

## Likely cause

The strongest current explanation is that the active Vercel deployment is protecting `/account` through Clerk, but the deployment is wired to a Clerk development/test setup that is not completing the expected browser auth flow on this production URL. The `dev-browser-missing` auth reason is the key clue.

## Recommended next move

Check the Vercel environment for the active deployment and confirm the Clerk publishable/secret keys are the intended production values for this hostname. After that, re-run the live `/account` check.

## Verification note

Artifact created and verified locally on 2026-04-10 with `test -f docs/ACCOUNT_PROTECTION_AUDIT_2026-04-10.md`.
