# SQC web official proof check choices polish — 2026-06-11

Sprint: `sqc-website-ux-parity-review-24h`

## What changed

- Polished the active official Solo proof area on `/challenges/[id]` so proof choices read as two clear SQC actions instead of a loose refresh button plus an input form.
- Added an SQC-styled `Fastest check` card for the latest public Lichess/Chess.com game and a matching `Specific game` card for a known Lichess ID or Chess.com URL.
- Kept the existing verifier paths intact: latest-game checks still call `checkActiveChallenge`, and submitted game checks still call `submitChallengeAttempt`.
- Removed remaining visible `mobile-style` wording from the private Multiplayer host-code helper, replacing it with player-facing copy.
- Added mobile stacking for the proof-choice cards so the action area stays readable on narrow screens.

## Checks

- `pnpm lint -- 'src/app/challenges/[id]/page.tsx' 'src/app/groupquests/[id]/page.tsx' src/app/globals.css` — passes with the existing ignored CSS-file warning.
- `pnpm build` — passes.
- `pnpm deploy:prod` — includes `pnpm quest:release-gate`; passes.

## Production

- Commit: `901be2b` (`Polish official proof check choices`)
- Production deploy: `https://cc-b2yc3epmp-andreas-nordenadlers-projects.vercel.app`
- Alias: `https://sidequestchess.com`

## Smoke

- `https://sidequestchess.com/challenges/finish-any-game?proofChoiceSmoke=20260611` → 200 with Side Quest content.
- `https://cc-b2yc3epmp-andreas-nordenadlers-projects.vercel.app/challenges/finish-any-game?proofChoiceSmoke=20260611` → 200 with Side Quest content.
- `https://sidequestchess.com/groupquests/seed-public-sqcseed11-11?proofChoiceSmoke=20260611` → 200 with Multiplayer/leaderboard content.
- `https://sidequestchess.com/groupquests/public?proofChoiceSmoke=20260611` → 200 with Public Multiplayer content.
- Live public Multiplayer detail no longer contains the old `mobile-style joining` phrase.
- Local product-language sweep now only finds admin-only `mobile app thread` support copy for the flagged phrase family.
