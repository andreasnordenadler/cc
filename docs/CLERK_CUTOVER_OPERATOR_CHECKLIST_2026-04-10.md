# CC Clerk Cutover Operator Checklist

Date: 2026-04-10
Prepared by: Sam
Project: `cc`

## Purpose

Provide the shortest exact operator checklist Andreas can follow to replace the wrong Clerk production keys in Vercel and hand back proof for the blocked live `/account` re-check.

## Current blocker summary

The active production deployment still uses Clerk development/test credentials:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` starts with `pk_test_`
- `CLERK_SECRET_KEY` starts with `sk_test_`
- live `/account` returns `HTTP/2 404`
- response headers include `x-clerk-auth-reason: protect-rewrite, dev-browser-missing`

## Exact operator steps

1. Open the intended live Clerk instance for CC.
2. Copy the live values for:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
3. Open the Vercel project `cc`.
4. Go to Settings -> Environment Variables.
5. Replace the **Production** values for:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
6. Confirm the new values are live keys, not `pk_test_...` / `sk_test_...`.
7. Trigger a new production redeploy.

## Proof Andreas should capture

After the update, capture and send back these exact pieces of evidence:

1. Confirmation that Vercel Production env vars were updated.
2. The key prefixes only, showing:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` no longer starts with `pk_test_`
   - `CLERK_SECRET_KEY` no longer starts with `sk_test_`
3. Production redeploy confirmation for `cc`.
4. Optional but ideal: a screenshot or copied header output if `/account` stops returning the prior 404 pattern.

## What Sam will do immediately after cutover

Once the cutover proof exists, re-run:

- production env pull check
- live `curl -I -L https://cc-andreas-nordenadlers-projects.vercel.app/account`
- append the exact verdict to `docs/CLERK_ENV_CHECK_2026-04-10.md`

## Done condition

This checklist item is complete once this artifact exists in the repo and is verified locally.

## Verification note

Planned local verification command:

```bash
test -f docs/CLERK_CUTOVER_OPERATOR_CHECKLIST_2026-04-10.md
```
