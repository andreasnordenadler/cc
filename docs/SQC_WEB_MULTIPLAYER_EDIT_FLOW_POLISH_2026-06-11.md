# SQC Web Multiplayer Edit Flow Polish — 2026-06-11

Sprint: SQC website UX parity review 24h

## What changed

- Polished the host-only Multiplayer edit flow with a three-step SQC guide: tune the invite, confirm the run, save deliberately.
- Reframed edit settings around a clearer `Quest stack and proof settings` section with player-facing Official Solo / Custom Solo labels.
- Expanded the edit preview so hosts can review joined players, selected quests, proof window, games allowed, and share URL before saving.
- Replaced remaining visible mobile-comparison copy in Multiplayer edit and Custom Solo exact-proof helper text with product-facing SQC language.
- Added a deliberate `Ready to update this table?` save panel so lifecycle/proof-window changes feel safer and less like a loose form footer.

## Verification

- `pnpm lint -- src/components/group-quest-edit-form.tsx src/app/account/custom-side-quests/page.tsx src/app/globals.css` (CSS ignored-file warning only)
- `pnpm build`
- `pnpm deploy:prod` including `pnpm quest:release-gate`

## Production

- Deployed production: `https://cc-8bnqyhe77-andreas-nordenadlers-projects.vercel.app`
- Aliased to: `https://sidequestchess.com`

## Live smoke

- `https://sidequestchess.com/groupquests/seed-public-sqcseed11-11?editFlowSmoke=20260611` → 200 with Multiplayer content.
- `https://sidequestchess.com/groupquests/seed-public-sqcseed11-11/edit?editFlowSmoke=20260611` → expected signed-out 307/sign-in content for host-only edit route.
- `https://cc-8bnqyhe77-andreas-nordenadlers-projects.vercel.app/groupquests/public?editFlowSmoke=20260611` → 200 with Public Multiplayer content.
- `https://sidequestchess.com/account/custom-side-quests?editFlowSmoke=20260611` → expected signed-out 307/sign-in content.
- Smoke bodies checked for old visible phrase families: no `same verifier gate as mobile`, `mobile-style`, `website creator`, `website-first`, `web-first`, `account handoff`, `host context`, or `host shelf` matches.

## Commit

- `2e4e90d` — `Polish Multiplayer edit flow UX`
