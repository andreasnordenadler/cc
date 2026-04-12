# Chess.com Post-Parity Dual-Host Authenticated Submission-Mutation Loss-Pair Smoke, 2026-04-12

Date: 2026-04-12
Owner: Sam

## Scope

Record one fresh same-run dual-host authenticated-browser submission-mutation check across the signed-in `/challenges/lose-as-black` and `/challenges/lose-as-white` surfaces on the canonical host and active deployment host.

## Hosts and exact signed-in URLs

### `/account`
- Canonical account URL: `https://cc-andreas-nordenadlers-projects.vercel.app/account`
- Active deployment account URL: `https://cc-taupe-kappa.vercel.app/account`

### `/challenges`
- Canonical list URL: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges`
- Active deployment list URL: `https://cc-taupe-kappa.vercel.app/challenges`

### Loss-pair detail URLs
- Canonical black detail URL: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/lose-as-black`
- Active black detail URL: `https://cc-taupe-kappa.vercel.app/challenges/lose-as-black`
- Canonical white detail URL: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/lose-as-white`
- Active white detail URL: `https://cc-taupe-kappa.vercel.app/challenges/lose-as-white`

## Shared proof window

- Start: `2026-04-12 13:08:41 UTC`
- End: `2026-04-12 13:09:17 UTC`
- Browser context: one signed-in Google Chrome session on the Mac mini

## Narrow submitted mutation used on both side-aware loss routes

I reused the same narrow Chess.com-shaped submission mutation on both side-aware loss pages during the same signed-in browser run.

- Mutated field: `gameId`
- Submitted value on all four route checks: `https://www.chess.com/game/live/123456789`
- Route actions on each host: press the shipped start action when present, then submit the same `gameId` value with `Submit for review`

## Observed post-submit route behavior

### `/challenges/lose-as-black`

Before submit, both hosts matched on the inactive loss-black surface.

- canonical before submit showed `Restart this challenge` with `Challenge state: Accepted`
- active before submit showed `Start this challenge` and `This challenge is not active yet.`
- immediately after submit, both hosts flipped to the same Chrome-rendered server error page:
  - `This page couldn’t load`
  - `A server error occurred. Reload to try again.`
  - `ERROR 184989137`
- after a direct reload recheck on both hosts, both returned to the same pre-submit inactive loss-black shape:
  - `Start this challenge`
  - `No attempt submitted yet`
  - `This challenge is not active yet.`

### `/challenges/lose-as-white`

Before submit, both hosts matched on the inactive loss-white surface.

- both showed `Start this challenge`
- both showed `No attempt submitted yet`
- both showed `This challenge is not active yet.`
- immediately after submit, both hosts flipped to the same Chrome-rendered server error page:
  - `This page couldn’t load`
  - `A server error occurred. Reload to try again.`
  - `ERROR 184989137`
- after a direct reload recheck on both hosts, both converged on the same advanced loss-white state:
  - `Restart this challenge`
  - `Challenge state: Accepted`
  - `No attempt submitted yet`

## Shared signed-in context around the loss-pair mutation

Both signed-in `/account` pages matched during the same proof window and showed:

- `Lichess: and72nor`
- `Chess.com: not set yet`
- `Continue: Lose As White`
- `Started Apr 12, 01:09 PM. Check your latest games after you finish one.`
- recent submission rows still dominated by the previously recorded win-pair and finish-pair pending-review entries

Both signed-in `/challenges` pages matched during the same proof window and showed:

- `CURRENT` as `Lose As White`
- `Started Apr 12, 01:09 PM. Check your latest games after you finish one.`
- `NEXT` as `Finish As White`
- the same remaining challenge catalog layout and the same completed `Finish Any Game` card

## Verdict

Mixed parity, not a clean pass. During one shared signed-in browser proof window, both hosts behaved the same for the narrow loss-pair `gameId` mutation, but the shared post-submit result was unstable: both side-aware loss routes first rendered the same server error page, then `/challenges/lose-as-white` reloaded into the same accepted state on both hosts while `/challenges/lose-as-black` reloaded back to the same inactive state on both hosts. This records dual-host parity of the current behavior, but it does not establish the intended clean authenticated pending-review loss-pair submission flow.

## Verification

Verified on 2026-04-12 by driving the already signed-in Google Chrome session via AppleScript, capturing before and after detail-page text for both side-aware loss routes plus matching `/account` and `/challenges` context on both hosts, reloading both loss-detail routes to capture the stable post-error state, saving the raw capture to `tmp/submission-mutation-loss-pair-smoke.json` plus the reload snapshots under `tmp/submission-mutation-loss-pair-smoke/`, and confirming the artifact exists locally with `test -f docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_SUBMISSION_MUTATION_LOSS_PAIR_SMOKE_2026-04-12.md`.
