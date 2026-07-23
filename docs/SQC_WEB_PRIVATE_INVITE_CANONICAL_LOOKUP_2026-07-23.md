# SQC Web Private Invite Canonical Lookup — 2026-07-23

## DONE

- Reconciled `origin/main` `4b383fe1a43614e8a83b38618b161445143aab1c`, open PRs #84/#27/#2, production source `6ed6faa804771a477b8b619b0169f49837fa147d`, Android v338 invite flow, and the exhaustive July 13 parity matrix.
- Fixed private invite lookup so an earlier participant replica cannot impersonate the host record used by the authenticated join path.
- The bounded Clerk scan now returns only the canonical host-owned record, rejects replica-only storage, rejects conflicting owner claims, and trusts a `totalCount` snapshot only from the first page.
- Official built-in invites, public catalog loading, ID lookup, client-supplied identity rejection, and server-derived participant identity are unchanged.

## VERIFIED

- Strict vertical RED/GREEN tests reproduced canonical-after-replica, replica-only, and malformed-late-total ordering failures before each minimum fix.
- Focused `tests/groupquests.test.ts`: 32/32 pass.
- Full repository suite: 433/433 pass.
- Lint: 0 errors and the same 4 pre-existing warnings.
- Root and mobile typechecks pass; Next.js production build passes.
- First independent review blocked the malformed late-total boundary; the issue was reproduced and fixed with a new RED/GREEN regression. Fresh final exact-diff independent review: PASS.

## NEXT

- Update draft PR #84 with the verified commit and immutable preview, then continue the highest-value still-open Android v338 parity state.

## NEEDS USER INPUT

- None for this slice. Authenticated matched-state visual evidence remains unavailable without a safe disposable non-production identity, so this route-contract fix must not be presented as matched browser screenshot proof.
