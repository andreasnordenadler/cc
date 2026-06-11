# SQC web support/report polish — 2026-06-11

## Slice
Continued the 24h SQC website UX parity review with support/report polish. The `/support` page now frames reports as a safe, focused proof packet, adds a compact checklist for proof/account/community reports, and highlights prefilled report context when players arrive from Community Solo or Multiplayer report links. The support form also shows clear SQC-styled chips for the details that make a report actionable, without asking for chess-site passwords, private invite codes, or raw custom rules.

## User-facing changes
- Added a `safe report` support panel with three concise report cards: proof result, what felt wrong, and community report.
- Added a context note when report links seed quest/host details into the message box, so players know they only need to add what happened.
- Added SQC-styled checklist chips for quest/table, chess username, game/proof link, and expected result.
- Preserved existing signed-in account-thread behavior and signed-out mailto fallback.

## Proof
- `pnpm lint -- src/app/support/page.tsx src/components/support-contact-form.tsx src/app/globals.css` (CSS ignored-file warning only)
- `pnpm build`
- Commit: `208dc88` (`Polish SQC support report UX`)
- `pnpm deploy:prod` including `pnpm quest:release-gate`
- Production deploy: `https://cc-5wu39oex5-andreas-nordenadlers-projects.vercel.app`
- Aliased production: `https://sidequestchess.com`

## Live smoke
- `https://sidequestchess.com/support?supportReportSmoke=20260611c` returned 200 with `Send the smallest useful proof packet`, `safe report`, and `Quest or table`.
- `https://cc-5wu39oex5-andreas-nordenadlers-projects.vercel.app/support?supportReportSmoke=20260611c` returned 200 with the same support/report polish.
- `https://sidequestchess.com/support?topic=community-multiplayer&quest=seed-public-sqcseed11-11&host=SQC%20Seed&supportReportSmoke=20260611c` returned 200 with `Report context added`, seeded quest ID, and seeded host/public-player context.
- `https://sidequestchess.com/challenges/community?supportReportSmoke=20260611c` returned 200 with Community Solo report links intact.
