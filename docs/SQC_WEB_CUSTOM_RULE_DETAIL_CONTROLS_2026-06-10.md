# SQC web Custom Solo rule-detail controls — 2026-06-10

Sprint: SQC website parity sprint, 2026-06-09 17:35 → 2026-06-10 17:35 Europe/Stockholm.

## Shipped

- Expanded `/account/custom-side-quests` website Custom Solo builder beyond the previous six-condition starter fields.
- Added mobile-equivalent rule controls for Custom Solo conditions:
  - piece owner: my pieces vs opponent pieces,
  - piece timing: by move, at move, or at game end,
  - quantifier/count/starting-piece identity,
  - `not moved`,
  - inverted/forbidden conditions,
  - move-sequence timing and inverted sequence/result/opening conditions.
- Website edits now prefill those saved rule details for up to the existing six-condition web cap.
- Shared custom verifier now explicitly evaluates `not moved` instead of treating it as a generic on-board condition.
- Community/public safe-rule descriptions now include timing, selector, identity, and inverted condition context without exposing raw config.

## Verification

- `pnpm lint -- src/app/account/custom-side-quests/page.tsx src/lib/custom-side-quests.ts src/lib/community-side-quests.ts`
- `pnpm build`

## Notes

- Existing recipes with more than six conditions are still preserved on website edits instead of being collapsed.
- No website redesign or navigation changes were made.
