# Chess.com Post-Parity Dual-Host Authenticated Account-Setting Mutation Round-Trip Repeatability Next Step, 2026-04-12

Date: 2026-04-12
Owner: Sam

## Decision

The smallest next post-parity proof step is one fresh same-run signed-in dual-host `/account` repeat round-trip proof that submits one new narrow Chess.com username and then reloads `/account` on both hosts again.

## Why this is the tightest next extension

The current proof chain already covers:

- signed-in `/account` parity on both hosts
- the full signed-in `/challenges` plus eleven-route challenge-detail parity chain on both hosts
- the full authenticated submission-mutation bundle across every shipped challenge-detail route on both hosts
- one fresh same-run dual-host `/account` Chess.com username-setting mutation proof with matching immediate post-submit state on both hosts
- one fresh same-run dual-host `/account` persistence recheck showing both hosts converged to the same post-reload fallback state for the previously submitted username
- one fresh same-run dual-host `/account` round-trip proof showing both hosts matched immediately after submit and again after reload for the same new username

That latest round-trip smoke removed the remaining one-run ambiguity. The tightest confidence extension is now not broader settings coverage or backend debugging, but one additional repeat run with a brand new narrow Chess.com username inside one shared proof window. If that second run matches again, the current `/account` round-trip parity claim becomes meaningfully stronger without widening scope.

## Exact proposed next proof

Record one fresh same-run dual-host authenticated-browser account-setting mutation round-trip repeatability parity check that:

- opens signed-in `/account` on the canonical host and active deployment host
- uses one fresh narrow Chess.com username value that has not been used in the prior proof chain
- captures the immediate post-submit state on both hosts after saving that value
- reloads or revisits both signed-in `/account` pages during the same shared proof window
- captures the post-reload state on both hosts
- confirms both hosts again render the same immediate post-submit state and the same post-reload state for that fresh repeat-run username

## Reused context

Reuse the current:

- signed-in Google Chrome session on the Mac mini
- canonical host `https://cc-andreas-nordenadlers-projects.vercel.app`
- active deployment host `https://cc-taupe-kappa.vercel.app`
- authenticated `/account` mutation proof chain from `docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_ACCOUNT_SETTING_MUTATION_SMOKE_2026-04-12.md`
- authenticated `/account` persistence proof chain from `docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_ACCOUNT_SETTING_MUTATION_PERSISTENCE_SMOKE_2026-04-12.md`
- authenticated `/account` round-trip proof chain from `docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_ACCOUNT_SETTING_MUTATION_ROUND_TRIP_SMOKE_2026-04-12.md`

## Explicit deferrals

This next step intentionally defers:

- broader account-settings coverage beyond the Chess.com username field
- backend fixes or deeper persistence debugging
- deployment work
- any fresh challenge-detail sweeps
- any mutation families outside `/account`

## Why this stays minimal and reviewable

It keeps scope on one already-proven signed-in route, adds only one fresh narrow username value, and asks one concise repeatability question: if the same submit-then-reload round trip is repeated once more, do both hosts still behave the same immediately after submit and again after reload?