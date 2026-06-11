# SQC Web Official Solo Lifecycle Next-Step Polish — 2026-06-11

## Slice

Continued the SQC website UX parity sprint by polishing the official Solo Side Quest lifecycle controls on `/challenges/[id]`.

## User-visible changes

- Replaced the bare hero action row for unfinished official Solo quests with an SQC-styled `Next step` panel.
- The panel now explains the right action for signed-out users, users missing a chess username, active quest runners, and ready-to-start runners.
- Start/check/deactivate controls stay in the same verifier/lifecycle paths, but are framed with run setup facts: proof source, verifier path, and reward.
- Added responsive layout rules so the panel stacks cleanly on narrow screens while preserving the established SQC look and feel.

## Safety / behavior

- No verifier behavior changed.
- No quest release/pickability changed.
- No production data mutated.
- Only official Solo detail presentation and CSS changed.

## Proof

- `pnpm lint -- 'src/app/challenges/[id]/page.tsx' src/app/globals.css` (CSS ignored-file warning only)
- `pnpm build`
- Committed/pushed code: `581cb27` (`Polish official Solo lifecycle next step`)
- `pnpm deploy:prod` including `pnpm quest:release-gate`
- Production deploy: `https://cc-6soxpnktv-andreas-nordenadlers-projects.vercel.app`
- Aliased production: `https://sidequestchess.com`
- Live smoke passed:
  - `https://sidequestchess.com/challenges/finish-any-game?lifecycleNextStepSmoke=20260611c` → 200 with `Next step` / `Proof source`
  - `https://cc-6soxpnktv-andreas-nordenadlers-projects.vercel.app/challenges/finish-any-game?lifecycleNextStepSmoke=20260611c` → 200 with `Next step` / `Proof source`
  - `https://sidequestchess.com/challenges?lifecycleNextStepSmoke=20260611c` → 200 with Side Quest hub content
  - `https://sidequestchess.com/groupquests/public?lifecycleNextStepSmoke=20260611c` → 200 with Public Multiplayer content
