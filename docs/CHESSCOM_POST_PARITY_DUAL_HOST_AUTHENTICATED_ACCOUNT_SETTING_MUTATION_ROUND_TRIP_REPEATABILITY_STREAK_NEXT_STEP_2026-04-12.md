# Chess.com Post-Parity Dual-Host Authenticated Account-Setting Mutation Round-Trip Repeatability Streak Next Step, 2026-04-12

Date: 2026-04-12
Owner: Sam

## Decision

The smallest next post-parity proof step is one more fresh same-run signed-in dual-host `/account` round-trip repeatability recheck that submits one brand new narrow Chess.com username and reloads `/account` on both hosts, specifically to confirm a three-run streak of the same immediate post-submit state and the same post-reload fallback state.

## Why this is the tightest next extension

The current proof chain already covers:

- signed-in `/account` parity on both hosts
- one authenticated `/account` Chess.com username mutation proof
- one authenticated `/account` persistence recheck
- one authenticated `/account` round-trip proof
- one additional authenticated `/account` round-trip repeatability proof with a fresh username

That means the narrow remaining uncertainty is no longer whether the flow works once or twice in isolation, but whether the same dual-host immediate-submit plus post-reload behavior holds for one more fresh run in the same minimal scope. A third repeat run strengthens confidence in the observed blank-on-reload fallback parity without widening into broader settings coverage, backend diagnosis, or challenge-route work.

## Exact proposed next proof

Record one fresh same-run dual-host authenticated-browser account-setting mutation round-trip repeatability streak parity check that:

- opens signed-in `/account` on the canonical host and active deployment host
- uses one fresh narrow Chess.com username value not used in the prior proof chain
- captures both hosts before submit
- submits the same fresh value on both hosts
- captures both hosts immediately after submit
- reloads both signed-in `/account` pages during the same proof window
- captures both hosts after reload
- confirms both hosts again match on the immediate post-submit state and again match on the post-reload fallback state
- states whether the result extends the observed behavior to a three-run repeatability streak

## Reused context

Reuse the current:

- signed-in Google Chrome session on the Mac mini
- canonical host `https://cc-andreas-nordenadlers-projects.vercel.app`
- active deployment host `https://cc-taupe-kappa.vercel.app`
- authenticated `/account` mutation proof chain from `docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_ACCOUNT_SETTING_MUTATION_SMOKE_2026-04-12.md`
- authenticated `/account` persistence proof chain from `docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_ACCOUNT_SETTING_MUTATION_PERSISTENCE_SMOKE_2026-04-12.md`
- authenticated `/account` round-trip proof chain from `docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_ACCOUNT_SETTING_MUTATION_ROUND_TRIP_SMOKE_2026-04-12.md`
- authenticated `/account` round-trip repeatability proof chain from `docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_ACCOUNT_SETTING_MUTATION_ROUND_TRIP_REPEATABILITY_SMOKE_2026-04-12.md`

## Explicit deferrals

This next step intentionally defers:

- broader account-settings coverage beyond the Chess.com username field
- backend fixes or persistence debugging
- deployment work
- any fresh challenge-detail sweeps
- any mutation families outside `/account`

## Why this stays minimal and reviewable

It keeps scope on one already-proven signed-in route, adds only one fresh narrow username, and asks one precise confidence question: do both hosts produce the same immediate post-submit state and the same post-reload fallback state for a third fresh round-trip run in a row?
