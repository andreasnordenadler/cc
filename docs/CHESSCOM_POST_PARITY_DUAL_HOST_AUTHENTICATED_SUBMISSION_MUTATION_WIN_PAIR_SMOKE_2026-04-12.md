# Chess.com Post-Parity Dual-Host Authenticated Submission-Mutation Win-Pair Smoke, 2026-04-12

Date: 2026-04-12
Owner: Sam

## Scope

Record one fresh same-run dual-host authenticated-browser submission-mutation parity check across the signed-in `/challenges/win-as-white` and `/challenges/win-as-black` surfaces on the canonical host and active deployment host.

## Hosts and exact signed-in URLs

### `/account`
- Canonical account URL: `https://cc-andreas-nordenadlers-projects.vercel.app/account`
- Active deployment account URL: `https://cc-taupe-kappa.vercel.app/account`

### `/challenges`
- Canonical list URL: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges`
- Active deployment list URL: `https://cc-taupe-kappa.vercel.app/challenges`

### Win-pair detail URLs
- Canonical white detail URL: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/win-as-white`
- Active white detail URL: `https://cc-taupe-kappa.vercel.app/challenges/win-as-white`
- Canonical black detail URL: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/win-as-black`
- Active black detail URL: `https://cc-taupe-kappa.vercel.app/challenges/win-as-black`

## Shared proof window

- Start: `2026-04-12 12:28:19 UTC`
- End: `2026-04-12 12:29:24 UTC`
- Browser context: one signed-in Google Chrome session on the Mac mini

## Narrow submitted mutation used on both side-aware win routes

I reused the same narrow Chess.com-shaped submission mutation on both side-aware win pages during the same signed-in browser run.

- Mutated field: `gameId`
- Submitted value on all four route checks: `https://www.chess.com/game/live/123456789`
- Route actions on each host: press the shipped start action when present, then submit the same `gameId` value with `Submit for review`

## Shared visible route-state change

### `/challenges/win-as-white`

On both hosts, the page rendered the same pending-review win mutation state during the proof window:

- both showed `Restart this challenge`
- both showed `Challenge state: Pending review`
- both showed `Submitted Chess.com game saved, but no Chess.com username is stored yet. Add it in account settings so verification can finish.`
- both showed `Game https://www.chess.com/game/live/123456789 • Updated Apr 12, 12:28 PM`

### `/challenges/win-as-black`

On both hosts, the page rendered the same mutation result during the same proof window:

- before submit, canonical still showed `This challenge is not active yet.` and deployment was already on the same pending-review win surface from the immediately preceding signed-in run
- after submit, both showed `Restart this challenge`
- after submit, both showed `Challenge state: Pending review`
- after submit, both showed `Submitted Chess.com game saved, but no Chess.com username is stored yet. Add it in account settings so verification can finish.`
- both converged on the same latest attempt shape, ending with `Game https://www.chess.com/game/live/123456789 • Updated Apr 12, 12:29 PM` on the deployment host and matching fresh pending rows on the canonical host during the same proof window

## Shared signed-in context around the win-pair mutation

Both signed-in `/account` pages matched during the same proof window and showed:

- `Lichess: and72nor`
- `Chess.com: not set yet`
- `Continue: Win As Black`
- `Challenge is active since Apr 12, 12:29 PM.`
- recent `Win As Black` and `Win As White` submission rows with the same `Submitted Chess.com game saved, but no Chess.com username is stored yet...` message

Both signed-in `/challenges` pages matched during the same proof window and showed:

- `CURRENT` as `Win As Black`
- `Challenge is active since Apr 12, 12:29 PM.`
- `NEXT` as `Finish As White`
- the same remaining challenge catalog layout and the same completed `Finish Any Game` card

## Verdict

Pass. In one signed-in browser proof window, both `https://cc-andreas-nordenadlers-projects.vercel.app` and `https://cc-taupe-kappa.vercel.app` accepted the same narrow `gameId` submission mutation on both `/challenges/win-as-white` and `/challenges/win-as-black` and rendered the same post-submit authenticated pending-review win state, with matching signed-in `/account` and `/challenges` context on both hosts.

## Verification

Verified on 2026-04-12 by driving the already signed-in Google Chrome session via AppleScript, capturing before and after detail-page text for both side-aware win routes plus matching `/account` and `/challenges` context on both hosts, saving the raw capture to `tmp/submission-mutation-win-pair-smoke.json`, and confirming the artifact exists locally with `test -f docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_SUBMISSION_MUTATION_WIN_PAIR_SMOKE_2026-04-12.md`.
