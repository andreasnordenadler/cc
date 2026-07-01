# SQC Android QA Script - 2026-07-02

Tester: Andreas
Candidate: `mobile-v312`
APK: <https://github.com/andreasnordenadler/cc/releases/tag/mobile-v312>
Site: <https://sidequestchess.com>

## Goal

Confirm the Android app is ready for a small public/private-beta launch. Focus on whether a normal player can install, sign in, browse, join/play, get proof feedback, and ask for support without confusion or crashes.

## What to Record

For each failed step, write:

- App version shown by Android/install source, expected `0.1.312` / version code `312`
- Device model and Android version
- Exact screen text or behavior
- Screenshot or short clip
- Whether the issue blocks launch or is polish

## Install

1. Open the `mobile-v312` GitHub Release on the Android device.
2. Download `sqc-mobile-android-v312-2026-07-01.apk`.
3. Install the APK.
4. Launch `Side Quest Chess`.
5. Confirm the app opens to the SQC Home screen without a crash.

Blocker: APK cannot install, app crashes on launch, or Android reports a suspicious package/version mismatch.

## Signed-Out Browse

1. Stay signed out.
2. Browse Official Solo Side Quests.
3. Open one Official Solo Side Quest detail.
4. Browse Multiplayer Side Quests.
5. Open an Official/Public Multiplayer detail.
6. Confirm signed-out browsing feels understandable and does not show broken auth errors.

Blocker: signed-out browsing is blank, crashes, or exposes raw/internal error text.

## Sign In

1. Start Google sign-in.
2. Complete sign-in.
3. Confirm the app returns to SQC through the app callback.
4. Confirm Home/Account shows your runner state.
5. If you already joined a Multiplayer table, confirm Home does not say you have joined none.

Blocker: sign-in loop, failed callback, signed-in state not shown, or joined Multiplayer state missing again.

## Profile and Account

1. Open Account/Profile.
2. Confirm chess accounts are shown or can be edited.
3. Change a harmless profile field, such as display name or brag line.
4. Save, refresh/reopen Account, and confirm the change persists.

Blocker: profile save fails or Account falls back to signed-out/empty data while signed in.

## Solo Side Quest

1. Browse Official Solo.
2. Start one Side Quest.
3. Confirm Home shows it as active.
4. Open the active detail from Home.
5. Tap the proof/check action.
6. Record whether the result is passed, pending, or failed.
7. Reset/switch away only if the app clearly asks for confirmation.

Blocker: cannot start a quest, active state disappears, proof action crashes, or reset happens without confirmation.

## Custom / Community Solo

1. Create a Custom Side Quest.
2. Save it.
3. Reopen it and confirm the saved rules are still visible.
4. Browse Community Solo.
5. Open a Community Solo detail.
6. Confirm rule cards, coat art, share/report/support actions look customer-facing.

Blocker: custom quest does not save, saved rules are lost, or Community detail is blank/broken.

## Multiplayer

1. Browse Official/Public Multiplayer.
2. Join one open table if available.
3. Return to Home and confirm it appears under active Multiplayer.
4. Open the joined table from Home.
5. Refresh participant/leaderboard state.
6. If practical, create a Multiplayer Side Quest and confirm share/copy works.
7. If practical with a second account/device, join your created table.
8. Leave a joined table only after confirming the flow is clear.

Blocker: joined table does not appear on Home, table cannot be opened, participant/leaderboard refresh fails, or create/share is broken.

## Support and Trophy Cabinet

1. Send a short support message.
2. Reopen support and confirm the message history loads.
3. Open Coat of Arms / Trophy Cabinet.
4. Confirm Solo coats and Multiplayer podium/receipt items render without blank art.

Blocker: support cannot send, support history crashes, or trophy cabinet is unusable.

## Logout

1. Log out.
2. Confirm Home returns to signed-out mode.
3. Browse Solo and Multiplayer again while signed out.

Blocker: logout fails, app remains in a confused half-signed-in state, or signed-out browse breaks after logout.

## Final Verdict

Use one of these:

- Green: no blockers; only minor polish.
- Yellow: one blocker with a clear workaround or limited scope.
- Red: install/auth/core Solo/Multiplayer/support is broken.

Send Sam:

- Verdict: Green / Yellow / Red
- Device:
- APK version:
- Blockers:
- Polish notes:
- Screenshots/clips:
