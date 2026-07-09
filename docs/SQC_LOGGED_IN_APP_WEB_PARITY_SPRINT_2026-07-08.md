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

## 2026-07-09 Solo Catalog Slice

- Target: Solo Side Quest catalog segmented tabs and row-list framing.
- App evidence inspected before edit: current `apps/mobile/App.tsx` Solo catalog source renders the crest, tall `Official Side Quests` / swap / `Community Side Quests` tabs, then an unframed section header and dark row list; same-sprint Sam app screenshot exists at `artifacts/web-app-parity-2026-07-08/app-solo.png`.
- Visible difference before edit: web CSS used shorter tabs, a smaller swap button, larger Solo crest sizing, and an extra framed `.sqc-panel` wrapper around the list section.
- Web change: `src/app/mobile-web.css` now matches the app-like 62px tabs, 44px swap button, 112x124 Solo crest with 142x154 glow, and removes the extra `.sqc-panel.list` frame.
- Proof: local mobile-web screenshot `artifacts/sqc-parity-solo-catalog-2026-07-09/web-solo-catalog-local.png`; focused DOM smoke returned `officialTabHeight: 62`, `switchHeight: 44`, `panelBorder: 0px`, and the expected first Solo row.
- Checks: `pnpm lint` passed with 4 existing warnings; `pnpm build` passed.
- Deployment: not deployed in this slice. Fresh emulator capture was blocked, so this is not claimed as a fully verified same-account app/browser ship.
- Blocker and next retry: `/opt/homebrew/share/android-commandlinetools/emulator/emulator -avd sqc_pixel_35 -no-snapshot-save` exited before adb registration with `/tmp/sqc_pixel_35.log` containing only `WARNING child_port_handshake.cc:197 no client check-in`; retrying `sqc_verify_35` with `-no-window -no-audio -no-boot-anim -gpu swiftshader_indirect -no-snapshot-save` also exited before `adb devices` showed a device and wrote no useful log output. Next retry should start the emulator from an interactive desktop/session or repair emulator launch logging, then capture current app `/side-quests` and Android Chrome logged-in `/side-quests` for Sam before production deploy.

## 2026-07-09 Create Custom Side Quest Builder Slice

- Target: logged-in `Create Custom Side Quest`.
- App evidence inspected before edit: current `apps/mobile/App.tsx` `customCreateOpen` full-screen builder renders the maroon `Custom Side Quest` modal with hamburger/close controls, custom crest hero, template options, Side Quest name field, Coat of Arms preview, and completion-condition controls.
- Web evidence before edit: Sam Android Chrome screenshot `artifacts/sqc-parity-create-custom-2026-07-09/android-chrome-create-custom-before.png`.
- Visible difference before edit: mobile web still used the teal generic simple-screen route with a large `Side Quest Chess` header/coat, three row links, and no app-like builder fields.
- Web change: `/create-custom-side-quest` now uses an immersive maroon app-style builder presentation with no generic identity header, custom crest hero, template cards, Side Quest name input, Coat of Arms preview, condition-mode choices, and a non-overlapping save footer.
- Local proof: `artifacts/sqc-parity-create-custom-2026-07-09/web-create-custom-local-viewport-fixed.png`; focused DOM smoke returned `isImmersive=true`, `bgTop=#352021`, `hasGenericHeader=false`, `optionCount=5`, and static non-overlapping footer geometry.
- Checks: `pnpm lint` passed with 4 existing warnings; `pnpm build` passed.
