# Chess.com Post-Parity Dual-Host Authenticated Submission-Mutation Generic-Loss Smoke, 2026-04-12

Date: 2026-04-12
Owner: Sam

## Scope

Record one fresh same-run dual-host authenticated-browser submission-mutation parity check on the signed-in `/challenges/lose-any-game` surface on the canonical host and active deployment host.

## Hosts and exact signed-in URLs

### `/account`
- Canonical account URL: `https://cc-andreas-nordenadlers-projects.vercel.app/account`
- Active deployment account URL: `https://cc-taupe-kappa.vercel.app/account`

### `/challenges`
- Canonical list URL: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges`
- Active deployment list URL: `https://cc-taupe-kappa.vercel.app/challenges`

### Generic loss detail URLs
- Canonical generic loss URL: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/lose-any-game`
- Active generic loss URL: `https://cc-taupe-kappa.vercel.app/challenges/lose-any-game`

## Shared proof window

- Start: `2026-04-12 15:53:29 UTC`
- End: `2026-04-12 15:53:51 UTC`
- Browser context: one signed-in Google Chrome session on the Mac mini

## Narrow submitted mutation used on the generic loss route

I reused the same narrow Chess.com-shaped submission mutation already used for the generic finish route plus the finish-pair, win-pair, loss-pair, draw-pair, and generic-draw proofs.

- Mutated field: `gameId`
- Submitted value on both hosts: `https://www.chess.com/game/live/123456789`
- Route actions on each host: press the shipped start or restart action when present, then submit the same `gameId` value with `Submit for review`

## Observed post-submit route behavior

### Before submit

- Canonical host showed an inactive generic loss surface with:
  - `Start this challenge`
  - `No attempt submitted yet`
  - `This challenge is not active yet.`
- Active deployment host showed the same signed-in generic loss route already carrying the current run with:
  - `Restart this challenge`
  - `No attempt submitted yet`
  - `Challenge state: Accepted`

### Immediately after submit

Both hosts converged to the same Chrome-rendered server error page on the generic loss route:

- `This page couldn’t load`
- `A server error occurred. Reload to try again.`
- `ERROR 184989137`

## Shared signed-in context around the generic loss mutation

Both signed-in `/account` pages matched during the same proof window and showed:

- `Lichess: and72nor`
- `Chess.com: not set yet`
- `Continue: Lose Any Game`
- `Started Apr 12, 03:53 PM. Check your latest games after you finish one.`
- recent submission rows still dominated by the previously recorded Chess.com-backed win-pair and finish-pair entries waiting on a saved Chess.com username

Both signed-in `/challenges` pages matched during the same proof window and showed:

- `CURRENT` as `Lose Any Game`
- `Started Apr 12, 03:53 PM. Check your latest games after you finish one.`
- `NEXT` as `Finish As White`
- the same surrounding challenge catalog layout and the same single completed challenge count

## Verdict

Pass for authenticated generic-loss submission-mutation parity. During one shared signed-in browser proof window, both `https://cc-andreas-nordenadlers-projects.vercel.app` and `https://cc-taupe-kappa.vercel.app` accepted the same narrow `gameId` submission flow on `/challenges/lose-any-game` and rendered the same immediate post-submit state: the same Chrome server-error page with `ERROR 184989137`, alongside matching signed-in `/account` and `/challenges` context.

## Evidence

Primary captured evidence lives in `tmp/submission-mutation-generic-loss-smoke/`:

- `start_utc.txt`
- `end_utc.txt`
- `canonical__account.txt`
- `active__account.txt`
- `canonical__list.txt`
- `active__list.txt`
- `canonical__lose-any-game__before.txt`
- `canonical__lose-any-game__after.txt`
- `active__lose-any-game__before.txt`
- `active__lose-any-game__after.txt`
