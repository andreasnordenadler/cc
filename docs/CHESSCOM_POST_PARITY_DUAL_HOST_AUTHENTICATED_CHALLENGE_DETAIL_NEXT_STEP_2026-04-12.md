# Chess.com Post-Parity Dual-Host Authenticated Challenge Detail Next Step

Date: 2026-04-12

## Context reused

The current proof chain already establishes all of the following:

- same-run dual-host parity across `/challenges`, all eleven shipped `/challenges/[id]` routes, and signed-out `/account`
- a fresh signed-in dual-host `/account` parity pass on both the canonical host and the active deployment host

That means the remaining unproven authenticated slice is no longer account access itself, but whether one representative signed-in challenge detail surface still matches across both hosts when viewed from the same authenticated browser context.

## Smallest next step

Record one fresh dual-host authenticated-browser representative challenge-detail parity proof focused only on `/challenges/finish-any-game` on both hosts.

## Why this is the tightest remaining confidence extension

`/challenges/finish-any-game` is the narrowest useful authenticated follow-up because it extends the current dual-host proof chain from signed-in account state into one real signed-in challenge surface without widening into submission mutations, broad authenticated crawling, or per-route authenticated detail sweeps.

It is smaller than checking multiple challenge pages, smaller than testing form submission, and more product-representative than repeating `/account` again.

## Required evidence

The follow-up artifact should:

- record the exact canonical-host and active deployment-host `/challenges/finish-any-game` URLs checked while signed in
- state the proof window and browser context used for both checks
- confirm both hosts render the same signed-in representative challenge detail surface
- capture concise shared visible evidence such as the challenge title, Chess.com-supported submission wording, and any matching signed-in navigation or attempt-summary context
- end with a clear dual-host authenticated representative-detail parity verdict

## Explicit deferrals

This next step explicitly does not require:

- challenge submission mutations
- broader authenticated detail crawling
- account-setting changes
- deployment work

## Verification

Verified locally on 2026-04-12 with `test -f docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_CHALLENGE_DETAIL_NEXT_STEP_2026-04-12.md`.
