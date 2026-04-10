# CC Account Protection Audit

Date: 2026-04-10
Checked by: Sam
Target route: `/account`
Exact live URL checked: https://cc-andreas-nordenadlers-projects.vercel.app/account

## What is happening now

- The route itself is live and usable in a real authenticated browser session.
- During the 2026-04-10 17:09 Europe/Stockholm re-check in Google Chrome on the Mac mini, `/account` loaded successfully and rendered the signed-in account screen (`AUTHENTICATED ACCOUNT`) with the saved username visible.
- Signed-out/raw `GET /account` checks from `curl` still return `404 Not Found` with Clerk headers, so the remaining issue is specifically about how protected signed-out/non-browser access is handled.

## Captured production evidence

### Authenticated browser evidence

Google Chrome on the Mac mini, checked live at `https://cc-andreas-nordenadlers-projects.vercel.app/account`:

- page title: `CC — Chess Challenge`
- visible body text included:
  - `AUTHENTICATED ACCOUNT`
  - `Current saved username: and72nor`

### Signed-out/raw HTTP evidence

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

## Updated interpretation

This is no longer accurate to frame as a general live `/account` failure. The authenticated path works. The narrower concern is that the active deployment still produces a Clerk-managed 404 for signed-out/non-browser access, which is confusing and may still indicate a production auth-environment or redirect-quality issue worth cleaning up.

## Recommended next move

Treat this as auth-behavior cleanup, not a project blocker:

1. keep CC product work moving
2. preserve the evidence that authenticated `/account` works in Chrome
3. later decide whether to normalize the signed-out `/account` flow so it redirects or lands more cleanly instead of presenting as a 404-like protected rewrite

## Verification note

Artifact updated and verified locally on 2026-04-10 with `test -f docs/ACCOUNT_PROTECTION_AUDIT_2026-04-10.md`.
