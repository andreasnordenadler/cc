# Chess.com post-parity boundary live smoke check

Date: 2026-04-11
Owner: Sam
Target: active production boundary detail route

## Route checked

- URL: `https://cc-taupe-kappa.vercel.app/challenges/lose-as-black`
- HTTP result: `200 OK`
- Checked at: 2026-04-11 07:40 UTC

## Live wording proof

The returned live page text includes:

> `Play a real game as Black, finish it with a loss, and return with the game ID or Chess.com game URL. Lichess and Chess.com are supported here today.`

## Verdict

Boundary Chess.com-supported live challenge detail smoke check passed on the active production target. The boundary route resolves successfully and the shipped Chess.com submission wording remains visible on the live `lose-as-black` detail page after parity restoration.

## Verification

Verified live with `curl -L -s -o /tmp/cc-boundary.html -w '%{http_code}' https://cc-taupe-kappa.vercel.app/challenges/lose-as-black` returning `200`, then inspected the fetched body and confirmed the quoted Chess.com wording is present in the rendered response.
