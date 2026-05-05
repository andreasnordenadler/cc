# SQC homepage hero action simplification — live deploy proof

Date: 2026-05-05 03:10 Europe/Stockholm
Project: CC / Side Quest Chess

## Change

Simplified the homepage hero action cluster from a broad route directory into the four highest-signal first-run actions:

- continue the signed-in active quest when present, otherwise start the three-quest path
- pick from the quest hub
- open today’s quest
- connect a chess name / check account preflight depending on sign-in state

This keeps secondary surfaces available lower on the homepage while making the first screen more clearly about the core SQC loop.

## Files changed

- `src/app/page.tsx`

## Verification

- `pnpm lint` ✅
- `pnpm build` ✅
- Production deploy ✅
  - Preview/deploy URL: `https://cc-awvgpn347-andreas-nordenadlers-projects.vercel.app`
  - Canonical alias: `https://sidequestchess.com`
- Live smoke ✅
  - `https://sidequestchess.com/` returned 200 and rendered `Start the three-quest path`, `Pick from the quest hub`, and `Connect a chess name`
  - `https://cc-awvgpn347-andreas-nordenadlers-projects.vercel.app/` returned 200 and rendered the same hero actions
  - `https://sidequestchess.com/challenges` returned 200
  - `https://sidequestchess.com/path` returned 200
  - `https://sidequestchess.com/today` returned 200

## Notes

- Vercel deploy completed successfully and re-aliased `sidequestchess.com`.
- A bounded `vercel logs` check produced no output before timeout; no runtime error lines were observed during the live smoke window.
