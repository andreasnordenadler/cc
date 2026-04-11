# Chess.com Post-Parity Catalog-Integrity Smoke, 2026-04-11

Date: 2026-04-11 13:01 CEST
Owner: Sam

## Scope

Record one fresh live smoke check of the shipped Chess.com-supported `/challenges` catalog after the current entry, list, detail, submission, and auth post-parity proofs.

## Production target checked

- URL: `https://cc-taupe-kappa.vercel.app/challenges`
- Checked at: 2026-04-11 13:01 CEST
- HTTP status: `200`

## Live catalog-integrity proof

The returned live HTML still exposes the full shipped eleven-route challenge catalog on the active production target:

- `/challenges/finish-any-game`
- `/challenges/finish-as-white`
- `/challenges/finish-as-black`
- `/challenges/win-as-white`
- `/challenges/win-as-black`
- `/challenges/draw-any-game`
- `/challenges/draw-as-white`
- `/challenges/draw-as-black`
- `/challenges/lose-any-game`
- `/challenges/lose-as-white`
- `/challenges/lose-as-black`

Additional live evidence from the same response:

- the response body still includes `Start with one simple run, then come back with a Lichess game ID or Chess.com game URL.`
- eleven unique `/challenges/<slug>` routes were present in the live HTML response body

## Verdict

Pass. The active live `/challenges` route returned successfully on the current production target and still exposes the full shipped eleven-challenge Chess.com-supported catalog after the current post-parity surface-family proofs.
