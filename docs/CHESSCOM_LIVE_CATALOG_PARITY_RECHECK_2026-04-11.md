# Chess.com live catalog parity recheck

Date: 2026-04-11
Owner: Sam
Based on: `docs/CHESSCOM_LIVE_CATALOG_PARITY_NEXT_STEP_2026-04-11.md`
Active live target checked: `https://cc-taupe-kappa.vercel.app`

## Verdict

Parity restored. The active live `/challenges` surface now exposes the full eleven-route catalog, and both boundary routes checked in this re-run return `200`.

## Exact checks

- `https://cc-taupe-kappa.vercel.app/challenges` -> `200`
  - extracted unique challenge routes from the live HTML: 11
  - confirmed `/challenges/lose-as-black` is present in the live catalog
- `https://cc-taupe-kappa.vercel.app/challenges/finish-any-game` -> `200`
  - confirmed live page still includes Chess.com submission wording (`Chess.com game URL`)
- `https://cc-taupe-kappa.vercel.app/challenges/lose-as-black` -> `200`
  - confirmed the previously missing live route now resolves successfully
  - confirmed live page includes Chess.com submission wording (`Chess.com game URL`)

## Live route set observed on `/challenges`

- `/challenges/draw-any-game`
- `/challenges/draw-as-black`
- `/challenges/draw-as-white`
- `/challenges/finish-any-game`
- `/challenges/finish-as-black`
- `/challenges/finish-as-white`
- `/challenges/lose-any-game`
- `/challenges/lose-as-black`
- `/challenges/lose-as-white`
- `/challenges/win-as-black`
- `/challenges/win-as-white`

## Verification

Verified locally on 2026-04-11 after production deploy by rechecking the three live URLs above and recording the resulting eleven-route parity verdict in this artifact.
