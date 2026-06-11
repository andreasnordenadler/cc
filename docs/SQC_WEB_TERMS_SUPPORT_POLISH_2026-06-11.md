# SQC Website UX Parity Sprint — Terms/support polish

Date: 2026-06-11
Sprint: `sqc-website-ux-parity-review-24h`

## Slice

Continued standalone/account-readiness polish by making `/terms` feel less like a plain legal wall and more like an SQC support-adjacent guardrail page.

## Changes

- Added an SQC-styled `Before you run` quick guide that summarizes the player expectations before the full terms list.
- Highlighted proof-source, public-receipt, and support-review expectations in compact cards.
- Reworked the final help card into a clearer human-review next step with Support and Verifier Board actions.
- Added responsive styling so the quick guide stacks cleanly on smaller screens.

## Checks

- `pnpm lint -- src/app/terms/page.tsx src/app/globals.css` (CSS ignored-file warning only)
- `pnpm build`
- `pnpm deploy:prod` including `pnpm quest:release-gate`

## Deploy

- Production deploy: `https://cc-b185u6urn-andreas-nordenadlers-projects.vercel.app`
- Alias: `https://sidequestchess.com`

## Live smoke

- `https://sidequestchess.com/terms?termsSupportSmoke=20260611` → 200 with `Keep the quest fair` and `Need a human review`
- `https://cc-b185u6urn-andreas-nordenadlers-projects.vercel.app/terms?termsSupportSmoke=20260611` → 200 with `Keep the quest fair` and `Need a human review`
- `https://sidequestchess.com/support` → 200
- `https://sidequestchess.com/verifiers` → 200
