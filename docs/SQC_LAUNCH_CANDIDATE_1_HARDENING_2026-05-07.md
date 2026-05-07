# SQC Launch Candidate 1 hardening — 2026-05-07

## Scope
Andreas approved six launch-readiness items from the external review, excluding broad mobile-web polish because a proper mobile app is planned as the next phase.

## Implemented before launch

### 1. State-aware quest CTAs
Quest detail pages now choose the primary CTA by user state:
- signed out → `Sign in to start this side quest`
- signed in without chess username → `Connect chess account`
- signed in with active quest → `Check latest game`
- signed in with chess username and no active completion → `Start this side quest`
- completed quests keep proof/share/reset actions.

### 2. Sign-in/connect reassurance
Sign-in and sign-up surfaces now repeat the trust model:
- no chess-site passwords,
- only public Lichess/Chess.com games,
- usernames can be changed / quests can be browsed before sign-in.

### 3. My Side Quests next-step hierarchy
`/account` now has a top `Next step` module that picks the correct action:
- connect chess username,
- pick a side quest,
- play then verify,
- share proof / continue after completion.

### 4. Legal/trust hygiene
Terms/support now explicitly cover:
- non-affiliation with Lichess, Chess.com, FIDE, and other chess platforms,
- public proof sharing visibility,
- SQC data deletion request path,
- public-game-only proof checks and no chess-site passwords.

### 5. Launch copy pass
Removed prominent beta/private-beta copy from launch-facing flows:
- `/beta` now redirects to `/support`,
- result support shortcut no longer says private beta,
- verifier page says launch-flow hardening instead of beta-flow hardening.

### 6. Production smoke status
Source, lint, build, and anonymous production route smoke are completed. A true authenticated production E2E with a clean user account still requires an available test login/session and should be run as the final manual launch gate.

## Verification
- `pnpm lint` passed with warnings only.
- `pnpm build` passed.
- Production smoke after deploy should include `/`, `/challenges`, `/challenges/finish-any-game`, `/account` auth redirect, `/sign-in`, `/support`, `/terms`, and `/beta` redirect.
