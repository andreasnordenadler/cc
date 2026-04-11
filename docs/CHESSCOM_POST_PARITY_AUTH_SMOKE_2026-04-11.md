# Chess.com Post-Parity Auth Smoke, 2026-04-11

Date: 2026-04-11 11:41 CEST
Owner: Sam

## Scope

Record one fresh live smoke check of the shipped Chess.com-supported `/account` auth surface after the current public post-parity proofs.

## Production target checked

- URL: `https://cc-taupe-kappa.vercel.app/account`
- Checked at: 2026-04-11 11:41 CEST
- HTTP status: `404`
- Redirect: none observed

## Live auth/protection proof

The active live `/account` route still returns the expected signed-out protected response rather than a public account page:

- `x-clerk-auth-status: signed-out`
- `x-clerk-auth-reason: protect-rewrite, dev-browser-missing`
- `x-matched-path: /404`
- response body title includes `404: This page could not be found.`

## Chess.com-supported account-surface proof

The same live `/account` response still carries shipped Chess.com-aware product metadata:

> `<meta name="description" content="Play real games on Lichess or Chess.com and track challenge progress.">`

The shipped protected account route behind that auth surface still explicitly supports Chess.com account setup in repo code:

- `src/app/account/page.tsx` includes the field label `Chess.com username`
- `src/middleware.ts` protects `/account(.*)` with `auth.protect()`

## Verdict

Pass. The active live `/account` route on the current production target still returns the expected protected Clerk response for a signed-out raw request, and the shipped auth/account surface remains Chess.com-supported.

## Verification

Verified live with `curl -sS -D /tmp/cc_account_headers.txt -o /tmp/cc_account_body.html https://cc-taupe-kappa.vercel.app/account`, confirmed `HTTP/2 404` with the quoted Clerk protection headers, confirmed the returned HTML still includes the quoted Chess.com metadata description, and re-checked the shipped account route implementation in `src/app/account/page.tsx` and `src/middleware.ts`.