# CC Clerk Production Cutover Plan

Date: 2026-04-10
Checked by: Sam
Project: `cc`

## Goal

Replace the live Vercel production Clerk test/dev keys with the intended production Clerk instance values, redeploy, and verify that `/account` no longer rewrites to a 404.

## Why this is the next step

The current production deployment is using:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` starting with `pk_test_`
- `CLERK_SECRET_KEY` starting with `sk_test_`

That matches the live 404 audit signal:

- `x-clerk-auth-reason: protect-rewrite, dev-browser-missing`

## Exact env vars to replace in Vercel Production

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

They should be replaced with the intended live Clerk instance values for the active production hostname.

## Safe cutover checklist

1. In Clerk, open the intended live instance for CC.
2. Copy the live/production values for:
   - publishable key
   - secret key
3. In Vercel, update the **Production** environment variables for:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
4. Confirm the new values are not `pk_test_...` / `sk_test_...` dev keys.
5. Trigger a fresh production redeploy for project `cc`.
6. After deploy completes, run:
   - `curl -I -L https://cc-andreas-nordenadlers-projects.vercel.app/account`
7. Confirm the response no longer shows the prior failure pattern:
   - `HTTP/2 404`
   - `x-clerk-auth-reason: protect-rewrite, dev-browser-missing`
   - `x-matched-path: /404`
8. Record the new live verdict in `docs/CLERK_ENV_CHECK_2026-04-10.md`.

## Evidence to capture during cutover

Capture these exact pieces of proof:

- the updated Vercel production env inventory showing the two Clerk variables still exist
- the pulled production env values or prefixes showing they are no longer test/dev keys
- the deployment URL or production redeploy confirmation
- the post-cutover `curl -I -L` headers for `/account`

## Done condition

This blocker is only cleared when the live `/account` route is re-checked after redeploy and the result is recorded with exact headers and verdict.

## Verification note

Artifact created at `cc/docs/CLERK_PRODUCTION_CUTOVER_PLAN_2026-04-10.md`.
