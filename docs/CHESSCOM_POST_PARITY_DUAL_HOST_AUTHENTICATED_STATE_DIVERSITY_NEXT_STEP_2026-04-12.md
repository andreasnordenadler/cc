# Chess.com Post-Parity Dual-Host Authenticated State-Diversity Next Step

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

That means the remaining narrow gap is no longer route coverage. The next smallest confidence extension is to prove both hosts still agree on a tighter authenticated state mix that includes a completed challenge surface, an untouched challenge surface, and the shared account context in one same-run browser window.

## Smallest next strict-queue step

Record one fresh same-run dual-host authenticated-browser state-diversity Chess.com parity check across:
- `/account`
- `/challenges/finish-any-game`
- `/challenges/finish-as-white`

## Why this is the tightest next move

This is the smallest reviewable extension after the authenticated full-catalog proof because it:
- reuses the current signed-in browser setup and all current parity evidence
- focuses on authenticated state diversity rather than broader route discovery
- keeps the work evidence-only, with no product, schema, or deployment changes
- stays tighter than submission mutations, broader crawling, or new implementation work

## Exact deferrals

This step explicitly does not include:
- submitting new challenge attempts
- mutating account or challenge state
- broader authenticated crawling beyond the three listed URLs
- deployment changes
- UI or verifier implementation work

## Acceptance target for the follow-up artifact

The follow-up smoke artifact should:
- record the exact canonical-host and active deployment-host signed-in URLs for `/account`, `/challenges/finish-any-game`, and `/challenges/finish-as-white`
- confirm all six checks complete during one shared proof window in one signed-in browser context
- capture shared visible evidence for the completed `finish-any-game` state, the untouched `finish-as-white` state, and the shared signed-in account context on both hosts
- capture a concise dual-host authenticated state-diversity parity verdict
