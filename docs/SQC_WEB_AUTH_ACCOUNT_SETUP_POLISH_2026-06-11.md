# SQC Web auth account setup polish — 2026-06-11

Sprint: SQC website UX parity review (2026-06-10 20:18 → 2026-06-11 20:18 Europe/Stockholm)

## Slice

Continued account-readiness/mobile-standalone parity on the signed-out auth surfaces.

## Changed

- Polished `/sign-in` from simple account-memory copy into an SQC-styled account handoff:
  - `SQC account` eyebrow.
  - three-step run guide: open your run, check public games, keep the receipt.
  - clearer public-game/no-password reassurance.
- Polished `/sign-up` into a guided new-runner setup surface:
  - `Start your SQC account` eyebrow.
  - three-step setup guide: create account, add proof source, pick a first run.
  - compact readiness chips for public username/proof checks/receipts.
- Added responsive SQC card/chip styling for the auth run guide while preserving Clerk form behavior and existing auth routing.

## Checks

- `pnpm lint -- 'src/app/sign-in/[[...sign-in]]/page.tsx' 'src/app/sign-up/[[...sign-up]]/page.tsx' src/app/globals.css`  
  - passed with the existing CSS ignored-file warning only.
- `pnpm build` — passed.
- `pnpm deploy:prod` — passed, including:
  - `pnpm quest:release-gate`
  - production deploy guard
  - Vercel build

## Commit / deploy

- Code commit: `592ffe2` — `Polish SQC auth account setup UX`
- Production deploy: `https://cc-4eo5bh7yi-andreas-nordenadlers-projects.vercel.app`
- Production alias: `https://sidequestchess.com`

## Live smoke

All returned 200 with expected copy:

- `https://sidequestchess.com/sign-in?authSetupSmoke=20260611` → `SQC account`
- `https://sidequestchess.com/sign-up?authSetupSmoke=20260611` → `Proof checks from public games`
- `https://cc-4eo5bh7yi-andreas-nordenadlers-projects.vercel.app/sign-up?authSetupSmoke=20260611` → `Start your SQC account`
- `https://sidequestchess.com/challenges` → `Official Solo finder`
- `https://sidequestchess.com/groupquests/public` → `Find a table`
