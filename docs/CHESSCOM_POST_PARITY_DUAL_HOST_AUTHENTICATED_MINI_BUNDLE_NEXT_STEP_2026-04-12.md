# Chess.com Post-Parity Dual-Host Authenticated Mini-Bundle Next Step

Date: 2026-04-12

## Context reused

The current proof chain already establishes all of the following:

- same-run dual-host parity across `/challenges`, all eleven shipped `/challenges/[id]` routes, and signed-out `/account`
- a fresh signed-in dual-host `/account` parity pass on both the canonical host and the active deployment host
- a fresh signed-in dual-host representative challenge-detail parity pass on `/challenges/finish-any-game`
- a fresh signed-in dual-host boundary challenge-detail parity pass on `/challenges/lose-as-black`

That means the next smallest unproven authenticated slice is no longer any one individual signed-in surface, but whether the already-proven account, representative-detail, and boundary-detail surfaces still align across both hosts during one shared signed-in proof window.

## Smallest next step

Record one fresh same-run dual-host authenticated-browser mini-bundle parity proof focused only on `/account`, `/challenges/finish-any-game`, and `/challenges/lose-as-black` on both hosts.

## Why this is the tightest remaining confidence extension

This mini-bundle is the tightest next follow-up because it upgrades the current signed-in proof chain from three separate authenticated checks into one same-run bundle without widening into a full authenticated crawl, challenge submission mutations, or deployment work.

It is smaller than checking all authenticated challenge pages, smaller than exercising form submission, and more coverage-efficient than repeating any single signed-in route in isolation.

## Required evidence

The follow-up artifact should:

- record the exact canonical-host and active deployment-host signed-in URLs for `/account`, `/challenges/finish-any-game`, and `/challenges/lose-as-black`
- state the single proof window and browser context used for all six checks
- confirm all six checks completed during that same signed-in proof window
- capture concise shared visible evidence spanning account state plus representative and boundary challenge-detail state
- end with a clear dual-host authenticated mini-bundle parity verdict

## Explicit deferrals

This next step explicitly does not require:

- challenge submission mutations
- broader authenticated detail crawling
- account-setting changes
- deployment work

## Verification

Verified locally on 2026-04-12 with `test -f docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_MINI_BUNDLE_NEXT_STEP_2026-04-12.md`.
