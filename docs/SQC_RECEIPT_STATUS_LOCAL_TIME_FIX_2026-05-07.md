# SQC receipt/status local time fix — 2026-05-07

## Report
Andreas clicked Refresh at local 11:38, but the latest check/status receipt still displayed 09:38.

## Root cause
The previous timezone patch covered proof/share surfaces, but the challenge detail receipt/status panel still used server-side `formatTime(...)` strings from `user-metadata.ts`. Those strings were rendered before the browser could apply the user's timezone.

## Change
- Challenge detail latest receipt fact now renders `checkedAt` with browser-local `ProofTime`.
- Provider status cards now render `Last checked` with browser-local `ProofTime`.
- Challenge detail receipt meta now renders `Updated` with browser-local `ProofTime`.
- Completed quest badge/date on challenge detail now uses browser-local `ProofTime`.
- Result page latest-check meta now uses browser-local `ProofTime`.
- Account completed quest list now uses browser-local `ProofTime`.

## Verification
- `pnpm lint` passed with pre-existing warnings only.
- `pnpm build` passed.
