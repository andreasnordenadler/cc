# SQC private-beta support packet discovery

Date: 2026-05-05 00:50 Europe/Stockholm
Project: CC / Side Quest Chess

## Change

- Routed the homepage private-beta trust strip “Open support packet” CTA to the dedicated `/support` page instead of looping testers back to `/beta`.
- Added an explicit `/support` CTA to the `/beta` hero actions.
- Updated the `/beta` support trust note so testers are pointed at the support packet for confusing receipts, setup, badge, or share-card issues.

## Why

The support page shipped, but the beta discovery path still made testers work too hard to find the structured report packet. This closes the loop from trust/beta surfaces to actionable support reporting.

## Local verification

- `pnpm lint` ✅
- `pnpm build` ✅

## Live verification

- Commit: `6b58f9c` (`Tighten beta support packet discovery`)
- Pushed: `origin/main` ✅
- Production deploy: `https://cc-h252pv9g1-andreas-nordenadlers-projects.vercel.app` ✅
- Alias: `https://sidequestchess.com` ✅
- Smoke checks ✅
  - `https://sidequestchess.com/` returned 200 and includes `href="/support"` plus `Open support packet`.
  - `https://sidequestchess.com/beta` returned 200 and includes `href="/support"`, `Open support packet`, and `use the support packet`.
  - `https://sidequestchess.com/support` returned 200 and includes the copy/paste support report template.
  - Preview `/beta` returned 200 and includes the new support packet CTA.

## Notes

A bounded Vercel log-watch attempt hit CLI/host friction (`vercel logs --since` unsupported in this mode; macOS has no GNU `timeout`). Route smoke verification passed on the canonical and preview surfaces.
