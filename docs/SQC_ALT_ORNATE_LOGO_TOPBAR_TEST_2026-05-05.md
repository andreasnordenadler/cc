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

## Live deployment

- Commit: `de1b2ae` (`Add SQC alternate logo brand test`).
- Production deploy: `https://cc-57a8pvduz-andreas-nordenadlers-projects.vercel.app`.
- Aliased canonical domain: `https://sidequestchess.com`.

## Live smoke

- `https://sidequestchess.com/brand-test` — 200, contains `Alternate SQC top-bar logo treatment`, the transparent PNG path, and `Navigation-height preview`.
- `https://sidequestchess.com/brand/sqc-alt-logo-topbar-transparent.png` — 200.
- `https://sidequestchess.com/challenges` — 200.
- `https://cc-57a8pvduz-andreas-nordenadlers-projects.vercel.app/brand-test` — 200.
- Canonical homepage smoke confirmed the alternate logo asset is not present there, so the real production nav remains unchanged.
- `vercel inspect --logs` reported deployment status `Ready`; build logs showed successful production build/deploy.
