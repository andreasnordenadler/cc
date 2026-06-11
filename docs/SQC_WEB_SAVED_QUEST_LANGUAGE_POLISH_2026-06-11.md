# SQC web saved-quest language polish — 2026-06-11

Sprint: SQC website UX parity review 24h  
Slice: Product-language cleanup across Custom Solo, Community Solo, and Multiplayer host surfaces

## What changed

- Replaced remaining player-visible `shelf` / `library` wording on Custom Solo management with saved-quest/account language.
- Cleaned Community Solo share/empty-state copy so public quests no longer refer to private shelf/library data.
- Reframed Multiplayer host context copy as `Host details` and `view more from a host`, avoiding host-shelf/internal framing.
- Kept code/class names and API/mobile internals unchanged where they are not visible product copy.

## Product/UX notes

- Continues Andreas's objection-driven cleanup of internal/product-hostile terms without redesigning SQC surfaces.
- Preserves existing verifier, lifecycle, Community Solo, and Multiplayer behavior.
- Does not add or release any live/pickable quest.
- Does not touch Capaflow, Lyric Logic, LoLite, or other projects.

## Checks

- `pnpm lint -- src/app/account/custom-side-quests/page.tsx src/app/challenges/community/page.tsx 'src/app/challenges/community/[id]/page.tsx' src/app/groupquests/public/page.tsx 'src/app/groupquests/[id]/page.tsx' src/components/group-quest-draft-builder.tsx`
- `pnpm build`
- `pnpm deploy:prod` including `pnpm quest:release-gate`

## Deployment / smoke

- Commit: `ea0ac3f` (`Polish SQC saved-quest language`)
- Production deploy: `https://cc-asddjmlj3-andreas-nordenadlers-projects.vercel.app`
- Aliased production: `https://sidequestchess.com`
- Live smoke:
  - `https://sidequestchess.com/account/custom-side-quests?savedQuestLanguageSmoke=20260611` → `307` to `/sign-in` as expected for signed-out account route
  - deploy URL `/account/custom-side-quests?savedQuestLanguageSmoke=20260611` → `307` to `/sign-in`
  - `https://sidequestchess.com/challenges/community?savedQuestLanguageSmoke=20260611` → `200`; old `Custom Side Quest library` phrase absent
  - `https://sidequestchess.com/groupquests/public?savedQuestLanguageSmoke=20260611` and deploy URL → `200` with `view more from a host`; old `host shelf` phrase absent
  - `https://sidequestchess.com/groupquests/seed-public-sqcseed11-11?savedQuestLanguageSmoke=20260611` → `200` with `Host details`; old `host context` / `host shelf` phrases absent
