# SQC Mobile Store Submission Pack - 2026-07-07

This is the working pack for Google Play and Apple App Store submission. Fields marked `PENDING ANDREAS` need owner confirmation before submission.

## App Identity

- App name: Side Quest Chess
- Subtitle / short positioning: Chess side quests, proof receipts, and playful challenge runs.
- Android package: `com.sidequestchess.app`
- iOS bundle ID: `com.sidequestchess.app`
- Version: `0.1.336`
- Android version code: `336`
- Website: `https://sidequestchess.com`
- Privacy Policy: `https://sidequestchess.com/privacy`
- Terms of Use: `https://sidequestchess.com/terms`
- Support URL: `https://sidequestchess.com/support`
- Developer / publisher public name: PENDING ANDREAS
- Support email: PENDING ANDREAS
- Countries / regions: PENDING ANDREAS

## Google Play Short Description

Turn normal chess games into playful side quests with proof receipts and rewards.

## App Store Subtitle

Chess side quests and proof receipts.

## Full Description

Side Quest Chess gives chess players small, playful challenges to complete inside real games.

Pick a Side Quest, play on your connected Lichess or Chess.com account, then let the app check the public game record. When a quest is completed, you can collect proof, build your Trophy Cabinet, and share the run.

What you can do:

- Browse official Solo Side Quests.
- Create custom Side Quests for your own challenge runs.
- Join or host Multiplayer Side Quests with friends.
- Check public chess games for proof.
- Save completed quests and proof receipts.
- Build a Trophy Cabinet of coats and rewards.
- Share public proof links when you want to show a run.
- Send support requests from inside the product.

Side Quest Chess is independent and is not affiliated with, endorsed by, or sponsored by Lichess, Chess.com, FIDE, Apple, or Google. Public chess data is checked only from the public username you connect. Do not enter chess-site passwords into Side Quest Chess.

## Keywords / Tags

chess, chess challenges, side quests, lichess, chess.com, multiplayer chess, chess goals, chess training, casual chess

## Category

- Primary: Games
- Secondary / subcategory candidate: Board / Strategy
- Final category choice: PENDING ANDREAS

## Content Rating Draft

Expected rating posture:

- No gambling.
- No real-money prizes.
- No ads expected.
- No in-app purchases expected.
- User-generated content exists through custom/community Side Quests and public proof/multiplayer contexts.
- Account sign-in exists.
- Public usernames and proof links can be visible.
- Recommended target audience: 13+.

Final rating questionnaire answers must be completed in the store consoles.

## Data Safety / Privacy Draft

Data the app may collect or process:

- Account identity from Clerk authentication.
- Email address or profile identifiers from the sign-in provider.
- Public chess usernames entered by the user.
- Public chess game references used for proof checks.
- Side Quest progress, active/completed quests, proof receipts, Trophy Cabinet state, multiplayer participation, and community/custom Side Quest content.
- Support messages and issue context submitted by the user.
- Basic diagnostics or product events if enabled by the production stack.

Purpose:

- App functionality.
- Account management.
- Quest verification.
- Public proof sharing.
- Multiplayer participation.
- Support and abuse prevention.
- Product reliability.

Likely declarations:

- Ads: No, unless Andreas decides otherwise.
- In-app purchases: No, unless Andreas decides otherwise.
- Data deletion: Available by support request through `https://sidequestchess.com/support`.
- Children under 13: Not targeted.

PENDING ANDREAS confirmation:

- Ads: no / yes.
- In-app purchases: no / yes.
- Analytics/crash providers beyond first-party hosting/Clerk: confirm.
- Public developer support email.
- Account deletion wording accepted.

## App Review Notes

Side Quest Chess lets users choose playful chess challenges and verify them against public game records from Lichess or Chess.com usernames they provide.

No chess-site password is requested or stored. The app uses authentication for account/profile continuity, saves Side Quest progress, and can create public proof links for completed quests. Side Quest Chess is independent from Lichess and Chess.com.

Reviewer test account:

- PENDING if required.
- If a test account is created, include email, password, and any connected public chess usernames here before submission.

Suggested smoke flow for reviewer:

1. Open the app.
2. Browse signed-out Solo or Multiplayer Side Quests.
3. Sign in.
4. Add a public chess username in Account.
5. Start a Solo Side Quest.
6. Open Help & Support, Trophy Cabinet, and Account.

## Screenshot Plan

Capture fresh screenshots from the current store candidate, not old web-parity artifacts.

Required phone screenshots:

1. Home / current active quests overview.
2. Solo Side Quests catalog.
3. Solo Side Quest detail with proof/check action.
4. Create Custom Side Quest.
5. Multiplayer Side Quests.
6. Trophy Cabinet.
7. Account / connected chess username.
8. Help & Support.

Optional:

- Public proof receipt.
- Community Side Quest detail.
- Multiplayer invite/join flow.

Google Play assets:

- App icon: already configured in `apps/mobile/assets/app-icon-light-blue.png`.
- Adaptive icon foreground: `apps/mobile/assets/app-icon-foreground.png`.
- Feature graphic: PENDING creation/approval.
- Screenshots: PENDING current-candidate capture.

Apple assets:

- iPhone screenshots: PENDING TestFlight/current iOS build.
- iPad screenshots: optional, because `supportsTablet` is true; final store handling TBD.

## Current Build Artifacts

Android internal testing candidate:

- AAB: `artifacts/mobile-store/sqc-mobile-android-v336-2026-07-07.aab`
- SHA256: `f29985c6f6944cb1da927c879c2266facd8953d0904507ca78888c59311321da`
- Build command: `pnpm mobile:store:android`

Android APK candidate:

- GitHub Release: `mobile-v336`
- APK: `sqc-mobile-android-v336-2026-07-03.apk`
- SHA256: `d4367b8aa64fb67726a26d2b8129eee4e04ee351a42c64a3e42a0052bc80a4f0`
- Check command: `pnpm mobile:release:candidate-check`

## Submission Order

1. Andreas confirms developer accounts/access.
2. Andreas confirms public publisher name, support email, regions, ads/IAP, and age posture.
3. Upload Android AAB to Play internal testing.
4. Complete Play Console forms from this draft.
5. Install from Play internal testing and run real-device smoke.
6. Create App Store Connect app and EAS/TestFlight build path.
7. Capture fresh screenshots from current Android and iOS candidates.
8. Submit internal/test review first, then production review after smoke passes.
