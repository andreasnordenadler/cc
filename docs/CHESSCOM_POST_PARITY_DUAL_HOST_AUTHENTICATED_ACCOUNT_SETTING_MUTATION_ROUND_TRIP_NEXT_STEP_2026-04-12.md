# Chess.com Post-Parity Dual-Host Authenticated Account-Setting Mutation Round-Trip Next Step, 2026-04-12

Date: 2026-04-12
Owner: Sam

## Decision

The smallest next post-parity proof step is one fresh same-run signed-in dual-host `/account` round-trip proof that submits one new narrow Chess.com username and then reloads `/account` on both hosts.

## Why this is the tightest next extension

The current proof chain already covers:

- signed-in `/account` parity on both hosts
- the full signed-in `/challenges` plus eleven-route challenge-detail parity chain on both hosts
- the full authenticated submission-mutation bundle across every shipped challenge-detail route on both hosts
- one fresh same-run dual-host `/account` Chess.com username-setting mutation proof with matching immediate post-submit state on both hosts
- one fresh same-run dual-host `/account` persistence recheck showing both hosts converged to the same post-reload fallback state for the previously submitted username

That latest persistence smoke narrowed the remaining question even further. It showed that both hosts converge to the same blank-input plus `Chess.com: not set yet` fallback after reload, but it did not yet prove the full submit-then-reload round trip for one fresh username inside one shared proof window. The tightest remaining confidence extension is therefore a single fresh round-trip proof on `/account`, not broader settings coverage, backend debugging, or another challenge-route sweep.

## Exact proposed next proof

Record one fresh same-run dual-host authenticated-browser account-setting mutation round-trip parity check that:

- opens signed-in `/account` on the canonical host and active deployment host
- uses one fresh narrow Chess.com username value that has not been used in the prior proof chain
- captures the immediate post-submit state on both hosts after saving that value
- reloads or revisits both signed-in `/account` pages during the same shared proof window
- captures the post-reload state on both hosts
- confirms both hosts render the same immediate post-submit state and the same post-reload state for that fresh username

## Reused context

Reuse the current:

- signed-in Google Chrome session on the Mac mini
- canonical host `https://cc-andreas-nordenadlers-projects.vercel.app`
- active deployment host `https://cc-taupe-kappa.vercel.app`
- authenticated `/account` mutation proof chain from `docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_ACCOUNT_SETTING_MUTATION_SMOKE_2026-04-12.md`
- authenticated `/account` persistence proof chain from `docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_ACCOUNT_SETTING_MUTATION_PERSISTENCE_SMOKE_2026-04-12.md`

## Explicit deferrals

This next step intentionally defers:

- broader account-settings coverage beyond the Chess.com username field
- backend fixes or deeper persistence debugging
- deployment work
- any fresh challenge-detail sweeps
- any new mutation families outside `/account`

## Why this stays minimal and reviewable

It keeps scope on one already-proven signed-in route, adds only one fresh narrow username value, and asks one concise round-trip question: do both hosts behave the same immediately after submit and again after reload?