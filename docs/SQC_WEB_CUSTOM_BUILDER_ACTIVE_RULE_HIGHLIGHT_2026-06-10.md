# SQC Web Custom Solo Builder Active Rule Highlight — 2026-06-10

Sprint: `sqc-website-ux-parity-review-24h`

## Slice

Continued Andreas's flagged Custom Solo builder polish by making the selected proof-rule section visually obvious inside each condition card.

## Change

- Updated the Custom Solo builder microcopy to explain that the active rule shape is highlighted and dimmed sections stay as safe defaults.
- Added SQC-styled active highlighting for the selected Result, Pattern, or Piece-state field group using CSS `:has(...)`, without adding new verifier capability or changing saved payloads.
- Kept the advanced twist visible but quieter, because it can apply across rule shapes.
- Preserved the existing six-condition rule cap, edit-prefill behavior, complex-rule preservation, and mobile stacking.

## Verification

- `pnpm lint -- src/app/account/custom-side-quests/page.tsx src/app/globals.css` (passes with the existing CSS ignored-file warning only)
- `pnpm build`
- `pnpm deploy:prod` including `pnpm quest:release-gate`
- Production deploy `https://cc-5i48gqxdt-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`
- Live smoke:
  - `https://sidequestchess.com/account/custom-side-quests?activeRuleGroupSmoke=20260610` returned 200 via signed-out sign-in handoff.
  - `https://cc-5i48gqxdt-andreas-nordenadlers-projects.vercel.app/account/custom-side-quests?activeRuleGroupSmoke=20260610` returned 200 via signed-out sign-in handoff.
  - `https://sidequestchess.com/challenges/community?activeRuleGroupSmoke=20260610` returned 200 with Community Solo content.
  - Production CSS chunk contains `custom-condition-grid:has`, confirming the active-rule highlight styles are deployed.
