# SQC friend-dare links live deploy — 2026-04-27

## What changed

Added a challenge-specific friend-dare sharing loop for Side Quest Chess:

- New route: `/dare/[id]`
- New reusable client component: `ChallengeInviteActions`
- Challenge detail pages now expose:
  - `Friend dare page` link
  - `Dare a friend` copy/native-share actions
- Dare pages show the challenge, badge reward, rules, and accept/browse CTAs.

## Verification

- `pnpm lint` ✅
- `pnpm build` ✅
- Production deploy ✅
  - Deployment: `https://cc-r1a7wzod0-andreas-nordenadlers-projects.vercel.app`
  - Aliased production domain: `https://sidequestchess.com`
- Production smoke ✅
  - `https://sidequestchess.com/dare/queen-never-heard-of-her` contains `You have been dared`, `Copy friend dare`, and `Accept this bad idea`
  - `https://sidequestchess.com/challenges/queen-never-heard-of-her` contains `Dare a friend`, `Friend dare page`, and `/dare/queen-never-heard-of-her`
  - `https://sidequestchess.com/challenges` contains `Pick your next bad idea`
  - `https://sidequestchess.com/result` contains `Side Quest Chess proof`
- Vercel recent log scan ✅
  - No `5xx`, `ERROR`, or `Error` matches found in the sampled deployment logs after smoke.

## Notes

Local route smoke through `next start` was blocked by the Clerk proxy/middleware in this machine's local networking path, so the authoritative verification used production smoke after a successful Vercel build/deploy.
