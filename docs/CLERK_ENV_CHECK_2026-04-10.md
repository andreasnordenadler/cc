# CC Clerk Environment Check

Date: 2026-04-10
Checked by: Sam
Vercel project: `cc`
Vercel account: `andreasnordenadler-2420`
Active live hostname checked against prior audit: `https://cc-andreas-nordenadlers-projects.vercel.app/account`

## Verdict

The active Vercel deployment is still using Clerk test/dev keys for this project, but that mismatch is **not currently a full product-blocking `/account` outage**. The authenticated browser flow was re-checked successfully in Google Chrome on the Mac mini at 2026-04-10 17:09 Europe/Stockholm. The remaining problem is narrower: signed-out/non-browser requests to `/account` still surface as a Clerk-managed 404-style protected rewrite.

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

### Signed-out/raw HTTP behavior

From repeated `curl -I -L --max-redirs 10 https://cc-andreas-nordenadlers-projects.vercel.app/account` checks on 2026-04-10:

- `HTTP/2 404`
- `x-clerk-auth-reason: protect-rewrite, dev-browser-missing`
- `x-clerk-auth-status: signed-out`
- `x-matched-path: /404`

### Authenticated browser behavior

From Google Chrome on the Mac mini at 2026-04-10 17:09 Europe/Stockholm:

- exact URL: `https://cc-andreas-nordenadlers-projects.vercel.app/account`
- page title: `CC — Chess Challenge`
- visible page body included:
  - `AUTHENTICATED ACCOUNT`
  - `Current saved username: and72nor`

## Updated conclusion

The test/dev Clerk keys in Vercel production are still real configuration drift and still plausibly explain the odd signed-out/non-browser behavior. But they do **not** justify claiming that `/account` is generally broken for actual signed-in product use. The correct framing is:

- authenticated `/account` works in the real browser flow
- signed-out/non-browser protected-route behavior is still messy
- CC product progress should continue, with auth cleanup tracked as follow-up polish rather than a hard blocker

## Recommended next move

- Stop treating Clerk state as a full CC lane blocker
- Keep the cutover docs as optional cleanup material unless user-visible auth failures reappear
- If desired later, specifically normalize the signed-out `/account` path so it redirects or hands off more cleanly than the current Clerk-managed 404 response

## Verification note

Artifact updated and verified locally on 2026-04-10 with `test -f docs/CLERK_ENV_CHECK_2026-04-10.md`.
