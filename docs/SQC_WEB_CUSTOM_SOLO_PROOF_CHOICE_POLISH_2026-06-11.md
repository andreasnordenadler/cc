# SQC Web Custom Solo Proof Choice Polish — 2026-06-11

## Slice
Continued the SQC website UX parity sprint by polishing the active Custom Solo proof tools on `/account/custom-side-quests`.

## User-facing changes
- Moved the active Custom Solo proof check out of the crowded saved-quest action row.
- Added SQC-styled proof-choice cards matching the official Solo proof pattern:
  - `Fastest check` / `Judge my latest public game`
  - `Specific game` / `Judge a game link or ID`
- Kept lifecycle controls deliberate by separating pause/reset actions from proof submission.
- Removed the duplicate active `Check latest game` action from the generic `Play` group so runners see one clear proof path.

## Guardrails
- No verifier behavior changed.
- Existing latest-game and exact-game Custom Solo proof server actions remain on the same `/api/mobile/quest` path.
- No live/pickable quest release changes.

## Proof
- `pnpm lint -- src/app/account/custom-side-quests/page.tsx src/app/globals.css` *(CSS ignored-file warning only)*
- `pnpm build`
- `pnpm deploy:prod` including `pnpm quest:release-gate`
- Production deploy: `https://cc-7meimrf3m-andreas-nordenadlers-projects.vercel.app`
- Production alias: `https://sidequestchess.com`
- Live smoke:
  - `/account/custom-side-quests?customProofChoiceSmoke=20260611` resolves signed-out users to `/sign-in` with SQC sign-in content.
  - Deploy URL account route resolves signed-out users to `/sign-in` with SQC sign-in content.
  - `/challenges/community?customProofChoiceSmoke=20260611` returns 200 with Community Solo content.
  - `/groupquests/public?customProofChoiceSmoke=20260611` returns 200 with Public Multiplayer content.
