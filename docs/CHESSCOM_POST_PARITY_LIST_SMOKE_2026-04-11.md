# Chess.com Post-Parity List Smoke, 2026-04-11

Date: 2026-04-11 10:20 CEST
Owner: Sam

## Scope

Record one fresh live smoke check of the shipped Chess.com-supported `/challenges` list surface after the representative and boundary detail proofs.

## Production target checked

- URL: `https://cc-taupe-kappa.vercel.app/challenges`
- Checked at: 2026-04-11 10:20 CEST
- HTTP status: `200`

## Live wording proof

The returned live HTML still includes Chess.com-supported list copy on the shipped challenge list route:

> `Start with one simple run, then come back with a Lichess game ID or Chess.com game URL.`

Additional live route evidence from the same response:

- `/challenges/win-as-white` present in the response body
- `/challenges/lose-as-black` present in the response body
- page metadata description includes `Play real games on Lichess or Chess.com and track challenge progress.`

## Verdict

Pass. The active live `/challenges` route returned successfully on the current production target and still exposes visible Chess.com-supported wording on the shipped challenge list after the representative and boundary detail post-parity proofs.
