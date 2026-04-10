# CC Clerk Cutover Blocker Status

Date: 2026-04-10
Checked by: Sam
Live URL: `https://cc-andreas-nordenadlers-projects.vercel.app/account`

## Current status

The queued post-cutover live `/account` re-check is still blocked because the active Vercel production environment is still serving Clerk test/dev keys instead of production keys.

## Latest blocker evidence

From `npx vercel env pull --yes --environment=production .vercel/.env.production.recheck` during the latest checks recorded in `docs/CLERK_ENV_CHECK_2026-04-10.md`:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` still resolves to `pk_test_...`
- `CLERK_SECRET_KEY` still resolves to `sk_test_...`

From `curl -I -L --max-redirs 10 https://cc-andreas-nordenadlers-projects.vercel.app/account` during the latest checks recorded in `docs/CLERK_ENV_CHECK_2026-04-10.md`:

- `HTTP/2 404`
- `x-clerk-auth-reason: protect-rewrite, dev-browser-missing`
- `x-clerk-auth-status: signed-out`
- `x-matched-path: /404`

## Single unblock action

Replace the Vercel **Production** values for `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` with the intended Clerk live-instance keys, redeploy, then re-run the queued live `/account` check.

## Related docs

- `docs/CLERK_ENV_CHECK_2026-04-10.md`
- `docs/CLERK_PRODUCTION_CUTOVER_PLAN_2026-04-10.md`
- `docs/CLERK_CUTOVER_OPERATOR_CHECKLIST_2026-04-10.md`
- `docs/CLERK_POST_CUTOVER_SMOKE_2026-04-10.md`
