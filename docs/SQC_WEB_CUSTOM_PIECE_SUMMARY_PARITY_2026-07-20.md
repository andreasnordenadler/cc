# Web Custom Piece Summary Parity — 2026-07-20

**DONE**

- Reconciled the 2026-07-13 audit against `origin/main` and merged PRs through #81; the remaining Custom builder summary defect was still present.
- Matched Android v338’s piece-rule summary semantics for all/both, exact/at-least counts, specific starting pieces, target squares, timing, and negation. Saved rules no longer collapse to a misleading generic singular piece in the builder preview.

**VERIFIED**

- Android reference: `apps/mobile/App.tsx` v338 summary contract (`buildCustomPieceRuleSummary`) and reachable Custom builder dispatcher.
- TDD: focused RED reproduced “both rooks” rendering as singular; focused unit and local real-browser GREEN cover quantity and starting-piece states.
- Matched-state evidence uses the real signed-out local-draft builder; no fabricated account or quest data.

**NEXT**

- Reconcile the latest mainline and select the next still-open functional parity gap. Terms content remains blocked on owner/legal adoption and must not be invented from the stale audit.

**NEEDS USER INPUT**

- None for this slice.
