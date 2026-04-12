# Chess.com Post-Parity Dual-Host Authenticated Boundary Detail Next Step

Date: 2026-04-12

## Context reused

The current proof chain already establishes all of the following:

- same-run dual-host parity across `/challenges`, all eleven shipped `/challenges/[id]` routes, and signed-out `/account`
- a fresh signed-in dual-host `/account` parity pass on both the canonical host and the active deployment host
- a fresh signed-in dual-host representative challenge-detail parity pass on `/challenges/finish-any-game`

That means the next smallest unproven authenticated slice is no longer account access or a representative signed-in detail page, but whether a boundary challenge detail route still matches across both hosts in the same authenticated browser context.

## Smallest next step

Record one fresh dual-host authenticated-browser boundary challenge-detail parity proof focused only on `/challenges/lose-as-black` on both hosts.

## Why this is the tightest remaining confidence extension

`/challenges/lose-as-black` is the tightest next authenticated follow-up because it extends the signed-in dual-host detail proof from one representative route to one boundary route without widening into a full authenticated crawl, submission mutations, or deployment work.

It is smaller than checking multiple additional detail pages, smaller than exercising form submission, and more coverage-efficient than repeating the already-proven signed-in `/account` or representative detail surface.

## Required evidence

The follow-up artifact should:

- record the exact canonical-host and active deployment-host `/challenges/lose-as-black` URLs checked while signed in
- state the proof window and browser context used for both checks
- confirm both hosts render the same signed-in boundary challenge detail surface
- capture concise shared visible evidence such as the challenge title, Chess.com-supported submission wording, and matching signed-in navigation or attempt-summary context
- end with a clear dual-host authenticated boundary-detail parity verdict

## Explicit deferrals

This next step explicitly does not require:

- challenge submission mutations
- broader authenticated detail crawling
- account-setting changes
- deployment work

## Verification

Verified locally on 2026-04-12 with `test -f docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_BOUNDARY_DETAIL_NEXT_STEP_2026-04-12.md`.
