# Chess.com Post-Parity Dual-Host Authenticated Full-Catalog Submission-Mutation Bundle Smoke, 2026-04-12

Date: 2026-04-12
Owner: Sam

## Scope

Record one fresh same-run dual-host authenticated-browser full-catalog submission-mutation parity check across the signed-in `/account`, `/challenges`, and all eleven shipped `/challenges/[id]` surfaces on the canonical host and active deployment host.

## Hosts and exact signed-in URLs

### `/account`
- Canonical account URL: `https://cc-andreas-nordenadlers-projects.vercel.app/account`
- Active deployment account URL: `https://cc-taupe-kappa.vercel.app/account`

### `/challenges`
- Canonical list URL: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges`
- Active deployment list URL: `https://cc-taupe-kappa.vercel.app/challenges`

### Full shipped challenge-detail catalog
- Canonical finish-any-game URL: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/finish-any-game`
- Active finish-any-game URL: `https://cc-taupe-kappa.vercel.app/challenges/finish-any-game`
- Canonical finish-as-white URL: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/finish-as-white`
- Active finish-as-white URL: `https://cc-taupe-kappa.vercel.app/challenges/finish-as-white`
- Canonical finish-as-black URL: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/finish-as-black`
- Active finish-as-black URL: `https://cc-taupe-kappa.vercel.app/challenges/finish-as-black`
- Canonical lose-any-game URL: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/lose-any-game`
- Active lose-any-game URL: `https://cc-taupe-kappa.vercel.app/challenges/lose-any-game`
- Canonical lose-as-black URL: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/lose-as-black`
- Active lose-as-black URL: `https://cc-taupe-kappa.vercel.app/challenges/lose-as-black`
- Canonical lose-as-white URL: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/lose-as-white`
- Active lose-as-white URL: `https://cc-taupe-kappa.vercel.app/challenges/lose-as-white`
- Canonical draw-any-game URL: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/draw-any-game`
- Active draw-any-game URL: `https://cc-taupe-kappa.vercel.app/challenges/draw-any-game`
- Canonical draw-as-black URL: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/draw-as-black`
- Active draw-as-black URL: `https://cc-taupe-kappa.vercel.app/challenges/draw-as-black`
- Canonical draw-as-white URL: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/draw-as-white`
- Active draw-as-white URL: `https://cc-taupe-kappa.vercel.app/challenges/draw-as-white`
- Canonical win-as-white URL: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/win-as-white`
- Active win-as-white URL: `https://cc-taupe-kappa.vercel.app/challenges/win-as-white`
- Canonical win-as-black URL: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/win-as-black`
- Active win-as-black URL: `https://cc-taupe-kappa.vercel.app/challenges/win-as-black`

## Shared proof window

- Start: `2026-04-12 16:33:57 UTC`
- End: `2026-04-12 16:36:31 UTC`
- Browser context: one signed-in Google Chrome session on the Mac mini
- Bundle size: 26 signed-in checks across 13 URLs in one shared proof window

## Reused narrow mutation across the whole bundle

I reused the same already-proven Chess.com-shaped submission mutation on every shipped challenge-detail route in the same signed-in browser run.

- Mutated field: `gameId`
- Submitted value on every detail route and host: `https://www.chess.com/game/live/123456789`
- Route action on each host: press the shipped start or restart action when present, then submit the same `gameId` value with `Submit for review`

## Shared immediate post-submit route behavior across the full eleven-route catalog

For every shipped challenge-detail route on both hosts, the immediate post-submit state matched exactly.

- `/challenges/finish-any-game`: both hosts rendered `This page couldn’t load`, `A server error occurred. Reload to try again.`, and `ERROR 184989137`
- `/challenges/finish-as-white`: both hosts rendered `This page couldn’t load`, `A server error occurred. Reload to try again.`, and `ERROR 184989137`
- `/challenges/finish-as-black`: both hosts rendered `This page couldn’t load`, `A server error occurred. Reload to try again.`, and `ERROR 184989137`
- `/challenges/lose-any-game`: both hosts rendered `This page couldn’t load`, `A server error occurred. Reload to try again.`, and `ERROR 184989137`
- `/challenges/lose-as-black`: both hosts rendered `This page couldn’t load`, `A server error occurred. Reload to try again.`, and `ERROR 184989137`
- `/challenges/lose-as-white`: both hosts rendered `This page couldn’t load`, `A server error occurred. Reload to try again.`, and `ERROR 184989137`
- `/challenges/draw-any-game`: both hosts rendered `This page couldn’t load`, `A server error occurred. Reload to try again.`, and `ERROR 184989137`
- `/challenges/draw-as-black`: both hosts rendered `This page couldn’t load`, `A server error occurred. Reload to try again.`, and `ERROR 184989137`
- `/challenges/draw-as-white`: both hosts rendered `This page couldn’t load`, `A server error occurred. Reload to try again.`, and `ERROR 184989137`
- `/challenges/win-as-white`: both hosts rendered `This page couldn’t load`, `A server error occurred. Reload to try again.`, and `ERROR 184989137`
- `/challenges/win-as-black`: both hosts rendered `This page couldn’t load`, `A server error occurred. Reload to try again.`, and `ERROR 184989137`

## Shared signed-in context around the bundle run

Both signed-in `/account` pages matched during the same proof window and showed:

- `Lichess: and72nor`
- `Chess.com: not set yet`
- `Continue: Win As Black`
- `Started Apr 12, 04:36 PM. Check your latest games after you finish one.`
- repeated recent-attempt rows with `Submitted Chess.com game saved, but no Chess.com username is stored yet. Add it in account settings so verification can finish.`

Both signed-in `/challenges` pages matched during the same proof window and showed:

- `CURRENT` as `Win As Black`
- `NEXT` as `Finish As White`
- `Started Apr 12, 04:36 PM. Check your latest games after you finish one.`
- the same visible surrounding catalog entries including `Draw Any Game`, `Lose Any Game`, and `Finish Any Game`

## Verdict

Pass for authenticated full-catalog submission-mutation bundle parity. During one shared signed-in browser proof window, both `https://cc-andreas-nordenadlers-projects.vercel.app` and `https://cc-taupe-kappa.vercel.app` accepted the same narrow `gameId` submission flow across all eleven shipped challenge-detail routes and rendered the same immediate post-submit state on every route, with matching signed-in `/account` and `/challenges` context on both hosts.

## Evidence

Primary captured evidence lives in `tmp/submission-mutation-full-catalog-bundle-smoke/`:

- `start_utc.txt`
- `end_utc.txt`
- `canonical__account.txt`
- `active__account.txt`
- `canonical__list.txt`
- `active__list.txt`
- `canonical__finish-any-game__before.txt`
- `canonical__finish-any-game__after.txt`
- `active__finish-any-game__before.txt`
- `active__finish-any-game__after.txt`
- `canonical__finish-as-white__before.txt`
- `canonical__finish-as-white__after.txt`
- `active__finish-as-white__before.txt`
- `active__finish-as-white__after.txt`
- `canonical__finish-as-black__before.txt`
- `canonical__finish-as-black__after.txt`
- `active__finish-as-black__before.txt`
- `active__finish-as-black__after.txt`
- `canonical__lose-any-game__before.txt`
- `canonical__lose-any-game__after.txt`
- `active__lose-any-game__before.txt`
- `active__lose-any-game__after.txt`
- `canonical__lose-as-black__before.txt`
- `canonical__lose-as-black__after.txt`
- `active__lose-as-black__before.txt`
- `active__lose-as-black__after.txt`
- `canonical__lose-as-white__before.txt`
- `canonical__lose-as-white__after.txt`
- `active__lose-as-white__before.txt`
- `active__lose-as-white__after.txt`
- `canonical__draw-any-game__before.txt`
- `canonical__draw-any-game__after.txt`
- `active__draw-any-game__before.txt`
- `active__draw-any-game__after.txt`
- `canonical__draw-as-black__before.txt`
- `canonical__draw-as-black__after.txt`
- `active__draw-as-black__before.txt`
- `active__draw-as-black__after.txt`
- `canonical__draw-as-white__before.txt`
- `canonical__draw-as-white__after.txt`
- `active__draw-as-white__before.txt`
- `active__draw-as-white__after.txt`
- `canonical__win-as-white__before.txt`
- `canonical__win-as-white__after.txt`
- `active__win-as-white__before.txt`
- `active__win-as-white__after.txt`
- `canonical__win-as-black__before.txt`
- `canonical__win-as-black__after.txt`
- `active__win-as-black__before.txt`
- `active__win-as-black__after.txt`
