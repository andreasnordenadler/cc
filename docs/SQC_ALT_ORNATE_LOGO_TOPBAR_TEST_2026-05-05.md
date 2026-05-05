# SQC alternate ornate logo top-bar test — 2026-05-05

## Scope

Fresh-baseline backlog item: prepare/test the alternate ornate SQC logo/top-bar treatment from `public/brand/sqc-alt-logo-topbar-test.jpg`, with transparent/cropped treatment before any final nav use.

## Changes

- Added `public/brand/sqc-alt-logo-topbar-transparent.png` as a cropped transparent PNG derived from the supplied JPEG.
- Added `/brand-test` as an internal, non-indexed visual test surface.
- The real production navigation is unchanged; the alternate logo is only shown in a fake top-bar preview and background swatches.

## Asset proof

- Source: `public/brand/sqc-alt-logo-topbar-test.jpg` — 1280 × 1022 JPEG with baked checkerboard background.
- Output: `public/brand/sqc-alt-logo-topbar-transparent.png` — 720 × 362 RGBA PNG.
- Alpha verification: `alpha_min=0`, `alpha_max=255`, transparent pixels present, opaque logo pixels present.
- Visual QA: transparent crop is usable for top-bar testing; checkerboard artifacts are mostly removed at normal viewing size. Fine flourishes may need final hand-polish if Andreas chooses this as the permanent nav logo.

## Verification

- `pnpm lint` — passed.
- `pnpm build` — passed; `/brand-test` included in the production route manifest.

## Live smoke

Pending deployment in this run.
