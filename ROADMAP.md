# CC Roadmap

Last updated: 2026-04-10 12:56 Europe/Stockholm
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
- [x] Verify the full CC v0 route loop on the live deployment and record the exact URL + verdict in `cc/docs/LIVE_ROUTE_CHECK_2026-04-09.md`.
  - estimate: 1 focused run
  - Acceptance: the active CC route loop is verified on the actual deployed surface, not only locally.
  - Verification for completion: committed artifact with exact live URL and route verdicts.
  - Proof: `docs/LIVE_ROUTE_CHECK_2026-04-09.md` created and verified locally on 2026-04-09 (`test -f docs/LIVE_ROUTE_CHECK_2026-04-09.md`); live check recorded exact production URL and found `/account` returning 404 while `/`, `/challenges`, and `/challenges/mate-in-one` returned 200.
- [x] Fix the live `/account` route so the signed-in account/settings step works on the production deployment.
  - estimate: 1 focused run
  - Acceptance: `/account` returns 200 on the active live deployment and supports the v0 loop instead of 404ing.
  - Verification for completion: commit + `pnpm lint` + `pnpm build` + live verification.
  - Proof: verified on 2026-04-10 that `https://cc-andreas-nordenadlers-projects.vercel.app/account` returns 200 and redirects unauthenticated users into Clerk sign-in instead of 404ing; recorded proof in `docs/ACCOUNT_ROUTE_FIX_2026-04-10.md` and re-ran `pnpm lint` plus `pnpm build`.
- [x] Re-run the CC live route check after the `/account` fix and update `cc/docs/LIVE_ROUTE_CHECK_2026-04-09.md` with the new verdict.
  - estimate: 1 focused run
  - Acceptance: the artifact records the checked live URL and confirms whether `/`, `/challenges`, `/challenges/[id]`, and `/account` all work end to end.
  - Verification for completion: committed artifact update with exact live URL and verdicts.
  - Proof: updated `docs/LIVE_ROUTE_CHECK_2026-04-09.md` on 2026-04-10 after re-checking `https://cc-andreas-nordenadlers-projects.vercel.app` with `curl -L`; `/`, `/challenges`, and `/challenges/mate-in-one` returned 200 while `/account` returned 404.
- [x] Add one clear post-submission result summary on the challenge detail route so users can understand their latest attempt state at a glance.
  - estimate: 1 focused run
  - Acceptance: after submitting a game ID, the challenge detail route shows a compact result summary with current status and latest attempt context.
  - Verification for completion: commit + `pnpm lint` + `pnpm build`.
  - Proof: added a dedicated latest-attempt summary card on `src/app/challenges/[id]/page.tsx` backed by shared attempt-summary helpers in `src/lib/user-metadata.ts`; verified locally on 2026-04-10 with `pnpm lint` and `pnpm build`.
- [x] Audit the live `/account` protection failure and record the exact Clerk/Vercel evidence in `cc/docs/ACCOUNT_PROTECTION_AUDIT_2026-04-10.md`.
  - estimate: 1 focused run
  - Acceptance: artifact captures the exact checked live URL, the observed response headers, the local route/middleware evidence, and the most likely deployment/auth mismatch causing the protected-route 404.
  - Verification for completion: committed artifact exists at the named path.
  - Proof: created `docs/ACCOUNT_PROTECTION_AUDIT_2026-04-10.md` on 2026-04-10 with the live `curl -I -L` header evidence (`x-clerk-auth-reason: protect-rewrite, dev-browser-missing`) plus local route/config findings, and verified it locally with `test -f docs/ACCOUNT_PROTECTION_AUDIT_2026-04-10.md`.
- [x] Re-check the active Vercel deployment's Clerk environment against the `/account` protection audit and record the exact mismatch or clean bill of health in `cc/docs/CLERK_ENV_CHECK_2026-04-10.md`.
  - estimate: 1 focused run
  - Acceptance: artifact states whether the active deployment is using the intended Clerk environment for the live hostname and names the exact mismatch if one exists.
  - Verification for completion: committed artifact exists at the named path with source evidence.
  - Proof: created `docs/CLERK_ENV_CHECK_2026-04-10.md` on 2026-04-10 with `.vercel/project.json`, `npx vercel env ls production`, and `npx vercel env pull --environment=production` evidence showing the active Vercel production deployment is still using `pk_test_...` and `sk_test_...` Clerk keys matching local dev/test values; verified locally with `test -f docs/CLERK_ENV_CHECK_2026-04-10.md`.
- [x] Write the exact Clerk production cutover checklist in `cc/docs/CLERK_PRODUCTION_CUTOVER_PLAN_2026-04-10.md`.
  - estimate: 1 focused run
  - Acceptance: artifact names the exact env vars to replace, the redeploy/check sequence, and the evidence Andreas must capture to safely clear the live `/account` blocker.
  - Verification for completion: committed artifact exists at the named path.
  - Proof: created `docs/CLERK_PRODUCTION_CUTOVER_PLAN_2026-04-10.md` on 2026-04-10 with the exact Vercel env vars, redeploy sequence, and required post-cutover evidence; verified locally with `test -f docs/CLERK_PRODUCTION_CUTOVER_PLAN_2026-04-10.md`.
- [x] Prepare an operator-ready Clerk production cutover checklist in `cc/docs/CLERK_CUTOVER_OPERATOR_CHECKLIST_2026-04-10.md`.
  - estimate: 1 focused run
  - Acceptance: artifact gives Andreas the shortest exact production-key replacement checklist plus the minimal proof needed to unblock the live `/account` re-check.
  - Verification for completion: committed artifact exists at the named path.
  - Proof: created `docs/CLERK_CUTOVER_OPERATOR_CHECKLIST_2026-04-10.md` on 2026-04-10 and verified it locally with `test -f docs/CLERK_CUTOVER_OPERATOR_CHECKLIST_2026-04-10.md`.
- [ ] After the Clerk keys are updated, re-check the live `/account` route and append the exact post-cutover verdict to `cc/docs/CLERK_ENV_CHECK_2026-04-10.md`.
  - estimate: 1 focused run
  - Acceptance: artifact records the checked live URL, whether Clerk still rewrites to 404, and the exact headers/verdict after cutover.
  - Verification for completion: committed artifact update with live evidence.
  - Blocked 2026-04-10 12:55 Europe/Stockholm: fresh `vercel env pull --environment=production` still resolves to quoted `pk_test_...` / `sk_test_...` Clerk keys, and `curl -I -L --max-redirs 10 https://cc-andreas-nordenadlers-projects.vercel.app/account` still returns `HTTP/2 404` with `x-clerk-auth-reason: protect-rewrite, dev-browser-missing`; see appended evidence in `docs/CLERK_ENV_CHECK_2026-04-10.md`.

## Proof rule

A roadmap item counts as done only when its proof matches the work type:
- planning/review item -> artifact path + concise verification note
- repo work -> changed files + relevant local verification
- live work -> deploy + live verification
