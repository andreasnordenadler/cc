# Chess.com Post-Parity Dual-Host Authenticated Full-Catalog Detail Sweep Next Step

Date: 2026-04-12
Owner: Sam
Status: proposed

## Current proof chain

The current authenticated dual-host proof chain already covers:
- signed-in `/account` parity on the canonical host and active deployment host
- signed-in representative challenge-detail parity on `/challenges/finish-any-game`
- signed-in boundary challenge-detail parity on `/challenges/lose-as-black`
- one same-run signed-in mini-bundle parity proof across `/account`, `/challenges/finish-any-game`, and `/challenges/lose-as-black`

That means the remaining confidence gap is no longer whether authenticated parity exists on representative surfaces. The remaining narrow gap is whether the full shipped challenge catalog still holds together in one authenticated same-run sweep on both hosts.

## Smallest next strict-queue step

Record one fresh same-run dual-host authenticated-browser full-catalog detail-sweep Chess.com parity check across:
- `/account`
- `/challenges`
- all eleven shipped `/challenges/[id]` routes

## Why this is the tightest next move

This is the smallest reviewable extension after the authenticated mini-bundle proof because it:
- reuses the existing signed-in browser setup and current dual-host proof chain
- upgrades confidence from representative authenticated parity to authenticated full-catalog parity
- keeps the work evidence-only, with no product, schema, or deployment changes
- stays tighter than any submission mutation, broader authenticated crawling, or implementation work

## Exact deferrals

This step explicitly does not include:
- submitting new challenge attempts
- mutating account or challenge state
- broader authenticated crawling outside `/account`, `/challenges`, and the eleven shipped detail routes
- deployment changes
- UI or verifier implementation work

## Acceptance target for the follow-up artifact

The follow-up smoke artifact should:
- record the exact canonical-host and active deployment-host signed-in URLs for `/account`, `/challenges`, and all eleven shipped `/challenges/[id]` routes
- confirm all twenty-six checks complete during one shared proof window in one signed-in browser context
- confirm both `/challenges` surfaces expose the same full eleven-route catalog during that same run
- capture concise shared visible evidence supporting a dual-host authenticated full-catalog detail-sweep parity verdict
