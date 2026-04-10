# CC Clerk Post-Cutover Smoke Test

Date: 2026-04-10
Prepared by: Sam
Target deployment: `https://cc-andreas-nordenadlers-projects.vercel.app`
Purpose: run the smallest exact proof sequence immediately after Vercel Production Clerk keys are replaced and the site is redeployed.

## Preconditions

- Vercel Production `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` has been replaced with the intended live Clerk publishable key.
- Vercel Production `CLERK_SECRET_KEY` has been replaced with the matching live Clerk secret key.
- A production redeploy for `cc` has completed.

## Exact command pack

Run from the repo root:

```bash
npx vercel env pull --yes --environment=production .vercel/.env.production.post-cutover
python - <<'PY'
from pathlib import Path
text = Path('.vercel/.env.production.post-cutover').read_text()
for key in ('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'CLERK_SECRET_KEY'):
    line = next((line for line in text.splitlines() if line.startswith(f'{key}=')), None)
    print(line if line else f'{key}=<missing>')
PY
curl -I -L --max-redirs 10 https://cc-andreas-nordenadlers-projects.vercel.app/account
```

## Expected success signals

### Environment check

The pulled production env file should show:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` no longer starts with `pk_test_`
- `CLERK_SECRET_KEY` no longer starts with `sk_test_`
- neither value points at the prior `.clerk.accounts.dev` test/development instance

### Live route check

The `/account` response should no longer show the current failure pattern:

- not `HTTP/2 404`
- not `x-matched-path: /404`
- not `x-clerk-auth-reason: protect-rewrite, dev-browser-missing`

A successful post-cutover outcome is either:

- `200` on a signed-in flow, or
- a normal Clerk sign-in/redirect response for signed-out users that is not rewritten to the Vercel 404 surface

## Failure signals to record verbatim

If the issue persists, copy the exact header lines for:

- HTTP status
- `location` if present
- `x-clerk-auth-reason` if present
- `x-clerk-auth-status` if present
- `x-matched-path` if present
- `x-vercel-cache` if present

Also record whether the pulled keys still begin with `pk_test_` and `sk_test_`.

## Where to append proof

Append the exact verdict and captured headers to:

- `docs/CLERK_ENV_CHECK_2026-04-10.md`

## Verification note

Artifact created on 2026-04-10 and intended to be verified locally with:

```bash
test -f docs/CLERK_POST_CUTOVER_SMOKE_2026-04-10.md
```