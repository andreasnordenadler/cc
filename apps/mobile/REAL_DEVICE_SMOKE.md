# SQC Mobile Real-Device Smoke

Use this checklist before calling an Android store candidate launch-ready. Emulator-only or sideloaded-APK smoke is useful, but it does **not** close the Google Play-delivered signed-device gate.

## Distribution rule

For the current Android gate, install the exact candidate from Google Play Internal testing. Do not substitute a local build, EAS download, GitHub Release APK, or ADB install for Play-delivered acceptance.

Distribution status for this gate:

- Google Play channel: **Internal testing only; no production rollout**.
- Internal release shown by preserved Play Console evidence: `0.1.340 (341)`, available to internal testers.
- Tester access: **blocked until an owner-authorized tester list is attached and the private opt-in path is used**.
- Store publication, track promotion, tester communication, and Play Console changes remain explicit owner gates.

Current candidate status:

- Distribution: Google Play Internal testing
- Package ID: `com.sidequestchess.app`
- Version name: `0.1.340`
- Android version code: `341`
- Frozen AAB SHA256: `26e7cfdd493308947876b5373f95a7d576e656e764027ad3ac41fd244f4b0483`
- EAS build ID: `51c588b7-1374-49e1-9398-6d13085b5a0e`
- Reviewed source commit: `8eb128d81e6c05c0641ef3eb8f59704b12c38275` (merged by PR #92)
- Upload certificate SHA256: `891fdc5a80601eaa2b6db1f3fcb26ab756650179b40b3a3f5f58dd921d753cf2`
- Status: **provenance-valid internal-track candidate; tester assignment and Play-delivered physical-device acceptance pending.**
- Important: the Play-delivered APK set must match the Play **app-signing** certificate recorded in App integrity. The upload certificate above is not a substitute.

Historical quarantine record:

- `mobile-v337` remains quarantined because its immutable tag points to source identifying version code 336 while its APK identifies 337. Do not rewrite or reuse that historical tag.

## Candidate identity

The v340/code-341 AAB is the current internal-track candidate. It is not production-ready until a physical phone installs it from Google Play and the installed identity, Play signer, and product smoke all pass.

- Tester: `samnordbot@gmail.com` after owner-authorized Internal testing assignment and opt-in.
- Tester/device/OS: Pending supported physical Android device.
- Test time: Pending Play-delivered installation and smoke.

## Install and launch

- [x] Freeze the exact AAB provenance, package/version, non-debuggable production configuration, source commit, and upload signer.
- [ ] Attach an owner-authorized Internal testing email list containing `samnordbot@gmail.com` and use the generated private opt-in link.
- [ ] Sign into Google Play as the tester and install/update Side Quest Chess from Google Play, not ADB or another distribution source.
- [ ] Confirm Android reports installer/source `com.android.vending`.
- [ ] Confirm the installed package is `com.sidequestchess.app`, version name `0.1.340`, version code `341`.
- [ ] Inspect the installed base/split APK set and require its signer SHA256 to match the Play app-signing certificate shown in App integrity.
- [ ] Install on a supported physical Android device.
- [ ] Launch `com.sidequestchess.app` and confirm Home loads without a crash.
- [ ] Confirm Android Back and keyboard dismissal do not trap, crash, or freeze the app.

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

- Frozen AAB provenance: SHA-256, EAS build ID, reviewed source SHA, package/version, non-debuggable/backup configuration, and upload certificate.
- Play opt-in/install evidence without account or session secrets.
- Physical-device model, serial or redacted device identifier, Android OS version, installed package/version, `com.android.vending` installer source, launch success, and timestamp.
- Installed base/split APK signer proof matched to the Play app-signing certificate shown in App integrity.
- Screenshots or short clips for launch, Carl’s corrected active Solo board, signed-in Account, Solo proof, Custom edit, Multiplayer create/join, Support, Trophy Cabinet, Android Back/keyboard behavior, and logout.
- Any failed step with device, timestamp, app version, and exact observed text.
