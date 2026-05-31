# SQC Mobile Release Pipeline

Updated: 2026-05-31

## Goal

Make Android beta releases boring, repeatable, signed, and easy to verify without committing APK binaries to git.

## One-command release

Use:

```bash
pnpm mobile:release
```

Or, to also publish the APK/SHA as a GitHub Release asset:

```bash
pnpm mobile:release:github
```

The script:

1. Bumps `apps/mobile/app.json` patch version and Android `versionCode`.
2. Runs high/critical production audit gate.
3. Runs mobile typecheck.
4. Runs targeted mobile ESLint.
5. Runs SQC quest release gates.
6. Runs Next production build.
7. Runs Android `lintRelease`.
8. Builds Android release APK.
9. Copies the APK to `artifacts/mobile-releases/`.
10. Writes a `.sha256` file.
11. Verifies APK manifest version/name/code.
12. Verifies `debuggable=false`.
13. Verifies the signer is not the Android Debug certificate.
14. Optionally creates a GitHub Release tag like `mobile-v147`.

## Signing

Release builds intentionally fail if signing credentials are missing.

Accepted signing sources:

- Environment variables:
  - `SQC_ANDROID_KEYSTORE_PATH`
  - `SQC_ANDROID_KEYSTORE_PASSWORD`
  - `SQC_ANDROID_KEY_ALIAS`
  - `SQC_ANDROID_KEY_PASSWORD`
- Or local untracked `apps/mobile/credentials.json` in the Expo/EAS shape.

Never commit keystores or credentials.

## Artifacts

APK artifacts now belong outside git:

- Local build output: `artifacts/mobile-releases/`
- Preferred tester distribution: GitHub Releases first, Google Play Internal Testing next.

`.gitignore` blocks new APK/SHA files under `public/downloads/` so we stop adding 100 MB APKs to commits.

## Latest pipeline-produced release

- GitHub Release: `https://github.com/andreasnordenadler/cc/releases/tag/mobile-v147`
- APK asset: `sqc-mobile-android-v147-2026-05-31.apk`
- Version: `0.1.147`
- Version code: `147`
- SHA256: `e6cb92393fc5d02e76994b516a26b0c4387f144907c56eb6f3d376603a1cdb87`

## Current next operational step

Install the signed v147 APK on a real Android device and smoke:

- sign-in
- account bootstrap
- start official Solo quest
- create/save/start custom Side Quest
- check failure/pass path
- diagnostic board rendering
- support form

