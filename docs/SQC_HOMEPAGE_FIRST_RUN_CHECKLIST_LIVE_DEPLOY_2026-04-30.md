# SQC homepage first-run checklist live deploy — 2026-04-30

## Change

Added a `First run checklist` block to the Side Quest Chess homepage so a new player sees the core loop from `/` without route hunting:

1. connect a Lichess or Chess.com identity
2. choose one live-backed quest
3. read the latest result receipt after playing

## Scope

- Changed: `src/app/page.tsx`
- Added proof doc: `docs/SQC_HOMEPAGE_FIRST_RUN_CHECKLIST_LIVE_DEPLOY_2026-04-30.md`
- No auth, verifier, quest-rule, metadata, beta-admin, or receipt logic changes.
- Built/deployed from clean `origin/main` to preserve the newer launch-readiness homepage simplification.

## Verification

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅
- Production deploy ✅
  - Deploy URL: `https://cc-i098a76ma-andreas-nordenadlers-projects.vercel.app`
  - Canonical alias: `https://sidequestchess.com`
- Live smoke ✅
  - Deploy URL `/` returned 200 and contained `First run checklist`, `Start, play, and check proof without route hunting`, and `Connect chess account`.
  - Canonical `/` returned 200 and contained the same strings.
  - Deploy URL and canonical `/connect`, `/challenges`, and `/result` returned 200.
- Vercel 500 scan ✅
  - `node /Users/sam/.openclaw/workspace/skills/deploy-verify/scripts/vercel-500-scan.mjs --project cc --since 30m`
  - Result: `0` recent 500s.
