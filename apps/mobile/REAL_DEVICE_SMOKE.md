# SQC Mobile Real-Device Smoke

Use this checklist before calling an APK launch-ready. Emulator-only smoke is useful, but it does **not** close the signed-device launch gate.

## Distribution rule

Until a store/TestFlight/Play track is explicitly cut, the launch candidate is the latest non-draft `mobile-v*` GitHub Release APK. Do not install from a local `dist-*` directory for the real-device gate.

Distribution status for this gate:

- Public/store channel: **not cut yet**.
- Real-device smoke source of truth: **GitHub Release APK only**.
- Store/TestFlight/Play rollout decision: **separate Andreas approval after this checklist passes**.
- If a newer `mobile-v*` release exists, update this section before testing so the recorded device evidence matches the actual candidate.

Current candidate to smoke:

- GitHub Release tag: `mobile-v331`
- Release URL: <https://github.com/andreasnordenadler/cc/releases/tag/mobile-v331>
- APK filename: `sqc-mobile-android-v331-2026-07-02.apk`
- Package ID: `com.sidequestchess.app`
- Version name: `0.1.331`
- Android version code: `331`
- APK SHA256: `bcedf46e17792f5a1c8e17aa1dd2c2349808ee0f79c87046be5d6dbbd054cc33`
- Manifest/signer proof: `pnpm mobile:release:candidate-check` verifies the APK package ID, version identity, `debuggable=false`, `allowBackup=false`, and a release certificate that is not the Android debug identity.
- Emulator/source proof: release checks through `mobile-v331` confirm the latest mobile build includes the chess ratings card render on Account, fixed hamburger `Create Multiplayer Side Quest` routing into the create draft flow, provider-specific chess rating snapshots, animated active Solo refresh, the community-creator-inspired Multiplayer create picker with catalog search/browse, source counts, max-four feedback, unsaved discard confirmation, a pinned Create action, signed-in hamburger access inside the full-screen Custom Side Quest builder, explicit Google/Facebook/username-password sign-in choices on the signed-out Account card, Google/Facebook logos on the social sign-in buttons, and matching visual treatment for both social buttons. Signed-in phone smoke remains required for the actual device gate.

## Candidate identity

- GitHub Release tag: `mobile-v331`
- APK filename: `sqc-mobile-android-v331-2026-07-02.apk`
- Package ID: `com.sidequestchess.app`
- Version name: `0.1.331`
- Android version code: `331`
- APK SHA256: `bcedf46e17792f5a1c8e17aa1dd2c2349808ee0f79c87046be5d6dbbd054cc33`
- Manifest/signer proof: `pnpm mobile:release:candidate-check` passed on 2026-07-02 14:46 CEST; GitHub Release APK package/version identity matches app config, `debuggable=false`, `allowBackup=false`, and signer is not the Android debug identity.
- Tester/device/OS: Pending physical Android device; physical-phone QA is manual on Andreas's side.
- Test time: 2026-07-02 14:46 CEST candidate identity check only.

## Install and launch

- [x] Run `pnpm mobile:release:candidate-check` and confirm the checklist, app config, release notes, SHA256 sidecar, downloaded GitHub Release APK, APK manifest, package ID, and signer all describe the same non-debuggable release candidate.
- [ ] Prefer `pnpm mobile:release:device-install` for the first real-device step: it reruns the candidate check, downloads the APK from GitHub Release, refuses emulators, verifies SHA256, installs on exactly one authorized physical Android device, confirms the installed package version, launches `com.sidequestchess.app`, and verifies it is foregrounded after launch.
- [ ] Download the APK from the GitHub Release, not a local `dist-*` directory, if installing manually.
- [ ] Verify SHA256 matches the release note if recording proof manually.
- [ ] Confirm the APK is not debuggable (`application-debuggable` absent/false) if recording proof manually.
- [ ] Confirm the APK signer is a release certificate, not the Android debug identity, if recording proof manually.
- [ ] Install on a real signed Android device.
- [ ] Launch `com.sidequestchess.app` and confirm Home loads without a crash.

## Auth and account sync

- [ ] Start Google sign-in from the app.
- [ ] Confirm Clerk returns through `sidequestchess://sso-callback`.
- [ ] Confirm Account shows signed-in runner state.
- [ ] Confirm `/api/mobile/account` accepts the mobile bearer token (not signed-out fallback JSON).
- [ ] Edit and save display name or brag line, then refresh Account and confirm it persists.

## Solo / Custom / Community

- [ ] Browse SQC Official Solo quests.
- [ ] Start a Solo quest.
- [ ] Check latest game and record success/failure receipt behavior.
- [ ] Submit explicit game/link proof.
- [ ] View proof, copy proof link when available, and invoke native share.
- [ ] Reset the active quest.
- [ ] Create a Custom Side Quest.
- [ ] Reopen/edit the saved Custom Side Quest rules and confirm saved conditions are shown.
- [ ] Start/check/reset the Custom Side Quest from the detail sheet.
- [ ] Browse Community Solo.
- [ ] Open a Community Solo detail, confirm rule-detail cards, creator context, share public link, and report/support handoff.

## Multiplayer

- [ ] Browse SQC Official and Community Multiplayer.
- [ ] Create a Multiplayer Side Quest.
- [ ] Share/copy the invite or public link.
- [ ] Join a Multiplayer Side Quest with a second account/device if available.
- [ ] Refresh participant/leaderboard state.
- [ ] Leave a joined table.
- [ ] Submit/check proof for a Multiplayer table where possible.
- [ ] Confirm host context and report/support handoff on a non-owned Community table.

## Support, trophy cabinet, and logout

- [ ] Send a support message from the app.
- [ ] Confirm prior support messages render after refresh.
- [ ] Open Coat of Arms / Trophy Cabinet and confirm Solo coats plus Multiplayer podium scrolls render.
- [ ] Log out.
- [ ] Confirm signed-out Home/Solo/Multiplayer browsing still works.

## Evidence to record

- `pnpm mobile:release:candidate-check` output, including package ID, APK SHA256, `debuggable=false`, `allowBackup=false` manifest proof, and release-signer proof.
- `pnpm mobile:release:device-install` output when available, including real-device model, serial, Android OS version, installed version identity, install success, and foreground launch success.
- Screenshots or short clips for launch, signed-in Account, Solo proof, Custom edit, Multiplayer create/join, Support, Trophy Cabinet, and logout.
- Any failed step with device, timestamp, app version, and exact observed text.
