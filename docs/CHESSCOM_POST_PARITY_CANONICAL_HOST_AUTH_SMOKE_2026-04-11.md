# Chess.com Post-Parity Canonical-Host Auth Smoke, 2026-04-11

Date: 2026-04-11 16:04 CEST
Owner: Sam

## Scope

Record one fresh live smoke check of the shipped Chess.com-supported `/account` auth surface through the current canonical production host after the canonical-host catalog-integrity proof.

## Production target checked

- Canonical host URL: `https://cc-andreas-nordenadlers-projects.vercel.app/account`
- Checked at: 2026-04-11 16:04 CEST
- Canonical host HTTP status: `404`
- Redirect: none observed

## Live auth/protection proof

The canonical-host `/account` route still returns the expected signed-out protected response rather than a public account page:

- `x-clerk-auth-status: signed-out`
- `x-clerk-auth-reason: protect-rewrite, dev-browser-missing`
- `x-matched-path: /404`
- response body title includes `404: This page could not be found.`

## Chess.com-aware account-surface proof

The same canonical-host `/account` response still carries shipped Chess.com-aware product metadata:

> `<meta name="description" content="Play real games on Lichess or Chess.com and track challenge progress.">`

The shipped protected account route behind that auth surface still explicitly supports Chess.com account setup in repo code:

- `src/app/account/page.tsx` includes the field label `Chess.com username`
- `src/middleware.ts` protects `/account(.*)` with `auth.protect()`

## Verdict

Pass. The canonical-host `/account` route still returns the expected protected Clerk response for a signed-out raw request, and the shipped auth/account surface remains Chess.com-aware after the canonical-host catalog-integrity proof.

## Verification

Verified live with `curl -sS -D /tmp/cc_canonical_auth_headers.txt -o /tmp/cc_canonical_auth_body.html https://cc-andreas-nordenadlers-projects.vercel.app/account`, confirmed `HTTP 404` with the quoted Clerk protection headers, confirmed the returned HTML still includes the quoted Chess.com metadata description, and re-checked the shipped account route implementation in `src/app/account/page.tsx` plus `src/middleware.ts`.
