# SQC account private-beta preflight live deploy — 2026-04-29

## Change

Added a private-beta preflight checklist to `/account` so testers can see the exact readiness state before sharing a result screenshot:

1. signed in
2. Lichess or Chess.com identity connected
3. active dare selected
4. latest-game receipt generated

The checklist adapts to saved Clerk metadata and links testers either to `/connect`, `/challenges`, or the `/beta` tester script without changing verifier rules, auth, metadata shape, or challenge checks.

## Local verification

- `pnpm lint` ✅
- `pnpm build` ✅

## Live verification

- Production deploy: `https://cc-o77pi64wd-andreas-nordenadlers-projects.vercel.app` ✅
- Alias: `https://sidequestchess.com` ✅
- Smoke checks:
  - `https://cc-o77pi64wd-andreas-nordenadlers-projects.vercel.app/account` → HTTP 200 ✅
  - `https://sidequestchess.com/account` → HTTP 200 ✅
  - `https://sidequestchess.com/beta` → HTTP 200 ✅
  - `https://sidequestchess.com/connect` → HTTP 200 ✅
- Canonical `/account` content checks: `Private beta preflight`, `tester steps ready`, and `Open tester script` present ✅
- Vercel inspect/log check: deployment status `Ready`; build completed without runtime error output in inspected deployment logs ✅
