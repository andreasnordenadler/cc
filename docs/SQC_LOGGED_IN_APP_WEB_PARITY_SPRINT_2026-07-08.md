# SQC Logged-In App/Web Parity Sprint - 2026-07-08

Owner: Sam
Duration: 16 hours
Start: 2026-07-08 23:40 Europe/Stockholm
End: 2026-07-09 15:40 Europe/Stockholm
Cadence: work every 20 minutes, verified report every 1 hour

## Mission

Make the logged-in mobile web experience on `https://sidequestchess.com` visually match the current Android app as closely as practical, screen by screen.

## Current Production Baseline

- Worktree: `/Users/sam/.openclaw/workspace/cc`
- Branch: `main`
- Production URL: `https://sidequestchess.com`
- Current production parity commit before sprint: `6a7b046`
- Stale preview worktree to avoid: `/Users/sam/.openclaw/workspace/cc-sqc-mobile-web-clean`

## Source Of Truth

The Android app is the source of truth. Do not derive new web styling from the old website or old preview branches unless the current app proves that treatment is still valid.

Use the Sam account for both app and mobile browser checks.

## Screens To Compare

- Logged-in Home / start screen
- Hamburger menu and navigation
- Active Solo card and active Solo detail
- Solo browse/catalog
- Community Solo
- Custom Solo/create flow
- Multiplayer overview
- Multiplayer public/community/detail/create surfaces
- Trophy Cabinet
- Account/settings/support surfaces

## Required Workflow

1. Capture or inspect the current Android app state for the target screen.
2. Capture the same account/state in mobile browser at `sidequestchess.com`.
3. List visible differences before editing.
4. Make the smallest web-side fix that moves the web toward the app.
5. Run relevant checks before deploy.
6. Deploy to production only after a coherent verified slice.
7. Report shipped changes with commit, deploy, live smoke, and screenshot/artifact proof.

## Visual Priorities From Andreas Feedback

- Web must not feel pushed down or web-chrome-derived compared with app.
- Header spacing, hamburger/avatar treatment, and vertical rhythm must match app.
- Active Solo card must be compact and app-like.
- Crest/card overlap and emblem scale must match app.
- Board layout, board state, and copy must match app where data allows.
- Refresh and pull-to-refresh affordances must match app.
- Multiplayer and Trophy rows must use app-native dark row geometry, not old rounded web cards.
- Bottom spacing must match app.

## Proof Rules

- Do not claim 100% parity without screenshot comparison.
- Do not send autonomous "not verified" reports from old worktrees.
- Reports must state only verified commit, route, smoke, screenshot, and deploy facts.
- If a work turn cannot inspect or edit the repo, report the tool blocker once and stop that lane rather than repeating noisy reports.
