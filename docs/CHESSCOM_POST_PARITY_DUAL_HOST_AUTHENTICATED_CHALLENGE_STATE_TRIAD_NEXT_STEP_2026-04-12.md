# Chess.com Post-Parity Dual-Host Authenticated Challenge-State-Triad Next Step

Date: 2026-04-12
Owner: Sam
Status: proposed

## Current proof chain

The current authenticated dual-host proof chain already covers:
- signed-in `/account` parity on the canonical host and active deployment host
- signed-in representative challenge-detail parity on `/challenges/finish-any-game`
- signed-in boundary challenge-detail parity on `/challenges/lose-as-black`
- one same-run signed-in mini-bundle parity proof across `/account`, `/challenges/finish-any-game`, and `/challenges/lose-as-black`
- one same-run signed-in full-catalog parity proof across `/account`, `/challenges`, and all eleven shipped `/challenges/[id]` routes
- one same-run signed-in state-diversity parity proof across `/account`, `/challenges/finish-any-game`, and `/challenges/finish-as-white`

That means the next narrow gap is no longer route coverage or basic authenticated state diversity. The smallest remaining confidence extension is to prove both hosts still agree on a challenge-only triad that spans a completed surface, an untouched side-aware surface, and the boundary loss-specific surface in one same-run signed-in browser window.

## Smallest next strict-queue step

Record one fresh same-run dual-host authenticated-browser challenge-state-triad Chess.com parity check across:
- `/challenges/finish-any-game`
- `/challenges/finish-as-white`
- `/challenges/lose-as-black`

## Why this is the tightest next move

This is the smallest reviewable extension after the authenticated state-diversity proof because it:
- reuses the current signed-in browser setup and current dual-host parity evidence
- focuses on challenge-state diversity without expanding back into account or catalog coverage already proven
- keeps the work evidence-only, with no product, schema, or deployment changes
- stays tighter than submission mutations, broader authenticated crawling, or implementation work

## Exact deferrals

This step explicitly does not include:
- submitting new challenge attempts
- mutating account or challenge state
- broader authenticated crawling beyond the three listed URLs
- deployment changes
- UI or verifier implementation work

## Acceptance target for the follow-up artifact

The follow-up smoke artifact should:
- record the exact canonical-host and active deployment-host signed-in URLs for `/challenges/finish-any-game`, `/challenges/finish-as-white`, and `/challenges/lose-as-black`
- confirm all six checks complete during one shared proof window in one signed-in browser context
- capture shared visible evidence for the completed `finish-any-game` state, the untouched `finish-as-white` state, and the boundary `lose-as-black` state on both hosts
- capture a concise dual-host authenticated challenge-state-triad parity verdict
