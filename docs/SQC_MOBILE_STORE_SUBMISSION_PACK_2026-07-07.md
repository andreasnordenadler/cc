# SQC Mobile Store Submission Pack - 2026-07-07

This is the cross-store working pack. The exact paste-ready Google Play copy and Android asset checklist live in `docs/SQC_GOOGLE_PLAY_LISTING_V340_2026-07-30.md`. Console changes, policy answers, uploads, tester assignment, and publication remain owner-gated.

## App Identity

- App name: Side Quest Chess
- Subtitle / short positioning: Chess side quests, proof receipts, and playful challenge runs.
- Android package: `com.sidequestchess.app`
- iOS bundle ID: `com.sidequestchess.app`
- Current Android candidate: `0.1.347 (348)`
- Committed Android identity: version `0.1.347`, version code `347`; EAS production auto-increment reserved candidate code `348`
- Website: `https://sidequestchess.com`
- Privacy Policy: `https://sidequestchess.com/privacy`
- Terms of Use: `https://sidequestchess.com/terms`
- Support URL: `https://sidequestchess.com/support`
- Developer / publisher public name: Crowdler AB
- Support email: `sam@crowdler.com`
- Countries / regions: Worldwide

## Google Play listing copy

Use the paste-ready app name, short description, and full description exactly as written in `docs/SQC_GOOGLE_PLAY_LISTING_V340_2026-07-30.md`. Do not copy a historical variant from this cross-store pack.

## App Store Subtitle

Chess side quests and proof receipts.

## Keywords / Tags

chess, chess challenges, side quests, lichess, chess.com, multiplayer chess, chess goals, chess training, casual chess

## Category

- Primary: Games
- Secondary / subcategory candidate: Board / Strategy
- Google Play category: Board

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

- Ads: No.
- In-app purchases: No.
- Subscriptions: No.
- Data deletion: Self-service deletion is available in the app; support remains available through `https://sidequestchess.com/support`.
- Children under 13: Not targeted.

Still requires an owner-authorized Play Console declaration:

- Exact Data safety mapping for every production provider and transport.
- Final content-rating questionnaire responses.
- App access instructions and any reviewer credential.
- Final policy/legal adoption; the live privacy and terms pages remain launch drafts.

## App Review Notes

Side Quest Chess lets users choose playful chess challenges and verify them against public game records from Lichess or Chess.com usernames they provide.

No chess-site password is requested or stored. The app uses authentication for account/profile continuity, saves Side Quest progress, and can create public proof links for completed quests. Side Quest Chess is independent from Lichess and Chess.com.

Reviewer test account:

- Do not commit credentials to this repository.
- Use an owner-authorized disposable, non-sensitive account if Play review requires authenticated access; enter credentials only in the Console's protected App access field.

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

- App icon: runtime source configured in `apps/mobile/assets/app-icon-light-blue.png`; Play export is `apps/mobile/store-assets/google-play/store-icon-512.png`.
- Adaptive icon foreground: `apps/mobile/assets/app-icon-foreground.png`.
- Feature graphic: `apps/mobile/store-assets/google-play/feature-graphic-1024x500.png`; 1,024 × 500 24-bit RGB PNG with no alpha; independently reviewed with no blocking visual or claims issue.
- Screenshots: PENDING current-candidate capture.

Apple assets:

- iPhone screenshots: PENDING TestFlight/current iOS build.
- iPad screenshots: optional, because `supportsTablet` is true; final store handling TBD.

## Current Build Artifacts

Android internal testing candidate:

- AAB: `side-quest-chess-android-v347-code348.aab`
- SHA256: `c8755b7175fc6902ec391c8ba2dc69488faf13dd0be78d321507026c89bb5576`
- EAS build: `c8290195-f35b-48b5-961d-907b7adb532b`
- Immutable source: `5ece97b95de996b630775359e312a001e58ff59c`

An APK or ADB install is not a substitute for AAB inspection or Play-delivered Internal testing acceptance.

## Submission Order

1. Owner confirms Play App Signing in the existing `com.sidequestchess.app` Console app.
2. Owner uploads the exact code-348 AAB and assigns the authorized Internal testing list.
3. Install from the private Play opt-in path and run physical-device acceptance, including installer and Play signer checks.
4. Capture the code-348 Google Play screenshot set and verify it against the exact listing checklist.
5. Complete the owner-authorized policy, app-access, target-audience, and content-rating forms.
6. Keep broader store publication blocked until legal/policy adoption and Internal testing acceptance are complete.
