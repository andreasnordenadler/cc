# SQC web Multiplayer create flow polish — 2026-06-11

Sprint: SQC website UX parity review (2026-06-10 20:18 → 2026-06-11 20:18 Europe/Stockholm)

## User-facing change

- Polished the signed-in `/groupquests/create` host builder so Multiplayer creation feels more guided and less like a dense settings form.
- Reframed the opening note as `Host setup` and added a three-step SQC-styled guide: name the table, pick the run, set the window.
- Clarified the quest picker as a `Quest stack`, added helper copy for the race structure, and labeled choices as `Official Solo` or `Custom Solo` without exposing internal implementation terms.
- Replaced the loose save button footer with a `Ready to host?` action panel that explains the post-save review/share step.
- Removed visible `mobile shortcut` comparison wording from the quick-duration helper while preserving the shortcut behavior and verifier paths.

## Files changed

- `src/components/group-quest-draft-builder.tsx`
- `src/app/globals.css`

## Checks

- `pnpm lint -- src/components/group-quest-draft-builder.tsx src/app/groupquests/create/page.tsx src/app/globals.css`
  - Passed with the existing CSS ignored-file warning only.
- `pnpm build`
  - Passed.

## Production deploy / smoke

- Committed/pushed `1a75831` (`Polish Multiplayer create flow`).
- First deploy attempt was safely blocked by the production guard because local `HEAD` had not been pushed yet; pushed `main`, reran deploy successfully.
- `pnpm deploy:prod`
  - Included `pnpm quest:release-gate`.
  - Production deploy: `https://cc-4fuqz95vx-andreas-nordenadlers-projects.vercel.app`
  - Aliased to `https://sidequestchess.com`
- Live smoke:
  - `https://sidequestchess.com/groupquests/create?createFlowSmoke=20260611` → expected signed-out `307` to `/sign-in?redirect_url=%2Fgroupquests%2Fcreate` with create-page metadata.
  - Deploy URL `/groupquests/create?createFlowSmoke=20260611` → expected signed-out `307` to sign-in.
  - `https://sidequestchess.com/groupquests/public?createFlowSmoke=20260611` → 200 with Public Multiplayer content.
  - `https://sidequestchess.com/groupquests/seed-public-sqcseed11-11?createFlowSmoke=20260611` → 200 with Multiplayer invite/proof-check content.
