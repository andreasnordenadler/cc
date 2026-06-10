# SQC Web Custom Solo Builder UX Polish — 2026-06-10

## Slice

Continued the SQC website UX parity sprint after Andreas flagged the Custom Solo builder as visually poor and objected to internal wording such as “website creator”.

## Changes

- Reframed `/account/custom-side-quests` copy around the user’s Custom Solo library instead of “website” mechanics.
- Renamed the builder eyebrow/action language to product-facing “Custom Solo builder” and “Create Custom Solo”.
- Added a three-step builder guide: name the quest, set proof rules, save safely.
- Reworked the six-condition rule editor into app-quality condition cards using `<details>`:
  - the main proof condition is open by default;
  - optional condition slots are collapsed unless already populated;
  - each card has a clear title, hint, and proof-type badge;
  - detailed piece-state controls are grouped under a visible subheading.
- Added focused builder styling for inputs, condition cards, save-state panel, desktop grids, and mobile single-column layout while preserving the existing SQC dark/gold card language.

## Verification

- `pnpm lint -- src/app/account/custom-side-quests/page.tsx src/app/globals.css` passed with the expected ignored-file warning for CSS.
- `pnpm build` passed.
- Local signed-out smoke for `/account/custom-side-quests?uxBuilderSmoke=20260610` returned the expected Clerk-protected `307` to `/sign-in`.
