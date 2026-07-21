# SQC Web Owned Custom Completed Result Parity — 2026-07-21

## Reference and reconciliation

- Sole reference: shipped Android `apps/mobile/app.json` version `0.1.338`, Android versionCode `338`.
- Android runtime evidence: `apps/mobile/App.tsx` reachable custom detail dispatcher and `CustomSideQuestDetailModal` at lines 8564 and 8690–8793. Completed owned quests show completion state/time and `View result`; they do not offer a restart action.
- Exhaustive screen/state/action manifest: `docs/FULL_WEB_ANDROID_PARITY_MATRIX_2026-07-13.md` on open audit PR #27 (`audit/full-web-app-parity`). It is source-inspection evidence and explicitly lacks matched authenticated captures.
- Reconciled `origin/main` `4b383fe1a43614e8a83b38618b161445143aab1c`, open PRs #2, #27, and #84 before selection. PR #84 already closes owned-custom Multiplayer selection; no open or merged change closes completed-result navigation.
- Production source at run start: `4b383fe1a43614e8a83b38618b161445143aab1c`, aligned with `origin/main` and healthy at `https://sidequestchess.com`.

## DONE

- The authenticated owned Custom Side Quest detail now classifies completion from server-loaded account metadata.
- It selects the latest passed exact-quest receipt even if a later check failed, creates the existing signed public proof URL server-side, shows the saved completion date, and exposes `View result`.
- Completed legacy records without retained game details still open a truthful completion receipt, matching Android's always-reachable `View result`; the receipt does not invent provider, game, move, or timestamp data and never regresses to `Start this Side Quest`.
- Custom proof URLs no longer serialize account display identity. In particular, a Clerk email fallback cannot leak into the decodable public proof token for a private owned quest.
- Draft, archived, ready, active, active exact-game submission, and owner-management behavior remains unchanged.

## VERIFIED

- Strict vertical RED/GREEN tests cover completed result rendering, legacy receipts without game details, latest-passed selection after a later failed attempt, and exclusion of supplied account email from custom proof tokens.
- The production client component is rendered directly in tests. The production server route derives identity from Clerk and passes only server-derived completion/receipt props; no client identity or owner field was added.
- A fresh independent review found the legacy-result and proof-token privacy defects; both were reproduced test-first and fixed narrowly. A new exact-HEAD review is required after commit before this PR can pass its code-review gate.
- Android matched-state source evidence is recorded above. No fabricated user, quest, progress, or receipt data is used in runtime claims.

## NEXT

- After this slice clears its unavailable authenticated visual gate, select the next still-open reachable v338 functional/data gap from the reconciled matrix.

## NEEDS USER INPUT

- A safe disposable non-production authenticated browser identity/session is still unavailable. Therefore matched Android-v338 versus web screenshots for the changed completed owner state cannot be captured, and this slice must remain unmerged/unreleased under the fail-closed gate.
