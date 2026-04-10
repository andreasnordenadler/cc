# CC `/account` auth handoff minimum cleanup

Date: 2026-04-10
Checked by: Sam
Target route: `/account`

## Exact current split

- Authenticated browser result: live `/account` works and renders the signed-in account screen in Chrome on the Mac mini.
- Signed-out/raw result: `curl -I -L https://cc-andreas-nordenadlers-projects.vercel.app/account` returns `HTTP/2 404` with Clerk headers including `x-clerk-auth-reason: protect-rewrite, dev-browser-missing` and `x-matched-path: /404`.
- Local cause: `src/middleware.ts` hard-protects `/account(.*)` with `auth.protect()`, so signed-out traffic is handed to Clerk before the app can show a calmer handoff.

## Fix type decision

This should be treated as an **app-level cleanup**, not a config-only fix.

Why:
- production-key/domain cleanup may still be worth doing later, but it is broader operator work and not the smallest safe slice
- the confusing behavior is caused by the current protected-route handoff shape
- the signed-in flow already works, so the safest change is to preserve that path and only improve the signed-out branch

## Smallest safe follow-up slice

1. Remove `/account` from the middleware `auth.protect()` matcher.
2. Keep `src/app/account/page.tsx` as the single route.
3. In the page, branch on `currentUser()`:
   - signed in -> keep the existing account/settings screen unchanged
   - signed out -> render a minimal handoff card with one clear sign-in CTA and one back-to-challenges CTA
4. Do not combine this slice with Clerk production cutover, new routes, or broader auth rewrites.

## Why this is the minimum reviewable cleanup

- avoids touching the working authenticated account flow
- removes the current Clerk-managed 404 presentation for signed-out users
- keeps the UX decision inside app code where we can review it directly
- leaves later Clerk environment normalization independent from this cleanup

## Acceptance for the follow-up implementation

- signed-in `/account` still renders the current account page
- signed-out `/account` no longer surfaces as the confusing Clerk-managed 404 path
- `pnpm lint` and `pnpm build` pass after the change

## Verification note

Artifact created and verified locally on 2026-04-10 with `test -f docs/ACCOUNT_AUTH_HANDOFF_MINIMUM_CLEANUP_2026-04-10.md`.
