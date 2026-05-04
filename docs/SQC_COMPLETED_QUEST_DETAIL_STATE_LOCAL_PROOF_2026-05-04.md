# SQC completed quest detail state — live deploy

Date: 2026-05-04 15:05 Europe/Stockholm
Owner: Sam

## What changed

Challenge detail pages now recognize when the signed-in runner has already completed that quest:

- hero shows a completed badge
- badge art receives the earned state
- proof-card CTA switches from preview to open proof card
- proof-log CTA appears for completed quests
- the run panel changes to “Completed and ready to brag” with reward-banked context
- completed runners get a direct proof-log / pick-another-quest handoff

## Why

This tightens the core quest loop after success. A completed challenge should not look like an ordinary inactive/active page; it should make the next action obvious: brag, compare receipts, or start another bad idea.

## Verification

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅
- production deploy ✅
- Vercel inspect status `Ready` ✅
- live smoke ✅
  - `https://cc-pd6pxi19m-andreas-nordenadlers-projects.vercel.app/challenges/knights-before-coffee` → 200
  - `https://sidequestchess.com/challenges/knights-before-coffee` → 200
  - `https://sidequestchess.com/challenges` → 200
  - `https://sidequestchess.com/proof-log` → 200
- source assertions for the signed-in completed branch ✅
  - `Completed and ready to brag`
  - `Reward banked`
  - `Badge earned. Receipt ready.`
- Vercel error-log scan ✅ (`No logs found` for the new deployment in the bounded window)

## Live deploy

- Production: `https://cc-pd6pxi19m-andreas-nordenadlers-projects.vercel.app`
- Aliased canonical: `https://sidequestchess.com`
- Commit: `143075d` pushed to `main`
