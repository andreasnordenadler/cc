# SQC Web Custom Solo Rule Focus Polish — 2026-06-11

## Summary

Continued Andreas's Custom Solo builder UX parity sprint by reducing the visible rule-editor clutter on `/account/custom-side-quests`. The builder now keeps unused rule sections tucked away and only shows the controls that match the selected proof-rule shape, preserving the SQC card styling while making the six-condition editor feel less overwhelming.

## What changed

- Reworded the rule-builder guidance away from “dimmed sections” toward a focused “pick the rule shape first” flow.
- Added a calm “No extra rule here” resting state for optional condition slots set to `No condition`.
- Changed the condition-card styling so Result, Pattern, Piece-state, and Advanced controls appear only when relevant instead of showing every possible rule group at once.
- Preserved the existing form field names/defaults, validation path, six-condition cap, and custom verifier behavior.

## Verification

- `pnpm lint -- src/app/account/custom-side-quests/page.tsx src/app/globals.css` (CSS ignored-file warning only)
- `pnpm build`

## Safety / privacy notes

- No raw custom rule configs, private account metadata, invite codes, or proof receipts are newly exposed.
- This is visual/product-language polish only; it does not publish or release any live pickable quest.
