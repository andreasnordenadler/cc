# Live `/account` blocker handoff

Date: 2026-04-10
Project: cc

## Exact blocker

The active production deployment is still using Clerk test keys (`pk_test_...` / `sk_test_...`). Because of that mismatch, the protected live `/account` route still rewrites to 404 instead of serving the signed-in account flow.

Latest repeated live evidence:
- `curl -I -L --max-redirs 10 https://cc-andreas-nordenadlers-projects.vercel.app/account`
- verdict: `HTTP/2 404`
- Clerk headers seen: `x-clerk-auth-reason: protect-rewrite, dev-browser-missing`
- repeated env evidence: `npx vercel env pull --yes --environment=production ...` still resolves to Clerk test keys

## Use these docs

1. `docs/CLERK_ENV_CHECK_2026-04-10.md` for the exact evidence trail
2. `docs/CLERK_CUTOVER_OPERATOR_CHECKLIST_2026-04-10.md` for the shortest operator checklist
3. `docs/CLERK_POST_CUTOVER_SMOKE_2026-04-10.md` for the exact re-check commands immediately after cutover

## Single unblock condition

Run the queued live re-check only after Vercel production env values have been replaced with the intended Clerk production keys and the site has been redeployed.

## Expected next action after unblock

Append the fresh live `/account` verdict and headers to `docs/CLERK_ENV_CHECK_2026-04-10.md` and then continue the roadmap from that result.
