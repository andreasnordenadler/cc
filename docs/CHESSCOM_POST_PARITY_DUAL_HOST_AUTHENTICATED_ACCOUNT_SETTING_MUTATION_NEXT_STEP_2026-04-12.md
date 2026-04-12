# Chess.com Post-Parity Dual-Host Authenticated Account-Setting Mutation Next Step, 2026-04-12

Date: 2026-04-12
Owner: Sam

## Decision

The smallest next post-parity proof step is one fresh same-run signed-in dual-host account-setting mutation proof on `/account` that stores a Chess.com username on both hosts and compares the immediate post-submit state.

## Why this is the tightest next extension

The current proof chain already covers:

- signed-in `/account` parity on both hosts
- signed-in `/challenges` parity on both hosts
- all eleven shipped signed-in `/challenges/[id]` routes on both hosts
- the full authenticated submission-mutation bundle across every shipped challenge-detail route on both hosts

That full-catalog bundle ended with matching signed-in `/account` evidence showing `Chess.com: not set yet` and repeated recent-attempt rows saying verification cannot finish until a Chess.com username is stored. Because the remaining visible blocker sits on `/account`, the narrowest confidence extension is now an authenticated account-setting mutation on `/account` rather than another challenge-detail mutation sweep.

## Exact proposed next proof

Record one fresh same-run dual-host authenticated-browser account-setting mutation parity check that:

- opens signed-in `/account` on the canonical host and active deployment host
- enters the same narrow Chess.com username value on both hosts
- submits the same account-setting mutation on both hosts during one shared proof window
- captures the immediate post-submit state on both hosts
- confirms both hosts accept and render the same stored-username outcome or the same immediate error outcome

## Reused context

Reuse the current:

- signed-in Google Chrome session on the Mac mini
- canonical host `https://cc-andreas-nordenadlers-projects.vercel.app`
- active deployment host `https://cc-taupe-kappa.vercel.app`
- authenticated `/account` plus `/challenges` plus eleven-route challenge-detail proof chain
- latest authenticated full-catalog submission-mutation bundle evidence showing the unresolved `Chess.com: not set yet` account state

## Explicit deferrals

This next step intentionally defers:

- broader account-settings coverage beyond the Chess.com username field
- another full-catalog challenge-detail mutation sweep
- verifier rewrites or backend fixes
- deployment work
- any non-Chess.com product mutations

## Why this stays minimal and reviewable

It changes only one signed-in surface, tests one narrow stored-value mutation, and directly targets the only user-visible account-state gap repeatedly surfaced by the latest authenticated mutation bundle.
