# SQC Web Profile Readiness Polish — 2026-06-11

## Sprint slice
Continued the SQC website UX parity review with the runner profile/account-readiness setup surface.

## User-facing changes
- Reframed `/profile` from a plain edit form into a runner-profile proof setup room.
- Replaced harsher unlock/login copy with SQC product language around public chess usernames, proof receipts, and runner identity.
- Added an SQC-styled `Ready to run` checklist covering public runner card, proof source, and next run.
- Polished signed-out profile guidance into three clear steps: sign in, add Lichess/Chess.com, then browse Solo Side Quests.
- Preserved existing Clerk sign-in and `saveRunnerProfile` behavior; no verifier or account-storage paths changed.

## Checks
- `pnpm lint -- src/app/profile/page.tsx src/app/globals.css` (CSS ignored-file warning only)
- `pnpm build`
- `pnpm deploy:prod` including `pnpm quest:release-gate`

## Deploy
- Commit: `c683b8b` (`Polish runner profile readiness`)
- Production deploy: `https://cc-7uerv8l7o-andreas-nordenadlers-projects.vercel.app`
- Alias: `https://sidequestchess.com`

## Live smoke
- `https://sidequestchess.com/profile?profileReadinessSmoke=20260611` returned 200 with `Runner profile` and `Before your first run`.
- `https://cc-7uerv8l7o-andreas-nordenadlers-projects.vercel.app/profile?profileReadinessSmoke=20260611` returned 200 with the new signed-out runner-profile copy.
- `https://sidequestchess.com/account?profileReadinessSmoke=20260611` returned 200 after signed-out sign-in redirect content.
- `https://sidequestchess.com/challenges?profileReadinessSmoke=20260611` returned 200 with `Official Solo finder`.
