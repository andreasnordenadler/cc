# CC Clerk Cutover Status

Date: 2026-04-10
Checked by: Sam
Live URL: `https://cc-andreas-nordenadlers-projects.vercel.app/account`

## Current status

This is no longer a product-lane blocker.

- Vercel production still appears to be using Clerk test/dev keys.
- Signed-out/raw requests to `/account` still show Clerk-managed 404 behavior.
- But authenticated `/account` was verified working in Google Chrome on the Mac mini at 2026-04-10 17:09 Europe/Stockholm.

## Latest evidence

### Remaining drift evidence

From `npx vercel env pull --yes --environment=production .vercel/.env.production.recheck` during the latest checks recorded in `docs/CLERK_ENV_CHECK_2026-04-10.md`:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` still resolves to `pk_test_...`
- `CLERK_SECRET_KEY` still resolves to `sk_test_...`

From signed-out/raw `curl -I -L --max-redirs 10 https://cc-andreas-nordenadlers-projects.vercel.app/account`:

- `HTTP/2 404`
- `x-clerk-auth-reason: protect-rewrite, dev-browser-missing`
- `x-clerk-auth-status: signed-out`
- `x-matched-path: /404`

### Browser success evidence

From Google Chrome on the Mac mini:

- exact URL loaded: `https://cc-andreas-nordenadlers-projects.vercel.app/account`
- visible authenticated account page rendered successfully
- saved username was visible on the page

## Current interpretation

Keep the Clerk cutover material as optional cleanup guidance. Do not treat it as the reason CC cannot continue shipping product work.

## Related docs

- `docs/LIVE_ROUTE_CHECK_2026-04-09.md`
- `docs/ACCOUNT_PROTECTION_AUDIT_2026-04-10.md`
- `docs/CLERK_ENV_CHECK_2026-04-10.md`
- `docs/CLERK_PRODUCTION_CUTOVER_PLAN_2026-04-10.md`
