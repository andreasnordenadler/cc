# SQC Today Proof Loop Handoff — Live Deploy (2026-05-05)

## Summary

Added a dedicated `Today’s proof loop` block to `/today` so the shared daily quest now guides testers through one clean run:

1. preflight chess identity,
2. play the daily dare in a real Lichess/Chess.com game,
3. check the latest receipt and use support if anything feels confusing.

This keeps the daily ritual from being just a share page; it now points directly into the private-beta proof loop.

## Changed files

- `src/app/today/page.tsx`

## Verification

- `pnpm lint` ✅
- `pnpm build` ✅
- Production deploy ✅
  - Preview: `https://cc-haydujgc6-andreas-nordenadlers-projects.vercel.app`
  - Canonical alias: `https://sidequestchess.com`
- Live smoke ✅
  - `https://cc-haydujgc6-andreas-nordenadlers-projects.vercel.app/today` returned 200 and contained `Today’s proof loop`, `Turn the daily quest into one clean test run.`, `Check latest receipt`
  - `https://sidequestchess.com/today` returned 200 and contained `Today’s proof loop`, `Connect chess name`, `Check latest receipt`
  - `https://sidequestchess.com/connect` returned 200
  - `https://sidequestchess.com/result` returned 200
- Bounded Vercel log watch ✅
  - `vercel logs https://cc-haydujgc6-andreas-nordenadlers-projects.vercel.app` streamed no runtime errors before the 25s bounded timeout.

## Notes

During log-watch verification, the first Python timeout wrapper crashed on a bytes/string concatenation bug in the exception handler; the wrapper was fixed and the gotcha was logged in `.learnings/ERRORS.md`.
