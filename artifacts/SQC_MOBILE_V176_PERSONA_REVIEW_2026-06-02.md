# SQC Mobile v176 Persona Review — 2026-06-02

## Build reviewed
- Android version: `0.1.176` / versionCode `176`
- APK: `apps/mobile/android/app/build/outputs/apk/release/app-release.apk`
- SHA256: `1fc685dc8eba1e20ca07398deb0cb84d96032b7c6915963a16a6ecc42d06487c`
- Emulator screenshots: `artifacts/emulator-screenshots/sqc-v176-persona-review/`

## Passed
- Dashboard now exposes clearer primary actions:
  - `Browse / Create Solo`
  - `Join / Create Multiplayer`
  - `Check my latest game`
  - `Switch Quest`
- Active Solo proof loop is clearer:
  - `How proof works` 3-step explainer is visible.
  - `Last proof check` replaces vague `Latest check` wording.
  - Proof status explains `no new eligible game found`.
- Custom quest requirement copy is normalized:
  - Visible screens show `Win a game.`.
  - No `Game result must be win.` appeared in the reviewed emulator screenshots.
- Multiplayer room detail uses clearer room terminology:
  - `HOSTED ROOM`
  - `QUESTS IN THIS ROOM`
  - `4 Side Quests to complete.`
- Persisted hosted-room invite copy cleanup works:
  - Old saved `same bad idea` default copy no longer appears in the final hosted-room detail screenshot.
- Quest rows remain reachable after scrolling, including the custom quest row.

## Remaining polish notes
- Invite panel still says `Send this Multiplayer Side Quest from any chat app.`; acceptable for v176, but `Send this room invite from any chat app.` would be more terminology-consistent.
- The active proof explainer is clear, but a true vertical numbered list would scan slightly better than inline numbered text.
- The floating scroll/down chevron remains visually ambiguous in dense lists; keep as a future small polish candidate.

## Verification run
- `pnpm --filter @sidequestchess/mobile typecheck` — passed.
- `pnpm exec eslint apps/mobile/App.tsx` — passed.
- `pnpm quest:release-gate` — passed.
- `pnpm build` — passed with existing Next workspace-root warning only.
- Android `./gradlew :app:lintRelease :app:assembleRelease` — passed.
- Emulator install via `adb install -r` — passed.
- Signed-in emulator visual review — passed for targeted v176 flows.
