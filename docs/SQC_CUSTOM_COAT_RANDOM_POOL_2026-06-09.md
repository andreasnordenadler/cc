# SQC Custom Coat-of-Arms Random Pool — 2026-06-09

Andreas confirmed custom Side Quest coats should be simple random assignment rather than rule/title matching.

## Shipped direction

- Existing custom badge variants remain valid.
- Added a new generated random coat pool under `public/badges/custom/random/`.
- `chooseCustomSideQuestBadge()` now randomly selects from the full pool and the selected path is saved on quest creation, so each quest stays visually stable after creation.
- Mobile no longer collapses custom badge URLs back to the fallback crest, so synced custom quests can display their assigned random coat.

## Visual QA

Generated 17 candidates; removed obvious monogram/letter-like variants and a problematic white-background candidate. The shipped pool now combines 13 existing custom coats with 13 new generated coats for 26 random assignment options. Remaining generated candidates are no-text/no-letter coat-style assets; some are deliberately ornate but readable enough for the current UI sizes.
