# SQC Web Community Solo Detail Action Polish — 2026-06-10

## Sprint slice
Continued the 24h SQC website UX parity review with the Community Solo detail page. The page still had a five-button hero cluster and old `Start/check in account` / `Report weird quest` wording, which felt less polished than the newly cleaned browse cards.

## Changed
- Replaced the crowded detail hero button row with a small SQC-styled action panel.
- Promoted the two main jobs into a clear primary lane: `Start from account` and `Use in Multiplayer`.
- Moved `More from {player}`, `Share public link`, and `Report quest` into a quieter secondary text row.
- Removed remaining visible `Start/check in account`, `Report weird quest`, and `Report weird quests` wording from Community Solo browse/detail surfaces.
- Added mobile stacking for the detail primary actions.

## Safety / privacy
- No verifier, lifecycle, account, analytics storage, or persistence behavior changed.
- Community player links, share links, and report/support URLs remain unchanged.
- No private account metadata, private rule data, or invite details were exposed.

## Proof
- `pnpm lint -- src/app/challenges/community/page.tsx 'src/app/challenges/community/[id]/page.tsx' src/app/globals.css` passed; CSS emitted the existing ignored-file warning only.
- `pnpm build` passed.
- `pnpm deploy:prod` passed, including `pnpm quest:release-gate`.
- Production deploy: `https://cc-mjbyv37jy-andreas-nordenadlers-projects.vercel.app`, aliased to `https://sidequestchess.com`.
- Live smoke: production and deploy `/challenges/community/seed-opening-hipster-32-1?detailActionSmoke=20260610b` include `community-detail-action-panel`, `Start from account`, and `Report quest`, with `Start/check in account`, `Report weird quest`, and `Report weird quests` absent. Production `/challenges/community?detailActionSmoke=20260610b` also shows the cleaned browse copy.
