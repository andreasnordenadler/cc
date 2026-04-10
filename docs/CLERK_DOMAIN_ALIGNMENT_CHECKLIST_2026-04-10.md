# CC Clerk domain and redirect alignment checklist

Date: 2026-04-10
Prepared by: Sam
Target app: `cc`
Current live hostname: `https://cc-andreas-nordenadlers-projects.vercel.app`
Intended primary custom domain: `https://www.lyriclogic.ai/`

## Why this exists

The current live `/account` blocker is primarily explained by Vercel Production still using Clerk test keys. When Andreas performs the production-key cutover, he should also confirm the Clerk dashboard is aligned for both the current Vercel hostname and the intended custom domain so the next live re-check is not blocked by a second auth misconfiguration.

## Exact checklist

### 1. Confirm the Clerk instance is the intended production instance

In the Clerk dashboard, verify the instance used for the replacement keys is the live production instance, not the prior development/test instance.

Success signal:
- the replacement publishable key does not begin with `pk_test_`
- the replacement secret key does not begin with `sk_test_`

### 2. Confirm the active app domains in Clerk

In the Clerk dashboard for the production instance, verify the allowed app domains / origins include the surfaces we are actively using:

- `cc-andreas-nordenadlers-projects.vercel.app`
- `www.lyriclogic.ai`
- `lyriclogic.ai` if Andreas intends the apex domain to resolve directly

If Clerk separates frontend API, origins, or authorized parties, confirm the live app hostname is represented there too.

### 3. Confirm sign-in and sign-up redirect URLs

Verify the production instance redirect configuration allows the app to return to the CC routes after auth.

Minimum routes to allow:
- `https://cc-andreas-nordenadlers-projects.vercel.app/account`
- `https://cc-andreas-nordenadlers-projects.vercel.app/challenges`
- `https://www.lyriclogic.ai/account` once the custom domain is active
- `https://www.lyriclogic.ai/challenges` once the custom domain is active

If Clerk distinguishes between allowed redirect URLs and default redirect URLs, confirm both are sane for the live app.

### 4. Confirm Vercel env values match the same Clerk instance

After replacing Vercel Production env vars, run:

```bash
npx vercel env pull --yes --environment=production .vercel/.env.production.post-cutover
```

Confirm both pulled values point at the same intended Clerk production instance.

### 5. Redeploy before smoke testing

After the env update, trigger a production redeploy for `cc` before testing `/account`.

### 6. Run the post-cutover smoke pack

Immediately run the commands from:

- `docs/CLERK_POST_CUTOVER_SMOKE_2026-04-10.md`

Then append the exact result to:

- `docs/CLERK_ENV_CHECK_2026-04-10.md`

## What to capture as proof

Capture these exact proof points during cutover:

- screenshot or copied values showing the production Clerk instance is selected
- confirmation that the live hostname is present in Clerk domain/origin settings
- confirmation that `/account` is allowed as an auth return destination
- pulled Vercel Production env showing non-test Clerk keys
- final `curl -I -L --max-redirs 10 .../account` response headers after redeploy

## Minimal verdict rule

If the keys are corrected but `/account` still fails, treat domain/origin/redirect misalignment as the next most likely auth blocker and record the exact missing hostname or redirect setting before changing anything else.
