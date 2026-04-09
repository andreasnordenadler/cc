# CC Roadmap

Last updated: 2026-04-09 22:03 Europe/Stockholm
Owner: Sam
Status: active

## Mission

Turn `cc` into an actively advancing autonomous product lane with proof-bearing execution.

## STRICT ACTIVE QUEUE

Execution canon:
- execute exactly the top unchecked item
- keep scope tight
- mark items done only with proof
- after closure, start the next item immediately or record a blocker

- [x] Audit the current CC app surface and routing only; write a concise baseline in `cc/docs/EXECUTIVE_SUMMARY_2026-04-09.md`.
  - estimate: 1 focused run
  - Acceptance: artifact names current routes/components and the most important product gap visible from the baseline.
  - Verification for completion: committed artifact exists at the named path.
  - Proof: `docs/EXECUTIVE_SUMMARY_2026-04-09.md` created and verified locally on 2026-04-09 (`test -f docs/EXECUTIVE_SUMMARY_2026-04-09.md`).
- [x] Audit auth and deployment assumptions only; append the results and open risks to `cc/docs/EXECUTIVE_SUMMARY_2026-04-09.md`.
  - estimate: 1 focused run
  - Acceptance: Clerk usage, deployment path, and any blockers/unknowns are explicitly stated without mixing them into a broader product rewrite.
  - Verification for completion: committed artifact update + relevant local verification note.
  - Proof: `docs/EXECUTIVE_SUMMARY_2026-04-09.md` appended with auth/deploy audit and verified locally on 2026-04-09 (`test -f docs/EXECUTIVE_SUMMARY_2026-04-09.md`).
- [x] Define the first concrete product direction and minimum shippable v0 scope in `cc/docs/V0_SCOPE_2026-04-09.md`.
  - estimate: 1 focused run
  - Acceptance: artifact states target user, first user promise, in-scope v0 loop, and explicit out-of-scope items.
  - Verification for completion: committed artifact exists at the named path.
  - Proof: `docs/V0_SCOPE_2026-04-09.md` created and verified locally on 2026-04-09 (`test -f docs/V0_SCOPE_2026-04-09.md`).
- [x] Implement the single highest-leverage proof-bearing improvement from the approved v0 scope.
  - estimate: 1 focused run
  - Acceptance: one reviewable improvement lands with relevant checks and proof matched to the work type.
  - Verification for completion: commit + relevant verification (+ deploy/live check when applicable).
  - Proof: shipped the missing v0 route loop with `src/app/account/page.tsx`, `src/app/challenges/page.tsx`, `src/app/challenges/[id]/page.tsx`, shared metadata helpers in `src/lib/user-metadata.ts`, and server actions in `src/app/actions.ts`; verified locally on 2026-04-09 with `pnpm lint` and `pnpm build`.
- [x] Add finished-game submission on the challenge detail route with a pending/manual-review result placeholder.
  - estimate: 1 focused run
  - Acceptance: a signed-in user can submit a Lichess game ID from `/challenges/[id]` and see a clear stored result state such as pending/manual review.
  - Verification for completion: commit + `pnpm lint` + `pnpm build`.
  - Proof: `src/app/challenges/[id]/page.tsx`, `src/app/actions.ts`, and `src/lib/user-metadata.ts` now store and render submitted Lichess game IDs with a pending/manual-review placeholder; verified locally on 2026-04-09 with `pnpm lint` and `pnpm build`.
- [x] Persist per-user attempt/result history and surface it on `/account` and the challenge detail route.
  - estimate: 1 focused run
  - Acceptance: the signed-in user can see their latest submitted challenge attempt/result without losing the state on refresh.
  - Verification for completion: commit + `pnpm lint` + `pnpm build`.
  - Proof: persisted challenge-linked attempt history in Clerk public metadata via `src/app/actions.ts` and rendered it in `src/app/account/page.tsx` plus `src/app/challenges/[id]/page.tsx`, with helpers updated in `src/lib/user-metadata.ts`; verified locally on 2026-04-09 with `pnpm lint` and `pnpm build`.
- [ ] Verify the full CC v0 route loop on the live deployment and record the exact URL + verdict in `cc/docs/LIVE_ROUTE_CHECK_2026-04-09.md`.
  - estimate: 1 focused run
  - Acceptance: the active CC route loop is verified on the actual deployed surface, not only locally.
  - Verification for completion: committed artifact with exact live URL and route verdicts.

## Proof rule

A roadmap item counts as done only when its proof matches the work type:
- planning/review item -> artifact path + concise verification note
- repo work -> changed files + relevant local verification
- live work -> deploy + live verification
