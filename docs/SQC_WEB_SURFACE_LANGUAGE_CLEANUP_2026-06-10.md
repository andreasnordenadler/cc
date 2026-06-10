# SQC website surface language cleanup — 2026-06-10

## Slice
Continued the UX parity sprint language pass by removing the remaining player-visible web-vs-mobile phrasing that made Community Solo and Official Leaderboards sound like an implementation comparison instead of a cohesive SQC product.

## Changes
- Reframed Community Solo browse guidance from “roomy web view / compact mobile flow” to a single SQC account path for discovery, proof, reporting, and rewards.
- Replaced Community Solo detail action cards with player-facing “Recipe review” and “Account handoff” language.
- Updated the Official Leaderboards hero to avoid “without needing the mobile app” and present the page as the SQC leaderboard hall.
- Cleaned the mobile profile API success message from “mobile and website sync” to “saved to your SQC account.”

## Proof
- `grep -RInE "web view|mobile flow|mobile app|website sync|website creator|Website creator|website-first|Website-first|web-first|website or app|switch to mobile" src/app src/components src/lib` now only finds the admin-only support-thread label.
- `pnpm lint -- src/app/challenges/community/page.tsx 'src/app/challenges/community/[id]/page.tsx' src/app/scoreboard/page.tsx src/app/api/mobile/profile/route.ts`
- `pnpm build`
- `pnpm deploy:prod` including `pnpm quest:release-gate`; first attempt correctly blocked until the focused commit was pushed, then production deploy `https://cc-7sr44mn6m-andreas-nordenadlers-projects.vercel.app` was aliased to `https://sidequestchess.com`.
- Live smoke on production returned 200 for `/challenges/community?surfaceLanguageSmoke=20260610`, `/challenges/community/seed-opening-hipster-32-1?surfaceLanguageSmoke=20260610`, and `/scoreboard?surfaceLanguageSmoke=20260610`, confirming new copy and absence of the old `Roomy web view`, `Compact mobile flow`, and `mobile app` strings on those surfaces.

## Notes
No verifier behavior, quest release state, private metadata, or production data changed.
