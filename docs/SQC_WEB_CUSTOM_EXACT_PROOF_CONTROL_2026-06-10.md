# SQC Web Custom Solo exact-proof control — 2026-06-10

## Scope

Continued the SQC website parity sprint by adding the mobile-v251 Custom Solo `Specific proof game` control to website `/account/custom-side-quests` active Custom Solo cards.

## Shipped

- Active website Custom Solo cards now include a specific-game proof form beside the existing `Check latest game` / `Deactivate` controls.
- The form accepts a Lichess game ID or Chess.com game URL and submits through the same `/api/mobile/quest` action path used by mobile (`action=submit`, `challengeId`, `gameId`).
- Empty submissions fail before verifier work with the same paste-a-game guidance.
- The website preserves the current backend safety gate for Custom Solo exact-game proof: if the shared verifier still rejects custom exact proof, the existing error is surfaced instead of pretending success.
- Styling uses existing SQC card/form/button language and does not redesign the Custom Solo library.

## Verification

- `pnpm lint -- src/app/account/custom-side-quests/page.tsx`
- `pnpm build`
- Production deploy: `https://cc-lfnosto6x-andreas-nordenadlers-projects.vercel.app` → `https://sidequestchess.com`
- Live smoke: signed-out `/account/custom-side-quests?customExactProofSmoke=20260610` returned 307 to `/sign-in`; `/challenges/community?customExactProofSmoke=20260610` returned Community Solo/creator content; `/groupquests?customExactProofSmoke=20260610` returned Multiplayer content.
