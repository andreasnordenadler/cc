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
- Commit: `1e74b51` (`Polish Custom Solo rule focus`)
- Production deploy: `https://cc-oskdhldra-andreas-nordenadlers-projects.vercel.app` → `https://sidequestchess.com`
- Deploy gate: `pnpm deploy:prod` including `pnpm quest:release-gate`
- Live smoke:
  - `https://sidequestchess.com/account/custom-side-quests?ruleFocusSmoke=20260611` returned expected signed-out `307` to `/sign-in` with SQC sign-in content.
  - Deploy URL `/account/custom-side-quests?ruleFocusSmoke=20260611` returned the same signed-out protection.
  - `https://sidequestchess.com/challenges/community?ruleFocusSmoke=20260611` returned `200` with Community Solo content.
  - `https://sidequestchess.com/groupquests/public?ruleFocusSmoke=20260611` returned `200` with Public Multiplayer content.

## Safety / privacy notes

- No raw custom rule configs, private account metadata, invite codes, or proof receipts are newly exposed.
- This is visual/product-language polish only; it does not publish or release any live pickable quest.
