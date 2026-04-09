# CC Roadmap

Last updated: 2026-04-09 18:50 Europe/Stockholm
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
- [ ] Audit auth and deployment assumptions only; append the results and open risks to `cc/docs/EXECUTIVE_SUMMARY_2026-04-09.md`.
  - estimate: 1 focused run
  - Acceptance: Clerk usage, deployment path, and any blockers/unknowns are explicitly stated without mixing them into a broader product rewrite.
  - Verification for completion: committed artifact update + relevant local verification note.
- [ ] Define the first concrete product direction and minimum shippable v0 scope in `cc/docs/V0_SCOPE_2026-04-09.md`.
  - estimate: 1 focused run
  - Acceptance: artifact states target user, first user promise, in-scope v0 loop, and explicit out-of-scope items.
  - Verification for completion: committed artifact exists at the named path.
- [ ] Implement the single highest-leverage proof-bearing improvement from the approved v0 scope.
  - estimate: 1 focused run
  - Acceptance: one reviewable improvement lands with relevant checks and proof matched to the work type.
  - Verification for completion: commit + relevant verification (+ deploy/live check when applicable).

## Proof rule

A roadmap item counts as done only when its proof matches the work type:
- planning/review item -> artifact path + concise verification note
- repo work -> changed files + relevant local verification
- live work -> deploy + live verification
