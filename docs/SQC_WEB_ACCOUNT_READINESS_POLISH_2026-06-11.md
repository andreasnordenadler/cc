# SQC Web account readiness polish — 2026-06-11

## Sprint slice

Continued the SQC website UX parity review after the remaining product-language polish. This slice focused on signed-in account readiness: making the account command center feel player-facing and useful instead of support/internal.

## UX changes

- Replaced the support-centric account readiness explanation with player-facing run setup language.
- Added a compact SQC-styled `Ready to run` checklist inside `/account` for identity, chess account connection, and next Solo quest.
- Kept existing readiness/progress chips and Trophy Cabinet behavior intact while improving mobile stacking for the new checklist.

## Verification

- `pnpm lint -- src/app/account/page.tsx src/app/globals.css` passed with the known CSS ignored-file warning only.
- `pnpm build` passed.

## Production

- Commit `9081c50` (`Polish account readiness panel`) pushed to `main`.
- `pnpm deploy:prod` passed `pnpm quest:release-gate` and the production deploy guard.
- Production deploy `https://cc-h6vn6ugpi-andreas-nordenadlers-projects.vercel.app` was aliased to `https://sidequestchess.com`.
- Live smoke passed for production and deploy `/account?readinessSmoke=20260611` resolving to sign-in for signed-out users, `/profile?readinessSmoke=20260611` returning profile/sign-in content, and `/challenges?readinessSmoke=20260611` returning SQC Solo content.
