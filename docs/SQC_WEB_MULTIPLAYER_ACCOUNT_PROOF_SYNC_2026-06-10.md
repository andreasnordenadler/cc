# SQC Web Multiplayer Account Proof Sync — 2026-06-10

## Slice

Closed the website parity gap where Multiplayer proof checks updated the table/leaderboard but did not also merge passed Multiplayer proof into the runner's account proof ledger, while mobile already did this after Multiplayer refresh.

## Shipped

- Website `/api/groupquests/[id]/refresh` now mirrors the mobile Multiplayer refresh side effect for passed checks.
- Passed Multiplayer checks append safe account `challengeAttempts` with provider, game ID, checked time, completion time, and `Multiplayer proof verified` summary.
- Account `challengeProgress.completedChallengeIds` is updated from the same passed Multiplayer checks, so website-first Multiplayer completions can appear in the Trophy Cabinet/proof history without requiring the mobile app.
- The host-owned Multiplayer table storage remains unchanged; private participant emails/account metadata are not exposed in public responses.

## Verification

- `pnpm lint -- 'src/app/api/groupquests/[id]/refresh/route.ts'`
- `pnpm build`
- Commit/push: `5bd91ca`
- Production deploy: `https://cc-ho9eo9vmg-andreas-nordenadlers-projects.vercel.app` → `https://sidequestchess.com`
- Live smoke: seeded Multiplayer detail 200, public Multiplayer browse 200, signed-out `POST /api/groupquests/seed-public-sqcseed11-11/refresh` returned 401 `sign_in_required`
