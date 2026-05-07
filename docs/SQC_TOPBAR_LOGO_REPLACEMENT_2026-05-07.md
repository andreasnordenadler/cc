# SQC topbar logo replacement — 2026-05-07

## Request
Andreas provided a new image and asked to replace `sqc-alt-logo-topbar-transparent.png`.

## Change
- Replaced `public/brand/sqc-alt-logo-topbar-transparent.png` with the provided image converted to PNG.
- Source upload was a 1280×650 JPEG without alpha; replacement PNG therefore has no alpha channel despite preserving the existing filename.
- Saved a local backup of the previous asset at `tmp/sqc-alt-logo-topbar-transparent.previous.png`.

## Cache-bust follow-up
After deploy, Andreas refreshed and still saw the previous logo. The deployed raw asset had updated, but the topbar image could still be served from browser/cache state because the URL was unchanged. Added a versioned asset path:

- `public/brand/sqc-alt-logo-topbar-20260507.png`
- Updated `SiteNav` and `/brand-test` to reference `/brand/sqc-alt-logo-topbar-20260507.png`.

## Verification
- `sips` confirmed replacement dimensions: 1280×650.
- `pnpm lint` passed with warnings only.
- `pnpm build` passed.
