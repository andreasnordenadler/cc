# BlunderCheck v1 dynamic result proof card

Date: 2026-04-26 14:40 Europe/Stockholm  
Project: CC / BlunderCheck

## What changed

Replaced the static `/result` demo proof poster with a dynamic result surface that reads the signed-in user's saved BlunderCheck metadata:

- latest challenge attempt via `getLatestChallengeAttempt()`
- matching challenge details via `getChallengeById()`
- saved points/progress via `getChallengeProgress()`
- latest attempt headline/detail/meta via `buildAttemptSummary()`

The result card now adapts for passed, failed, pending, and no-attempt states instead of always claiming the canned queen-loss victory.

## User-visible impact

- `/result` is now a real share/proof shell for the current MVP loop.
- A passed attempt shows a certified-chaos style proof card with challenge reward and badge-oriented share copy.
- Failed/pending attempts now still produce a useful receipt instead of misleading users with fake success.
- The page points users back to `/account` to run `Check latest games`, closing the loop between verifier and share card.

## Files changed

- `src/app/result/page.tsx`

## Verification

- `pnpm lint` ✅
- `pnpm build` ✅
- Local route smoke via Python urllib against existing dev server on port 3011 ✅
  - `/result` returned 200 and contained `The result now follows your latest check` + `Live proof card`
  - `/account` returned 200
  - `/challenges/queen-never-heard-of-her` returned 200

Note: the first smoke attempt using bare `curl` failed because this shell session did not resolve `curl` from PATH. Recovered with Python urllib without changing the app.

## Next good step

Add a copy/share affordance or lightweight generated image/card export once the MVP has enough verifier outcomes to make sharing worth polishing.
