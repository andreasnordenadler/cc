# Chess.com Post-Parity Dual-Host Authenticated Submission-Mutation Draw-Pair Smoke, 2026-04-12

Date: 2026-04-12
Owner: Sam

## Scope

Record one fresh same-run dual-host authenticated-browser submission-mutation parity check across the signed-in `/challenges/draw-as-black` and `/challenges/draw-as-white` surfaces on the canonical host and active deployment host.

## Hosts and exact signed-in URLs

### `/account`
- Canonical account URL: `https://cc-andreas-nordenadlers-projects.vercel.app/account`
- Active deployment account URL: `https://cc-taupe-kappa.vercel.app/account`

### `/challenges`
- Canonical list URL: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges`
- Active deployment list URL: `https://cc-taupe-kappa.vercel.app/challenges`

### Draw-pair detail URLs
- Canonical black detail URL: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/draw-as-black`
- Active black detail URL: `https://cc-taupe-kappa.vercel.app/challenges/draw-as-black`
- Canonical white detail URL: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/draw-as-white`
- Active white detail URL: `https://cc-taupe-kappa.vercel.app/challenges/draw-as-white`

## Shared proof window

- Start: `2026-04-12 13:52:55 UTC`
- End: `2026-04-12 13:53:28 UTC`
- Browser context: one signed-in Google Chrome session on the Mac mini

## Narrow submitted mutation used on both side-aware draw routes

I reused the same narrow Chess.com-shaped submission mutation on both side-aware draw pages during the same signed-in browser run.

- Mutated field: `gameId`
- Submitted value on all four route checks: `https://www.chess.com/game/live/123456789`
- Route actions on each host: press the shipped start action when present, then submit the same `gameId` value with `Submit for review`

## Observed post-submit route behavior

### `/challenges/draw-as-black`

Before submit, both hosts matched on the inactive draw-black surface.

- both showed `Start this challenge`
- both showed `No attempt submitted yet`
- both showed `This challenge is not active yet.`
- immediately after submit, both hosts flipped to the same Chrome-rendered server error page:
  - `This page couldn’t load`
  - `A server error occurred. Reload to try again.`
  - `ERROR 184989137`

### `/challenges/draw-as-white`

Before submit, both hosts matched on the inactive draw-white surface.

- both showed `Start this challenge`
- both showed `No attempt submitted yet`
- both showed `This challenge is not active yet.`
- immediately after submit, both hosts flipped to the same Chrome-rendered server error page:
  - `This page couldn’t load`
  - `A server error occurred. Reload to try again.`
  - `ERROR 184989137`

## Shared signed-in context around the draw-pair mutation

Both signed-in `/account` pages matched during the same proof window and showed:

- `Lichess: and72nor`
- `Chess.com: not set yet`
- `Continue: Draw As White`
- `Started Apr 12, 01:53 PM. Check your latest games after you finish one.`
- recent submission rows still dominated by the previously recorded win-pair and finish-pair pending-review entries

Both signed-in `/challenges` pages matched during the same proof window and showed:

- `CURRENT` as `Draw As White`
- `Started Apr 12, 01:53 PM. Check your latest games after you finish one.`
- `NEXT` as `Finish As White`
- the same remaining challenge catalog layout and the same completed `Finish Any Game` card

## Verdict

Pass for authenticated draw-pair submission-mutation parity. During one shared signed-in browser proof window, both `https://cc-andreas-nordenadlers-projects.vercel.app` and `https://cc-taupe-kappa.vercel.app` accepted the same narrow `gameId` submission flow across `/challenges/draw-as-black` and `/challenges/draw-as-white` and rendered the same immediate post-submit state on both side-aware draw routes: the same Chrome server-error page with `ERROR 184989137`, alongside matching signed-in `/account` and `/challenges` context.

## Evidence

Primary captured evidence lives in `tmp/submission-mutation-draw-pair-smoke/`:

- `start_utc.txt`
- `end_utc.txt`
- `canonical__account.txt`
- `active__account.txt`
- `canonical__list.txt`
- `active__list.txt`
- `canonical__draw-as-black__before.txt`
- `canonical__draw-as-black__after.txt`
- `active__draw-as-black__before.txt`
- `active__draw-as-black__after.txt`
- `canonical__draw-as-white__before.txt`
- `canonical__draw-as-white__after.txt`
- `active__draw-as-white__before.txt`
- `active__draw-as-white__after.txt`
