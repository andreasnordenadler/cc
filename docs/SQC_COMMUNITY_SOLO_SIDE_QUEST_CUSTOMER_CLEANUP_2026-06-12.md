# SQC Community Solo Side Quest customer cleanup — 2026-06-12

## Scope

Customer-facing cleanup for `/challenges/community` and related Community Solo Side Quest surfaces.

## Changes

- Replaced the simplified community-created Solo Side Quest coat-of-arms pool with 48 ornate, text-free, high-detail fantasy chess coat-of-arms PNGs.
- Verified generated source art batches and rejected assets with pseudo-writing, text-like marks, or composite/simplified output before copying the accepted set into `public/badges/custom/community/community-coat-01.png` … `community-coat-48.png`.
- Kept Community Solo Side Quest badge assignment stable by quest id through `CUSTOM_SIDE_QUEST_BADGE_POOL`.
- Removed old simplified community fallback usage from community listing/detail code paths.
- Tightened customer-facing copy so visible product text says `Solo Side Quest`, `Community Solo Side Quest`, `Custom Solo Side Quest`, or `Official Solo Side Quest` instead of bare `Solo` labels.
- Removed internal/testing-flavored wording from public Community Solo Side Quest and verifier copy.

## Local verification

- `pnpm lint` passed with 0 errors; only existing warnings.
- `pnpm build` passed.
- Rendered local production page at `http://localhost:3010/challenges/community`:
  - HTTP 200.
  - 47 visible community-created Solo Side Quest cards.
  - 47/47 card images resolved to `/badges/custom/community/community-coat-XX.png`.
  - 0 old `custom-coat-knight-gold` or `/badges/custom/clean/` fallbacks.
  - 0 source-asset problems; every rendered source asset is at least 768×768 and >700KB.
  - 0 forbidden customer-facing wording matches for bare Community/Custom/Official Solo, Public Solo, lowercase solo quest, or internal/testing wording.
- Rendered every community detail page linked from the listing:
  - 47/47 detail pages checked.
  - 0 failures.
  - Each detail page used the ornate community coat pool and passed the same wording checks.

## Artifacts

- Screenshot: `artifacts/community-ornate-coats-2026-06-12/local-community-page-full.png`
- Detail verification: `artifacts/community-ornate-coats-2026-06-12/local-detail-verification.json`
- Accepted generated source list: `artifacts/community-ornate-coats-2026-06-12/pass-list.txt`
- Previous simplified community coats backup: `artifacts/community-ornate-coats-2026-06-12/old-community-coats/`

## Transparency correction

After user review, the first ornate coat pass was identified as still having opaque dark backgrounds. Corrected all 48 community coat assets to RGBA PNGs with transparent outside/background regions.

Verification added:
- 48/48 files are `RGBA`.
- 48/48 have corner alpha `0`.
- 48/48 have substantial transparent outside area.
- Contact-sheet visual QA over a warm checker background passed with no remaining opaque square/rectangular dark backgrounds.
- Replaced `community-coat-47.png` with another QA-passed ornate source after visual QA caught a lingering dark rectangle.

Artifact: `artifacts/community-transparent-fix-2026-06-12/transparent-contact-sheet-v2.png`.

## Outside-only transparency correction

The first transparency correction over-keyed dark pixels and created transparent holes inside some coat-of-arms artwork. Fixed by restoring the original ornate opaque sources, then applying a filled outside-only silhouette mask that preserves every non-background artwork pixel inside the coat.

Verification added:
- Programmatic alpha check: 48/48 files have transparent corners.
- Programmatic central-hole check: 0 assets flagged for transparent holes in the central artwork area.
- Visual contact-sheet QA over high-contrast checker: PASS, no internal transparent cutouts and no remaining opaque square/rectangular backgrounds.

Artifact: `artifacts/community-outside-only-alpha-2026-06-12/contact-sheet-outside-only.png`.
