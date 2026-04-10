# CC Clerk Environment Check

Date: 2026-04-10
Checked by: Sam
Vercel project: `cc`
Vercel account: `andreasnordenadler-2420`
Active live hostname checked against prior audit: `https://cc-andreas-nordenadlers-projects.vercel.app/account`

## Verdict

The active Vercel deployment is **not** using a production Clerk environment for the live hostname. It is wired to the same Clerk **test/development** instance seen locally, so this is an exact mismatch rather than a clean bill of health.

## Source evidence

### Vercel-linked project

From `.vercel/project.json`:

- `projectName`: `cc`
- `projectId`: `prj_z4w2lp0MV5hJEhc3m7PN2CuH3d5w`

### Vercel environment inventory

From `npx vercel env ls production` on 2026-04-10:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` present for Production, Preview, Development
- `CLERK_SECRET_KEY` present for Production, Preview, Development

### Pulled production values

From `npx vercel env pull .env.vercel.production --environment=production --yes` on 2026-04-10:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_Y2hhbXBpb24taGFnZmlzaC0xMy5jbGVyay5hY2NvdW50cy5kZXYk"`
- `CLERK_SECRET_KEY="sk_test_qYlQRLWzNfUUF7O8LIDYZPTAsLapcvJtogZg1oHoho"`

### Comparison to local audit

The production values exactly match the local `.env.local` development/test Clerk keys previously recorded in `docs/ACCOUNT_PROTECTION_AUDIT_2026-04-10.md`.

## Exact mismatch

The active Vercel production deployment for `cc` is using:

- a `pk_test_...` publishable key
- an `sk_test_...` secret key
- a Clerk account domain encoded in the publishable key ending in `.clerk.accounts.dev`

That is not the intended production-grade Clerk environment for a live Vercel hostname. It aligns with the earlier live header evidence:

- `x-clerk-auth-reason: protect-rewrite, dev-browser-missing`
- `x-matched-path: /404`

## Conclusion

This is the most likely cause of the live `/account` protection failure. The route is present and protected, but the active Vercel deployment is attached to a Clerk development/test instance instead of the intended live environment for this hostname.

## Recommended next move

Replace the Vercel production Clerk keys with the intended live Clerk instance values, redeploy, and then re-run the live `/account` route check.

## Follow-up re-check at 2026-04-10 11:35 Europe/Stockholm

The requested post-cutover re-check is currently blocked because the Clerk production cutover has **not** happened yet.

### Fresh evidence

From `npx vercel env pull --yes --environment=production .env.production.autopilot-check` on 2026-04-10:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_Y2hhbXBpb24taGFnZmlzaC0xMy5jbGVyay5hY2NvdW50cy5kZXYk"`
- `CLERK_SECRET_KEY="sk_test_qYlQRLWzNfUUF7O8LIDYZPTAsLapcvJtogZg1oHoho"`

From `curl -I -L https://cc-andreas-nordenadlers-projects.vercel.app/account` on 2026-04-10:

- `HTTP/2 404`
- `x-clerk-auth-reason: protect-rewrite, dev-browser-missing`
- `x-clerk-auth-status: signed-out`
- `x-matched-path: /404`

### Current blocker verdict

The live deployment is still using Clerk test/dev keys, so the post-cutover acceptance check cannot be completed honestly in this run. This roadmap item must remain open until the Vercel Production Clerk keys are replaced and the site is redeployed.

## Follow-up re-check at 2026-04-10 12:55 Europe/Stockholm

The blocker still has not cleared.

### Fresh evidence

From `npx vercel env pull --yes --environment=production .env.production.autopilot-check` on 2026-04-10:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` still resolves to a quoted `pk_test_...` value
- `CLERK_SECRET_KEY` still resolves to a quoted `sk_test_...` value

From `curl -I -L --max-redirs 10 https://cc-andreas-nordenadlers-projects.vercel.app/account` on 2026-04-10:

- `HTTP/2 404`
- `x-clerk-auth-reason: protect-rewrite, dev-browser-missing`
- `x-clerk-auth-status: signed-out`
- `x-matched-path: /404`
- `x-vercel-cache: HIT`

### Current blocker verdict

No production Clerk cutover is visible yet, so the post-cutover `/account` acceptance check remains blocked.

## Verification note

Artifact updated and verified locally on 2026-04-10 with `test -f docs/CLERK_ENV_CHECK_2026-04-10.md`.
