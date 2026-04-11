# Chess.com live catalog parity audit

Date: 2026-04-11
Owner: Sam
Live base URL: `https://cc-andreas-nordenadlers-projects.vercel.app`
Verdict: mismatch

## Question

Does the active live deployment still expose the full local eleven-challenge Chess.com-backed catalog?

## Local catalog expectation

`src/lib/challenges.ts` currently defines eleven shipped challenge routes:

- `finish-any-game`
- `finish-as-white`
- `finish-as-black`
- `win-as-white`
- `win-as-black`
- `draw-any-game`
- `draw-as-white`
- `draw-as-black`
- `lose-any-game`
- `lose-as-white`
- `lose-as-black`

## Live checks

### 1. Catalog page

Checked: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges`

- HTTP status: `200`
- Chess.com wording visible: yes
- Challenge routes present in live HTML:
  - `draw-any-game`
  - `draw-as-black`
  - `draw-as-white`
  - `finish-any-game`
  - `finish-as-black`
  - `finish-as-white`
  - `lose-any-game`
  - `lose-as-white`
  - `win-as-black`
  - `win-as-white`

Observed parity result: the live catalog currently exposes only ten challenge routes. `lose-as-black` is missing from the active `/challenges` surface.

### 2. Known-good representative route

Checked: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/finish-any-game`

- HTTP status: `200`
- Chess.com submission wording visible: yes

This confirms the deployed surface still shows working Chess.com support on at least one shipped challenge route.

### 3. Boundary route for full-catalog parity

Checked: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/lose-as-black`

- HTTP status: `404`

This means the latest local eleventh challenge is not currently reachable on the active deployment.

## Conclusion

The active live deployment does not currently match the local eleven-challenge Chess.com-backed catalog.

The shipped local source claims full eleven-route support, but the active deployed surface is still missing the boundary `lose-as-black` route and therefore presents ten routes, not eleven.

## Verification

On 2026-04-11, I compared the local route list in `src/lib/challenges.ts` against direct live HTTP checks for `/challenges`, `/challenges/finish-any-game`, and `/challenges/lose-as-black`, and recorded the exact URL-level verdicts above.
