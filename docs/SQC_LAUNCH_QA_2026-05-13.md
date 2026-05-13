# SQC launch QA — 2026-05-13

## Scope

Launch-readiness QA for Side Quest Chess after homepage, account, and Multiplayer Side Quest polish.

## Automated checks added

- `pnpm qa:launch:providers`
  - Calls public Lichess latest-game API for `and72nor`.
  - Calls public Chess.com archives + latest monthly games for `and72nor`.
- `pnpm qa:launch:local`
  - Creates a dedicated Clerk QA user in the configured local/dev Clerk instance.
  - Uses a Clerk sign-in token to authenticate without email-code/manual inbox friction.
  - Opens the app in Playwright/Chrome and clicks through the core launch loop.

## Results from this run

### Provider/API checks

Command: `pnpm qa:launch:providers`

Result: PASS

Evidence:

- Lichess returned HTTP 200 for `and72nor` latest games.
  - Latest game id observed: `YlD9jBZQ`
  - Moves present: yes
- Chess.com returned HTTP 200 for `and72nor` latest archive.
  - Archive observed: `https://api.chess.com/pub/player/and72nor/games/2026/05`
  - Latest game observed: `https://www.chess.com/game/live/168306672352`
  - PGN present: yes
  - Time class: `bullet`

### Local authenticated browser click-through

Command: `SQC_BASE_URL=http://localhost:3000 pnpm qa:launch:local`

Result: PASS

QA user created in local/dev Clerk:

- User id: `user_3DfjyLz8teghW8MBm21ztzhnHLc`
- Email: `sqc.qa.202605131351@example.com`

Passed browser checks:

1. Signed-out homepage loads.
2. QA user signs in with Clerk sign-in token.
3. Profile saves public chess usernames: `and72nor` / `and72nor`.
4. `Any Game Counts` activates and completes from real public username data.
5. Signed-in Multiplayer pages click through:
   - `/groupquests`
   - `/groupquests/public`
   - `/groupquests/gq_demo_no_castle_01`

Screenshot artifact from the final local run:

- `tmp/sqc-launch-clickthrough-final.png` (ignored local QA artifact)

## Notes / limitations

- Production signed-in automation still needs either:
  1. a dedicated production Clerk QA user + reliable sign-in-token/allowed redirect setup, or
  2. Andreas's already-signed-in Chrome session exposed through OpenClaw browser attach.
- Attempting to attach OpenClaw to the Mac's normal Chrome profile did not connect because Chrome was not exposing the expected DevTools attach file for the `user` browser profile.
- The existing older fixture tests under `tests/*.mjs` are not currently a clean launch gate: raw Node/TS execution fails on module/import/export compatibility. The new launch QA scripts are separate and passed.

## Current launch confidence

Green for:

- public landing/navigation smoke;
- public Multiplayer pages;
- public Lichess/Chess.com API reachability for a real username;
- local authenticated Clerk user flow;
- profile username save;
- starter quest activation/completion/result loop using real public provider data.

Yellow follow-up:

- add a production QA auth path that does not depend on Andreas's personal login session.
- repair or replace the older `tests/*.mjs` verifier fixture runner so it can become a reliable CI gate.
