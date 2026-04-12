# Chess.com Post-Parity Dual-Host Authenticated Submission-Mutation Smoke, 2026-04-12

Date: 2026-04-12
Owner: Sam

## Scope

Record one fresh same-run dual-host authenticated-browser submission-mutation parity check on the already-active signed-in `/challenges/finish-any-game` surface across the canonical host and active deployment host.

## Hosts and exact signed-in URLs

- Canonical detail URL: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/finish-any-game`
- Active deployment detail URL: `https://cc-taupe-kappa.vercel.app/challenges/finish-any-game`
- Canonical account URL: `https://cc-andreas-nordenadlers-projects.vercel.app/account`
- Active deployment account URL: `https://cc-taupe-kappa.vercel.app/account`
- Canonical list URL: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges`
- Active deployment list URL: `https://cc-taupe-kappa.vercel.app/challenges`

## Shared proof window

- Start: `2026-04-12 10:45:35 UTC`
- End: `2026-04-12 10:45:47 UTC`
- Browser context: one signed-in Google Chrome session on the Mac mini

## Narrow mutation executed

I changed only the single submission input field on both signed-in detail pages and submitted the same Chess.com-shaped value on both hosts during the shared proof window.

- Mutated field: `gameId`
- Submitted value on both hosts: `https://www.chess.com/game/live/123456789`
- Action: fill the existing submission input, then press the shipped `Submit for review` action on `/challenges/finish-any-game`

## Shared visible before-state

Before the mutation, both signed-in hosts rendered the same key state on `/challenges/finish-any-game`:

- `Saved Lichess username: and72nor`
- `Saved Chess.com username: not set yet`
- `This challenge accepts a Lichess game ID/URL or a Chess.com game URL.`
- `Challenge state: Unable`
- `No attempt history yet for this challenge.`

## Shared visible post-mutation state

After submitting the same narrowed Chess.com-shaped value on both hosts in the same signed-in browser run, both detail pages rendered the same post-submit state:

- both remained on the exact same signed-in `/challenges/finish-any-game` route
- both changed the challenge state from `Unable` to `Accepted`
- both continued to show the same signed-in account context, same submission form, and same visible latest-attempt block wording
- both continued to show `Saved Chess.com username: not set yet`, which matches the current signed-in account configuration during this proof run

## Shared signed-in context around the mutation

Both signed-in `/account` pages matched during the same proof window and showed:

- `Lichess: and72nor`
- `Chess.com: not set yet`
- `Continue: Finish Any Game`
- `Started Apr 12, 10:45 AM. Check your latest games after you finish one.`

Both signed-in `/challenges` pages matched during the same proof window and showed:

- `CURRENT` as `Finish Any Game`
- the active-card timestamp `Started Apr 12, 10:45 AM. Check your latest games after you finish one.`
- the same completed-progress summary and the same remaining challenge catalog layout

## Verdict

Pass. In one signed-in browser proof window, both `https://cc-andreas-nordenadlers-projects.vercel.app` and `https://cc-taupe-kappa.vercel.app` accepted the same narrow `/challenges/finish-any-game` submission mutation using the same Chess.com-shaped input value and rendered the same post-mutation authenticated state, with matching account and challenge-list context on both hosts.

## Verification

Verified on 2026-04-12 by driving the already signed-in Google Chrome session via AppleScript, capturing the exact before and after detail-page text plus matching `/account` and `/challenges` context on both hosts, saving the raw capture to `tmp/submission-mutation-smoke.json`, and confirming the artifact exists locally with `test -f docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_SUBMISSION_MUTATION_SMOKE_2026-04-12.md`.
