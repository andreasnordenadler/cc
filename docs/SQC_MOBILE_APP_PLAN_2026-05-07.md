# Side Quest Chess Mobile App Plan — 2026-05-07

## Core principle

The SQC mobile app must follow the website automatically as much as practical.

Andreas explicitly said this is important: **when `sidequestchess.com` is updated, the Android/iOS app should follow those updates.**

Therefore the app should not become a separate fork of product logic.

## Recommended architecture

Build the app as a mobile client for the existing Side Quest Chess backend, not as a separate product.

### Single source of truth

Keep these owned by the web/backend layer:

- quest definitions and release schedule;
- verifier rules;
- user progress and active quest state;
- points, proof receipts, completed quests, reset/repeat behavior;
- proof image generation;
- legal/support copy where possible;
- launch-candidate product rules.

The mobile app should fetch and render that state rather than duplicating it locally.

### Shared package / API contract

Preferred implementation direction:

1. Extract shared product contracts into a reusable package or clearly versioned API layer:
   - challenge schema;
   - proof receipt schema;
   - active quest/progress shape;
   - public copy constants where useful.
2. Add app-facing API routes to the existing SQC backend:
   - list quests;
   - get quest detail;
   - get my account/progress;
   - connect/update chess usernames;
   - start/deactivate/reset quest;
   - check latest game;
   - get proof/share metadata.
3. Build the mobile app with React Native + Expo/EAS as a thin native client.
4. Add compatibility/version checks so the app can warn or require update only when the API contract truly changes.

## Update-following rule

Every future SQC web change should be classified as one of:

- **Backend/shared:** app follows automatically because it reads the same API/data.
- **Shared UI/copy:** update shared constants/components or mirrored app screen in the same PR.
- **Web-only:** explicitly document why the app does not need the change.
- **App-only:** explicitly document why the website does not need the change.

No product change should silently diverge between web and app.

## App v1 scope

Start with feature parity for the core loop:

- Sign in.
- Connect Lichess / Chess.com usernames.
- Browse side quests.
- View quest detail.
- Start one active quest.
- Check latest public game.
- See passed/failed/pending receipts.
- View completed proof image.
- Share/download proof image using native share sheet.
- Reset/repeat completed quest.
- My Side Quests / trophy cabinet.

## Mobile-native improvements

The app can improve mobile UX without changing product logic:

- native share sheet;
- save proof image to photos/files;
- push/local reminder after starting a quest;
- better mobile account/quest navigation;
- deeplinks to quest/proof pages;
- app-store friendly onboarding.

## Anti-goals

- Do not duplicate verifier rules in the app.
- Do not fork quest data into app-only hardcoded lists.
- Do not make mobile releases manually chase web copy/logic if the backend can provide it.
- Do not turn the app into a separate roadmap unless Andreas explicitly chooses that later.

## First implementation step

Before writing the Expo app, create the app-facing API contract and decide what can be shared directly from the current Next/SQC codebase. This reduces long-term drift and makes the app follow website updates by default.
