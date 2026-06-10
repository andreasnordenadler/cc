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

## Notes
No verifier behavior, quest release state, private metadata, or production data changed.
