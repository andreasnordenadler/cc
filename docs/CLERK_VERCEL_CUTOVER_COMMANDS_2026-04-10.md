# CC Clerk Vercel Cutover Commands

Date: 2026-04-10
Prepared by: Sam
Target project: `cc`

## Use this only when the real live Clerk keys are ready

Replace the placeholders below with the intended live Clerk values, then run the commands from the repo root.

```bash
cd /Users/sam/.openclaw/workspace/cc

vercel env rm NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production --yes
vercel env rm CLERK_SECRET_KEY production --yes

printf '%s' 'pk_live_REPLACE_ME' | vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
printf '%s' 'sk_live_REPLACE_ME' | vercel env add CLERK_SECRET_KEY production

vercel --prod --yes
```

## Immediate follow-up

After the deploy finishes, run the smoke-test pack in:

- `docs/CLERK_POST_CUTOVER_SMOKE_2026-04-10.md`

## Expected success signal

- a fresh `vercel env pull --environment=production` shows `pk_live_...` and `sk_live_...`
- `curl -I -L --max-redirs 10 https://cc-andreas-nordenadlers-projects.vercel.app/account` no longer returns the current Clerk protect-rewrite 404

## Current reason this exists

As of 2026-04-10 16:40 Europe/Stockholm, the active production env still resolves to Clerk test keys and live `/account` still returns `HTTP/2 404` with `x-clerk-auth-reason: protect-rewrite, dev-browser-missing`.
