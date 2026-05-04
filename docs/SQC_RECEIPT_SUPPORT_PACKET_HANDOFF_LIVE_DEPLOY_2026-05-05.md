# SQC receipt → support packet handoff live deploy — 2026-05-05

## Summary

Tightened the private-beta support/reporting loop so confusing result receipts now point directly into the dedicated `/support` packet instead of sending testers back to the broader beta guide.

## Changes

- `/result` receipt-next-step CTA now links to `/support` as “Open support packet”.
- `/result` beta report shortcut now points to the support packet and tells testers to paste receipt facts there.
- `/support` copy/paste template now explicitly asks for latest-check headline and fairness note.
- `/support` includes direct buttons to copy latest receipt facts from `/result` and check account preflight from `/account`.

## Verification

- `pnpm lint` ✅
- `pnpm build` ✅
- Production deploy ✅
  - Preview: `https://cc-aoyh0ekzr-andreas-nordenadlers-projects.vercel.app`
  - Canonical alias: `https://sidequestchess.com`
- Live smoke ✅
  - `https://sidequestchess.com/support` returned 200 and contained `Copy latest receipt facts`, `Latest check headline`, `Fairness note`, `Check account preflight`.
  - `https://sidequestchess.com/result` returned 200 and contained `Open support packet`, `Support packet`, `paste this into the support packet`.
  - Preview `/support` returned 200 and contained the new support strings.

## Impact

Private-beta testers who hit a confusing passed/failed/pending receipt now have a shorter path from “this felt wrong” to an actionable report with quest, provider, game link, latest-check headline, and fairness note captured together.
