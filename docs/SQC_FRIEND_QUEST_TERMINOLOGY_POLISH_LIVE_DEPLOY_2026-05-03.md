# SQC friend-quest terminology polish live deploy — 2026-05-03

## What changed

- Tightened the friend-quest receive page so visible copy says `A friend sent you a quest.` instead of `You have been dared.`
- Reworded the proof-path explanation from `accepting a dare` / `save this exact dare` to consistent friend-quest language.
- Reworded the result handoff eyebrow from `Dare the next person` to `Send the next quest`.

## Why

SQC launch polish now standardizes visible product language around quests/friend quests, avoiding stale dare/challenge copy where it makes the product feel less coherent.

## Verification

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅
- Production deploy ✅ `https://cc-2xb1n4kts-andreas-nordenadlers-projects.vercel.app`
- Alias ✅ `https://sidequestchess.com`
- Live smoke ✅
  - deploy `/dare/knights-before-coffee` returned 200
  - canonical `/dare/knights-before-coffee` returned 200
  - canonical `/result` returned 200
  - canonical dare page contains `A friend sent you a quest.`, `Accepting a friend quest should feel simple`, and `Save this exact friend quest as your active quest`
  - canonical result page contains `Send the next quest`
- Vercel inspect ✅ deployment status `Ready`; alias includes `sidequestchess.com` and `www.sidequestchess.com`
- Vercel log watch ✅ no runtime output emitted during bounded watch
