# SQC web home active-run panel polish — 2026-06-11

## Sprint slice

Continued the SQC website UX parity sprint by polishing the signed-in home screen's active Solo Side Quest area. The previous paragraph-heavy active quest card now presents SQC-styled next-step cards:

- `Fastest check` explains whether the runner can judge the latest public Lichess/Chess.com game, needs to connect a username, or still needs to choose a Solo Side Quest.
- `Run details` explains where to find rules, exact-game proof, lifecycle controls, and receipts for official versus Custom Solo Side Quests.
- Mobile stacking keeps the run cards readable while preserving the established SQC home-card look and verifier/lifecycle paths.

## Files changed

- `src/app/page.tsx`
- `src/app/globals.css`

## Verification

- `pnpm lint -- src/app/page.tsx src/app/globals.css` *(CSS ignored-file warning only)*
- `pnpm build`
- `pnpm deploy:prod` including `pnpm quest:release-gate`
- Production deploy: `https://cc-qtwvsso27-andreas-nordenadlers-projects.vercel.app`
- Aliased production: `https://sidequestchess.com`

## Live smoke

- `https://sidequestchess.com/?homeRunPanelSmoke=20260611` → 200 with signed-out SQC home content
- `https://cc-qtwvsso27-andreas-nordenadlers-projects.vercel.app/?homeRunPanelSmoke=20260611` → 200 with signed-out SQC home content
- `https://sidequestchess.com/challenges` → 200
- `https://sidequestchess.com/groupquests/public` → 200

## Commit

- `52cb05f` — `Polish home active quest run panel`
