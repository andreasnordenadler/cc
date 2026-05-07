# Side Quest Chess Mobile

React Native + Expo shell for the Side Quest Chess Android/iOS app.

## Architecture rule

The app must follow `sidequestchess.com` updates by reading the same backend/API state wherever practical. Do not fork quest definitions, verifier rules, proof logic, or user progress into mobile-only code.

Current first API contract:

- `GET https://sidequestchess.com/api/mobile/bootstrap`

This returns the live quest catalog and mobile compatibility metadata from the web backend.

## Local commands

```bash
pnpm --filter @sidequestchess/mobile start
pnpm --filter @sidequestchess/mobile ios
pnpm --filter @sidequestchess/mobile android
pnpm --filter @sidequestchess/mobile typecheck
```

Set a non-production API while developing with:

```bash
EXPO_PUBLIC_SQC_API_BASE_URL=http://localhost:3000 pnpm --filter @sidequestchess/mobile start
```

## Current scope

This is the first foundation, not the finished app. It currently:

- loads the live web-backed quest catalog;
- renders a mobile quest rail;
- renders quest detail, badge art, rules, and proof callout;
- documents the anti-drift rule in-app.

Next app milestones:

1. Add authenticated mobile account API contract.
2. Add sign-in and chess username connection.
3. Add start/check/reset quest actions.
4. Add proof image viewer and native share sheet.
5. Add EAS build profiles for Android/iOS.
