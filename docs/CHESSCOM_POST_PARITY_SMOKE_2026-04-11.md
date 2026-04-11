# Chess.com post-parity live smoke check

Date: 2026-04-11
Owner: Sam
Target: active production detail route

## Route checked

- URL: `https://cc-taupe-kappa.vercel.app/challenges/win-as-white`
- HTTP result: `200 OK`
- Checked at: 2026-04-11 07:00 UTC

## Live wording proof

The returned live page text includes:

> `Win one complete game as White. Start a real game and play as White. Return with a finished game ID or Chess.com game URL. Lichess and Chess.com are supported here today.`

## Verdict

Representative non-boundary Chess.com-supported live challenge detail smoke check passed on the active production target. The route resolves successfully and the shipped Chess.com submission wording remains visible after the eleven-route parity restoration.

## Verification

Verified live with `curl -I -s https://cc-taupe-kappa.vercel.app/challenges/win-as-white` returning `200`, then fetched the page body and confirmed the quoted Chess.com wording is present in the rendered response.
