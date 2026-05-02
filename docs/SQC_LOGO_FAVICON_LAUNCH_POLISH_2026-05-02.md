# SQC logo favicon launch polish — 2026-05-02

## Change

Used the current SQC logo (`public/sqc-logo.png`) as the browser/site icon set:

- `src/app/favicon.ico` — multi-size favicon containing 16px, 32px, and 48px PNG entries.
- `src/app/icon.png` — 512px app icon for Next.js app metadata.
- `src/app/apple-icon.png` — 180px Apple touch icon.

## Why

Andreas asked whether the SQC logo could be used as the favicon. This is small launch-polish that makes the site identity more consistent in browser tabs, bookmarks, and mobile saved pages.

## Verification

- `file src/app/favicon.ico src/app/icon.png src/app/apple-icon.png` confirms expected icon/image formats.
- `pnpm lint` passed.
- `pnpm build` passed; Next.js build output includes `/icon.png` and `/apple-icon.png` as static app routes.

## Live proof

Pending production deploy + live icon route smoke.
