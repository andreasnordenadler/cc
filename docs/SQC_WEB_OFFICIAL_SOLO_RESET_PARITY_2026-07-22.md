# Official Solo completed reset parity — 2026-07-22

## DONE

- Reconciled Android v338 `CompletedQuestProofCard` and the current web detail against `origin/main`, open PRs, and the 2026-07-13 parity audit.
- Restored the existing authenticated reset capability on completed Official Solo detail pages without removing share, proof, catalog, or active-run actions.
- Kept the mutation session-derived through the existing `resetCompletedChallenge` server action; the browser submits only `challengeId`.

## VERIFIED

- Strict RED/GREEN regression: `tests/official-solo-reset-reachability.test.ts` failed before route wiring and passed after it.
- The production reset component still requires confirmation and states that completion, proof receipt, and Coat of Arms unlock are removed.
- Signed-out details do not expose reset; incomplete details retain Start; active incomplete details retain Check and Deactivate.

## NEXT

- Capture the Android-v338/web matched authenticated completed-detail viewport when a safe disposable browser identity and runnable v338 device are available.

## NEEDS USER INPUT

- A safe disposable authenticated browser identity and runnable Android v338 device/emulator are required for the mandatory matched-state visual gate. Until then this slice must remain unmerged and undeployed.
