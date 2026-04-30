# SQC homepage private beta quickstart live deploy — 2026-04-30

## Change

Added a `Private beta quickstart` block to the Side Quest Chess homepage so testers can run the first loop without route hunting:

1. set identity in `/account`
2. pick the starter route from `/challenges`
3. check/copy receipt details from `/result`

## Scope

- Changed: `src/app/page.tsx`
- No auth, verifier, quest-rule, metadata, or receipt logic changes.
- Built/deployed from a clean isolated worktree to avoid shipping unrelated dirty root checkout files.

## Verification

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅
- Production deploy ✅
  - Deploy URL: `https://cc-3iptxmubl-andreas-nordenadlers-projects.vercel.app`
  - Canonical alias: `https://sidequestchess.com`
- Live smoke ✅
  - Deploy URL `/` returned 200 and contained `Private beta quickstart`, `Run the first tester loop without route hunting`, and `Start account preflight`.
  - Canonical `/` returned 200 and contained the same strings.
  - Deploy URL and canonical `/account`, `/challenges`, and `/result` returned 200.
- Vercel 500 scan ✅
  - `node /Users/sam/.openclaw/workspace/skills/deploy-verify/scripts/vercel-500-scan.mjs --project cc --since 30m`
  - Result: `0` recent 500s.

## Commit/deploy evidence

- Clean worktree commit used for deploy: `c675a77` (`Add SQC homepage beta quickstart`)
- Main repo commit preserving the page change and proof doc: `Add SQC homepage beta quickstart proof`
