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
- Commit/deploy: commit `624d48a` (`Match SQC custom builder to app`) pushed to `main`; guarded `pnpm deploy:prod` deployed `https://cc-ikza7bbn0-andreas-nordenadlers-projects.vercel.app` and aliased it to `https://sidequestchess.com`.
- Live proof: `https://sidequestchess.com/create-custom-side-quest` returned 200; live DOM smoke returned `isImmersive=true`, `bgTop=#352021`, `hasGenericHeader=false`, `optionCount=5`, and `footerPosition=static`; Sam Android Chrome screenshot `artifacts/sqc-parity-create-custom-2026-07-09/android-chrome-create-custom-live.png` shows the logged-in page with app-like hamburger/close controls and the maroon builder; Vercel 500 scan over 30 minutes returned `total: 0`.
- Note: fresh Android app login was not available in the emulator snapshot, which launched signed out. The app side used current `apps/mobile/App.tsx` builder source for the screen geometry; the web side used the logged-in Sam Android Chrome state before and after deploy.

## 2026-07-09 Active Solo Detail Slice

- Target: Sam's logged-in active Solo detail, `Knights Before Coffee`.
- App evidence inspected before edit: current `apps/mobile/App.tsx` active Solo card opens `CurrentSideQuestDetailModal`; the modal renders coat glow hero, active/completed pill, `Do this next`, native condition rows, proof board/status summary, and refresh/check affordances.
- Web evidence before edit: `artifacts/sqc-parity-active-solo-detail-2026-07-09/web-active-detail-before.png`; production `/challenges/knights-before-coffee` showed a generic `Solo Side Quests` title card, generic proof panel, option-card conditions, and no active proof board/status summary for Sam's active quest.
- Web change: `/challenges/[id]` now detects when the logged-in user is viewing their current active Solo challenge and switches only that state to an app-like active detail layout; non-active Solo detail pages keep the existing generic layout.
- Checks: `pnpm quest:release-gate`, `pnpm lint` passed with 4 existing warnings, and `pnpm build` passed.
- Commit/deploy: commits `97d6f35` (`Match SQC active solo detail to app`) and `622f423` (`Preserve SQC condition release gate`) pushed to `main`; guarded `pnpm deploy:prod` deployed `https://cc-ipqgivzyf-andreas-nordenadlers-projects.vercel.app` and aliased it to `https://sidequestchess.com`.
- Live proof: `https://sidequestchess.com/challenges/knights-before-coffee` returned 200; logged-in Sam browser snapshot showed `Active Solo Side Quest`, `Do this next`, the mini board/status summary, and compact `Conditions` rows; live screenshot saved at `artifacts/sqc-parity-active-solo-detail-2026-07-09/web-active-detail-live.png`; recent Vercel log grep for `error|500|exception` returned no matches.

## 2026-07-09 Community Solo Catalog Slice

- Target: logged-in Community Solo / Community Side Quests catalog.
- App evidence inspected before edit: current `apps/mobile/App.tsx` Community Side Quests branch renders the crest, Official/Community brand tabs, `Pocket tracker for borrowed bad ideas.` intro panel, Discover/My Library segmented control, search/filter controls, and dark community rows; same-sprint app screenshot exists at `artifacts/mobile-smoke/sqc-mobile-v237-community-solo.png`.
- Visible difference before edit: web `/community-side-quests` still used a generic `MobileSimpleScreen` empty state with the old identity header/teal shell and no public Community Solo rows, while the app showed the full Community Solo Discover catalog.
- Web change: `/community-side-quests` now fetches public Community Side Quests and renders an immersive app-like Community Solo Discover screen with gold/brown theming, no identity header, app brand tabs, the app intro copy, Discover/My Library segmented control, search/filter visuals, and dark rows with Community badges and Ready status.
- Local proof: `artifacts/sqc-parity-community-solo-2026-07-09/web-community-solo-local-final.png`; DOM smoke returned `title=Community Solo Discover`, `count=48/48`, `rowCount=12`, `firstRow=Sunlit Rook Errand mr1aozmr`, `activeTabColor=rgb(96, 240, 175)`, `bgTop=#8a6f3d`, `hasIdentityHeader=false`, and `hasOldEmptyTitle=false`.
- Checks: `pnpm lint` passed with 4 existing warnings; `pnpm build` passed.
- Commit/deploy: commit `c56a83d` (`Match SQC community solo catalog to app`) pushed to `main`; guarded `pnpm deploy:prod` deployed `https://cc-3kjcm37r5-andreas-nordenadlers-projects.vercel.app` and aliased it to `https://sidequestchess.com`.
- Live proof: `https://sidequestchess.com/community-side-quests` returned 200; live DOM smoke returned `title=Community Solo Discover`, `count=48/48`, `rowCount=12`, `firstRow=Win the game`, `activeTabColor=rgb(96, 240, 175)`, `bgTop=#8a6f3d`, `hasIdentityHeader=false`, and `hasOldEmptyTitle=false`; live screenshot saved at `artifacts/sqc-parity-community-solo-2026-07-09/web-community-solo-live.png`; Vercel 500 scan over 30 minutes returned `total: 0`.

## 2026-07-09 Trophy Cabinet Official Coat Grid Slice

- Target: Trophy Cabinet official collection area.
- App evidence inspected before edit: current `apps/mobile/App.tsx` `CoatBoardDashboard` renders the summary cards, `Official Solo Side Quest collection`, then `compactStyles.coatGrid` with 3-column official coat tiles, 62x72 coat art, locked opacity, title, and `Locked preview` / `Unlocked` status.
- Web evidence before edit: production mobile-browser smoke saved `artifacts/sqc-parity-trophy-cabinet-2026-07-09/web-trophy-before.png` and returned `hasCoatGrid=false`, `rowCount=1`; the page stopped after the official collection copy and did not show the app's locked/earned coat grid.
- Web change: `/trophy-cabinet` now passes `CHALLENGES` into `MobileTrophyCabinetScreen`, renders the app-like official coat grid below the collection card, uses mobile badge asset paths, and mirrors the app's 3-column tile sizing and locked-preview treatment.
- Local proof: `artifacts/sqc-parity-trophy-cabinet-2026-07-09/web-trophy-local-final.png`; focused DOM smoke returned `gridCount=13`, `lockedCount=13`, `gridColumns="114px 114px 114px"`, `tileMinHeight="126px"`, and `imageSize="62px x 72px"`.
- Checks: `pnpm lint` passed with 4 existing warnings; `pnpm build` passed.
- Commit/deploy: commit `adda7e8` (`Match SQC trophy cabinet coat grid to app`) pushed to `main`; guarded `pnpm deploy:prod` deployed `https://cc-f7wwvzlro-andreas-nordenadlers-projects.vercel.app` and aliased it to `https://sidequestchess.com`.
- Live proof: `https://sidequestchess.com/trophy-cabinet` returned 200; live DOM smoke returned `gridCount=13`, `lockedCount=13`, `gridColumns="114px 114px 114px"`, `tileMinHeight="126px"`, `imageSize="62px x 72px"`, and `hasCollectionCopy=true`; live screenshot saved at `artifacts/sqc-parity-trophy-cabinet-2026-07-09/web-trophy-live.png`.
