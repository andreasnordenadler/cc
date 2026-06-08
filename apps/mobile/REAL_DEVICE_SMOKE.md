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

- GitHub Release tag: `mobile-v248`
- Release URL: <https://github.com/andreasnordenadler/cc/releases/tag/mobile-v248>
- APK filename: `sqc-mobile-android-v248-2026-06-07.apk`
- Version name: `0.1.248`
- Android version code: `248`
- APK SHA256: `79c37cd9d97c24d9caea466991415debf96096bbe22ca7087a45558e1ddbe8a3`

## Candidate identity

- GitHub Release tag:
- APK filename:
- Version name:
- Android version code:
- APK SHA256:
- Tester/device/OS:
- Test time:

## Install and launch

- [ ] Run `pnpm mobile:release:candidate-check` and confirm the checklist, app config, and latest GitHub Release metadata all name the same APK.
- [ ] Download the APK from the GitHub Release, not a local `dist-*` directory.
- [ ] Verify SHA256 matches the release note.
- [ ] Confirm the APK is not debuggable (`application-debuggable` absent/false).
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

- APK SHA256 and non-debuggable proof.
- Screenshots or short clips for launch, signed-in Account, Solo proof, Custom edit, Multiplayer create/join, Support, Trophy Cabinet, and logout.
- Any failed step with device, timestamp, app version, and exact observed text.
