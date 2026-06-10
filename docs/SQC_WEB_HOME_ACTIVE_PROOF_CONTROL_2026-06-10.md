# SQC Web Home Active Proof Control — 2026-06-10

Closed a small website parity gap versus mobile-v251: the mobile home screen lets signed-in players refresh the current active Solo Side Quest from the active-summary card, while the website home card only linked to the detail page.

## Shipped

- Converted the signed-in website home Active Solo Side Quest card into an in-place command card using the existing card/button styling.
- Added a direct `Check latest game` server-action control when the runner has a connected Lichess or Chess.com username.
- Kept safe fallback actions for missing chess usernames and no active quest.
- Added the latest active receipt headline/detail on the home card when proof attempts exist.
- Preserved existing detail-page links for exact-game proof, rules, badge details, receipts, deactivate, and reset flows.

## Privacy / safety

- No raw account metadata, custom configs, invite codes, or chess-site secrets are exposed.
- The control reuses the existing `checkActiveChallenge` verifier path and metadata compaction/revalidation behavior.
- No production data was modified during verification.

## Verification

- `pnpm lint -- src/app/page.tsx`
- `pnpm build`
- Commit: `0d6a512` (`Add home active proof controls`)
- Production deploy: `https://cc-73s7fl7e3-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`
- Live smoke: 200 for production and deploy `/` with signed-out home content; 200 for production `/challenges?homeProofSmoke=20260610`
