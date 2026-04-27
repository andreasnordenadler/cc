# SQC crest logo trial — 2026-04-27

## Change

Andreas supplied a new ornate **Side Quest Chess** crest/logo matching the illustrated quest badges and asked to try it for fun.

## Implementation

- Original inbound asset: `/Users/sam/.openclaw/media/inbound/file_507---3dcf5e3c-c4a7-4978-85fc-7423cbfe3327.jpg`
- Runtime logo asset: `public/sqc-logo.png`
- Replaced old `/sqc-temp-logo.jpg` usage with `/sqc-logo.png` in:
  - `src/app/page.tsx`
  - `src/components/site-nav.tsx`
- Updated logo CSS in `src/app/globals.css` so the crest floats as a transparent emblem instead of sitting inside a dark rounded card.

## Asset checks

- `public/sqc-logo.png` is PNG RGBA color type 6.
- The source image had a visible checkerboard in the uploaded JPG; runtime asset was converted to alpha transparency for product use.

## Verification

- `pnpm lint` ✅
- `pnpm build` ✅
- Local smoke on `127.0.0.1:3129` ✅
  - `/` returned 200 and referenced `/sqc-logo.png`
  - `/sqc-logo.png` returned 200
- PNG alpha check ✅
  - `public/sqc-logo.png` has PNG signature and color type 6 (RGBA)

- Production deploy ✅
  - Vercel deployment: `https://cc-1a714podf-andreas-nordenadlers-projects.vercel.app`
  - Aliased to: `https://sidequestchess.com`
- Production smoke ✅
  - `/` returned 200 and referenced `/sqc-logo.png`
  - `/sqc-logo.png` returned 200 and reports PNG RGBA color type 6
- Vercel 500/501/502/503/504 scan ✅
  - no logs found in the last 30m

## 15:55 supplied logo replacement

Andreas supplied a new ornate Side Quest Chess logo image. The uploaded PNG had no alpha channel and contained a baked checkerboard background, so I converted it to `public/sqc-logo-v6.png` with outside-only checkerboard removal. QA on dark and magenta backgrounds passed: exterior is transparent, while banner/shield/crest/interior light details remain opaque. Homepage and nav now reference `/sqc-logo-v6.png` with image optimization bypassed. Verification/deploy pending.
