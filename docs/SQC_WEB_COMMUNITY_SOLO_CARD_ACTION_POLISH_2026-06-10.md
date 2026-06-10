# SQC Web Community Solo Card Action Polish — 2026-06-10

## Sprint slice
Continued the 24h SQC website UX parity review with visible Community Solo browse polish. The public Community Solo cards were carrying too many equally weighted actions and duplicate “More from…” affordances, making the browse page feel noisy compared with the app-quality goal.

## Changed
- Promoted the two primary card tasks into a clear two-button lane: `Inspect quest` and `Start from account`.
- Moved lower-priority player shelf/report actions into a quieter secondary text row.
- Turned each rule summary into a small SQC-styled pill so the verifier goal is easier to scan.
- Removed the duplicate metadata-level `More from {player}` link from each card.
- Added a mobile fallback so the two primary buttons stack cleanly on narrow screens.

## Safety / privacy
- No verifier, lifecycle, account, or persistence behavior changed.
- Public player links and support/report context remain unchanged.
- No private account metadata, raw rule data, or invite details were exposed.

## Proof
- `pnpm lint -- src/app/challenges/community/page.tsx src/app/globals.css` passed; CSS emitted the existing ignored-file warning only.
- `pnpm build` passed.
- `pnpm deploy:prod` passed, including `pnpm quest:release-gate`.
- Production deploy: `https://cc-p2aali53y-andreas-nordenadlers-projects.vercel.app`, aliased to `https://sidequestchess.com`.
- Live smoke: production and deploy `/challenges/community?cardPolishSmoke=20260610b` include `community-quest-actions`, `Start from account`, and `Report quest`, with old card copy `Start/check in account` absent.
