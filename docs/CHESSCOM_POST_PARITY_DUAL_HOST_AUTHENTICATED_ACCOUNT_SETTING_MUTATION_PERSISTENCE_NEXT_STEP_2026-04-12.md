# Chess.com Post-Parity Dual-Host Authenticated Account-Setting Mutation Persistence Next Step, 2026-04-12

Date: 2026-04-12
Owner: Sam

## Decision

The smallest next post-parity proof step is one fresh same-run signed-in dual-host `/account` persistence recheck for the already-submitted narrow Chess.com username mutation.

## Why this is the tightest next extension

The current proof chain already covers:

- signed-in `/account` parity on both hosts
- the full signed-in `/challenges` plus eleven-route challenge-detail parity chain on both hosts
- the full authenticated submission-mutation bundle across every shipped challenge-detail route on both hosts
- one fresh same-run dual-host `/account` Chess.com username-setting mutation proof with matching immediate post-submit state on both hosts

That latest `/account` mutation smoke proved both hosts accepted the same Chess.com username submission and immediately rendered the same post-submit state, but it intentionally stopped at the immediate post-submit window. The tightest remaining confidence extension is therefore a narrow persistence recheck on `/account`, not a broader settings sweep or another challenge-detail run.

## Exact proposed next proof

Record one fresh same-run dual-host authenticated-browser account-setting mutation persistence parity check that:

- opens signed-in `/account` on the canonical host and active deployment host
- reuses the exact Chess.com username value `and72norcc193421`
- reloads or revisits both signed-in `/account` pages during one shared proof window after the completed mutation run
- captures the rendered saved-value state on both hosts
- confirms both hosts still show the same persisted Chess.com username value or the same persisted fallback state after reload

## Reused context

Reuse the current:

- signed-in Google Chrome session on the Mac mini
- canonical host `https://cc-andreas-nordenadlers-projects.vercel.app`
- active deployment host `https://cc-taupe-kappa.vercel.app`
- authenticated `/account` mutation proof chain from `docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_ACCOUNT_SETTING_MUTATION_SMOKE_2026-04-12.md`
- narrow Chess.com username value `and72norcc193421`

## Explicit deferrals

This next step intentionally defers:

- broader account-settings coverage beyond the Chess.com username field
- backend fixes or deeper persistence debugging
- deployment work
- any fresh challenge-detail sweeps
- any new mutation families outside `/account`

## Why this stays minimal and reviewable

It touches only one already-proven signed-in surface, reuses one existing narrow value, and asks only whether the same saved `/account` state survives reload on both hosts.