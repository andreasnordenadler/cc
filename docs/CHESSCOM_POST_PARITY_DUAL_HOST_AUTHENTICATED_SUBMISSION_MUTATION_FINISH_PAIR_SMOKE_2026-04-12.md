# Chess.com Post-Parity Dual-Host Authenticated Submission-Mutation Finish-Pair Smoke, 2026-04-12

Date: 2026-04-12
Owner: Sam

## Scope

Record one fresh same-run dual-host authenticated-browser submission-mutation parity check across the signed-in `/challenges/finish-as-white` and `/challenges/finish-as-black` surfaces on the canonical host and active deployment host.

## Hosts and exact signed-in URLs

### `/account`
- Canonical account URL: `https://cc-andreas-nordenadlers-projects.vercel.app/account`
- Active deployment account URL: `https://cc-taupe-kappa.vercel.app/account`

### `/challenges`
- Canonical list URL: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges`
- Active deployment list URL: `https://cc-taupe-kappa.vercel.app/challenges`

### Finish-pair detail URLs
- Canonical white detail URL: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/finish-as-white`
- Active white detail URL: `https://cc-taupe-kappa.vercel.app/challenges/finish-as-white`
- Canonical black detail URL: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/finish-as-black`
- Active black detail URL: `https://cc-taupe-kappa.vercel.app/challenges/finish-as-black`

## Shared proof window

- Start: `2026-04-12 11:47:22 UTC`
- End: `2026-04-12 11:48:04 UTC`
- Browser context: one signed-in Google Chrome session on the Mac mini

## Narrow submitted mutation used on both side-aware finish routes

I reused the same narrow Chess.com-shaped submission mutation on both side-aware finish pages during the same signed-in browser run.

- Mutated field: `gameId`
- Submitted value on all four route checks: `https://www.chess.com/game/live/123456789`
- Route actions on each host: press the shipped `Start this challenge` action, then submit the same `gameId` value with `Submit for review`

## Shared visible route-state change

### `/challenges/finish-as-white`

On both hosts, the page moved from the inactive surface to the same active pending-review surface during the proof window:

- before submit, both showed `Start this challenge`
- after submit, both showed `Restart this challenge`
- before submit, both still showed `This challenge is not active yet.`
- after submit, both showed `Challenge state: Pending review`
- after submit, both showed `Submitted Chess.com game saved, but no Chess.com username is stored yet. Add it in account settings so verification can finish.`
- after submit, both showed `Game https://www.chess.com/game/live/123456789 • Updated Apr 12, 11:47 AM`

### `/challenges/finish-as-black`

On both hosts, the page rendered the same mutation result during the same proof window:

- before submit, both showed `Start this challenge`
- after submit, both showed `Restart this challenge`
- before submit, both still showed `This challenge is not active yet.`
- after submit, both showed `Challenge state: Pending review`
- after submit, both showed `Submitted Chess.com game saved, but no Chess.com username is stored yet. Add it in account settings so verification can finish.`
- after submit, both showed `Game https://www.chess.com/game/live/123456789 • Updated Apr 12, 11:47 AM`

## Shared signed-in context around the finish-pair mutation

Both signed-in `/account` pages matched during the same proof window and showed:

- `Lichess: and72nor`
- `Chess.com: not set yet`
- `Continue: Finish As Black`
- `Challenge is active since Apr 12, 11:47 AM.`
- recent `Finish As Black` and `Finish As White` submission rows with the same `Submitted Chess.com game saved, but no Chess.com username is stored yet...` message

Both signed-in `/challenges` pages matched during the same proof window and showed:

- `CURRENT` as `Finish As Black`
- `Challenge is active since Apr 12, 11:47 AM.`
- `NEXT` as `Finish As White`
- the same remaining challenge catalog layout and the same completed `Finish Any Game` card

## Verdict

Pass. In one signed-in browser proof window, both `https://cc-andreas-nordenadlers-projects.vercel.app` and `https://cc-taupe-kappa.vercel.app` accepted the same narrow `gameId` submission mutation on both `/challenges/finish-as-white` and `/challenges/finish-as-black` and rendered the same post-submit authenticated pending-review state, with matching signed-in `/account` and `/challenges` context on both hosts.

## Verification

Verified on 2026-04-12 by driving the already signed-in Google Chrome session via AppleScript, capturing before and after detail-page text for both side-aware finish routes plus matching `/account` and `/challenges` context on both hosts, saving the raw capture to `tmp/submission-mutation-finish-pair-smoke.json`, and confirming the artifact exists locally with `test -f docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_SUBMISSION_MUTATION_FINISH_PAIR_SMOKE_2026-04-12.md`.
