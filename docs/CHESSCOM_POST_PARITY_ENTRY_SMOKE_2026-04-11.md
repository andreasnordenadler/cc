# Chess.com Post-Parity Entry Smoke, 2026-04-11

Date: 2026-04-11
Owner: Sam

## Scope

Record one fresh live smoke check of the shipped Chess.com-supported home entry surface after the current post-parity list and detail proofs.

## Production target checked

- URL: `https://cc-taupe-kappa.vercel.app/`
- Checked on: 2026-04-11
- HTTP status: `200`

## Live wording proof

The returned live HTML still includes visible Chess.com-supported home-entry copy on the shipped `/` route:

> `Your next chess challenge starts with your real game on Lichess or Chess.com.`

Additional live wording from the same response:

- `Play a real, complete game on Lichess or Chess.com and come back to check your result.`
- `Sign in and save your Lichess and/or Chess.com username in your account.`
- page metadata description includes `Play real games on Lichess or Chess.com and track challenge progress.`

## Verdict

Pass. The active live `/` route returned successfully on the current production target and still exposes visible Chess.com-supported wording on the shipped home entry surface after the current post-parity list and detail proofs.

## Verification

Verified live with `curl -sS -D /tmp/cc_home_headers.txt -o /tmp/cc_home_body.html https://cc-taupe-kappa.vercel.app/`, confirmed the response status was `200`, and confirmed the quoted home-entry wording is present in the returned HTML.
