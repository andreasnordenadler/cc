# Chess.com Post-Parity Dual-Host Authenticated Account Next Step

Date: 2026-04-12

## Context reused

The current proof chain already establishes a same-run dual-host parity pass across:

- `/challenges`
- all eleven shipped `/challenges/[id]` routes
- signed-out `/account`

That latest proof confirms both hosts expose the same public Chess.com-supported catalog and the same signed-out protected-route shape during one shared proof window.

## Smallest next step

Record one fresh dual-host authenticated-browser account parity proof focused only on the signed-in `/account` experience on both hosts.

## Why this is the tightest remaining confidence extension

The public catalog and signed-out protected-route surfaces are already covered tightly. The smallest remaining unproven slice is whether the authenticated account surface still matches across the canonical host and the active deployment host.

A narrow authenticated `/account` browser proof is the next smallest useful move because it extends confidence into the signed-in path without widening into submission mutations, challenge completions, or broader browser crawling.

## Required evidence

The follow-up artifact should:

- record the exact canonical-host and active deployment-host `/account` URLs checked while signed in
- state the proof window and browser context used for both checks
- confirm both hosts render the signed-in account/settings surface rather than the signed-out protected `404` shape
- capture concise visible account-surface evidence showing the same Chess.com-aware account setup or history context on both hosts
- end with a clear dual-host authenticated-account parity verdict

## Explicit deferrals

This next step explicitly does not require:

- challenge submission mutations
- signed-in challenge detail verification
- broader authenticated route crawling
- new deployment work

## Verification

Verified locally on 2026-04-12 with `test -f docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_ACCOUNT_NEXT_STEP_2026-04-12.md`.
