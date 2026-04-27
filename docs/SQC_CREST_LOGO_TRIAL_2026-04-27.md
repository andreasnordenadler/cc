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

## 17:12 homepage logo layout update

Andreas requested removing the large logo from the homepage hero and making the small top-left nav logo use the same supplied transparent SQC crest at 100% larger size. I removed the hero `hero-logo-lockup` image from `src/app/page.tsx`, kept nav on `/sqc-logo-v6.png`, increased the nav logo image attrs from 120 to 240 and CSS `.logo-mark` from 58px to 116px, with `unoptimized` still set. `pnpm lint` and `pnpm build` passed. Production deploy pending.

## 17:20 nav logo black-box cleanup

Andreas reported a black box behind the top-left logo. I created `public/sqc-logo-v7.png` from the supplied transparent crest by removing tiny disconnected alpha specks and cropping to the main connected crest bounds, then updated the nav logo to `/sqc-logo-v7.png` and removed the CSS drop-shadow from `.logo-mark img` so the nav no longer adds a box-like dark backing. Verification/deploy pending.

## 17:48 nav logo black-square asset fix

Andreas screenshot showed the top-left logo still had a black square canvas. I generated `public/sqc-logo-v9.png` from the supplied logo using an outside-only canvas mask, then filled interior holes back to opaque from the original artwork so shield/banner/crest internals remain intact. The nav now references `/sqc-logo-v9.png` with `unoptimized`; `.logo-mark img` still has no drop-shadow. Verification/deploy pending.

## 17:55 direct supplied transparent logo

Andreas supplied the actual transparent-background PNG (`hasAlpha: true`, RGBA). I copied it directly to `public/sqc-logo-v10.png` with no masking/processing and updated the nav logo to use `/sqc-logo-v10.png` with `unoptimized`. This replaces the failed generated cutout attempts. Verification/deploy pending.

## 18:03 edge-connected black field removal

Andreas clarified the file itself had transparency but the nav still showed a black square. I identified an opaque near-black field in the supplied logo and generated `public/sqc-logo-v11.png` by removing only near-pure black pixels connected to the image edge, preserving internal dark shield/chessboard/outline artwork. Magenta QA confirmed the rectangular black box is gone while dark crest details remain. Nav now references `/sqc-logo-v11.png` with `unoptimized`. Verification/deploy pending.

## 19:39 nav logo removal

Andreas requested removing the logo from the navigation bar as a fun cleanup. I removed the nav image/mark from `src/components/site-nav.tsx` and dropped the now-unused `next/image` import, keeping brand text and nav links intact. Verification/deploy pending.
