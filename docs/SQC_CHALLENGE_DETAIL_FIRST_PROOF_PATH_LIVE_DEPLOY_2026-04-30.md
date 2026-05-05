# SQC challenge-detail first proof path — live deploy

Date: 2026-04-30 14:50 Europe/Stockholm
Project: CC / Side Quest Chess

## Change

Added a launch-readiness `First proof path` block to every challenge detail page so first-time runners know the exact loop after accepting a quest:

1. Start this exact active dare.
2. Play and win one eligible public Lichess or Chess.com game on the saved username.
3. Return to check latest games and read the pass/fail/pending receipt.

This improves the core quest loop on `/challenges/[id]` without adding more beta-tester/admin functionality, changing auth, changing verifier rules, or changing challenge metadata.

## Files changed

- `src/app/challenges/[id]/page.tsx`
- `ROADMAP.md`
- `.learnings/ERRORS.md` (tooling notes from deploy-log scan retries)

## Verification

- `pnpm install --frozen-lockfile` ✅
- `pnpm lint` ✅
- `pnpm build` ✅
- Production deploy ✅
  - Deploy URL: `https://cc-7lb9fy73i-andreas-nordenadlers-projects.vercel.app`
  - Alias: `https://sidequestchess.com`
- Live smoke ✅
  - `https://cc-7lb9fy73i-andreas-nordenadlers-projects.vercel.app/challenges/no-castle-club` returned 200
  - `https://sidequestchess.com/challenges/no-castle-club` returned 200
  - `https://sidequestchess.com/challenges` returned 200
  - `https://sidequestchess.com/connect` returned 200
  - `https://sidequestchess.com/result` returned 200
- Live content check ✅
  - Canonical challenge detail contains `First proof path`
  - Canonical challenge detail contains `What to do after you accept this quest`
  - Canonical challenge detail contains `Set chess username`
  - Canonical challenge detail contains `Open latest receipt`
- Vercel bounded log scan ✅
  - `vercel logs https://cc-7lb9fy73i-andreas-nordenadlers-projects.vercel.app` was run under a bounded Node wrapper.
  - No `500`, `error`, `exception`, or `failed` strings appeared during the bounded stream.

## Notes

The first log-scan command with `--since 30m` failed because this Vercel CLI log-stream mode does not support filtering; a bounded wrapper around plain `vercel logs <deployment-url>` succeeded afterward.
