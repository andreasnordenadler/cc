# SQC Web Custom Solo Builder Rule Group Polish — 2026-06-10

Sprint: `sqc-website-ux-parity-review-24h`

## Slice

Continued Andreas's Custom Solo builder UX-polish thread by making each proof-condition card easier to scan before adding any new capability.

## Change

- Added a rule-shape guide inside every Custom Solo condition card so players choose Result, Pattern, or Piece state first.
- Replaced the flat wall of mixed rule fields with SQC-styled field groups:
  - Result rule
  - Pattern rule
  - Piece-state rule
  - Advanced twist
- Kept the existing six-condition verifier payload, saved-rule prefill, complex-rule preservation, and mobile-responsive stacking unchanged.
- Preserved product-facing language; no `website creator` / web-vs-app wording was introduced.

## Verification

- `pnpm lint -- src/app/account/custom-side-quests/page.tsx src/app/globals.css` (passes with the existing CSS ignored-file warning only)
- `pnpm build`
- `pnpm deploy:prod` including `pnpm quest:release-gate`
- Production deploy `https://cc-eju18j2w5-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`
- Live smoke returned signed-out sign-in content for production/deploy `/account/custom-side-quests?ruleGroupSmoke=20260610` and 200 Community Solo content for `/challenges/community?ruleGroupSmoke=20260610`
