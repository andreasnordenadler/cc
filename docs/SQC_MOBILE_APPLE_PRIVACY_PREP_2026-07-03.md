# SQC Mobile Apple and privacy prep - 2026-07-03

## Action taken

- Added a dedicated web Privacy Policy route at `/privacy`.
- Linked the Privacy Policy from `/support`, `/terms`, and the mobile app Help & Support legal panel.
- Confirmed current mobile identifiers:
  - App name: `Side Quest Chess`
  - iOS bundle ID: `com.sidequestchess.app`
  - Android package: `com.sidequestchess.app`
  - Version: `0.1.335`
  - Android versionCode: `335`
  - Production API: `https://sidequestchess.com`

## Apple prep status

Ready for App Store Connect once account access exists:

- Bundle ID candidate: `com.sidequestchess.app`
- App privacy policy URL after deploy: `https://sidequestchess.com/privacy`
- Support URL: `https://sidequestchess.com/support`
- Terms URL: `https://sidequestchess.com/terms`
- App category candidate: Games / Board or Games / Strategy
- Authentication: Clerk-backed account sign-in
- Chess proof sources: public Lichess and Chess.com usernames/game records
- No chess-site passwords requested or stored

Still blocked on Andreas/account-side input:

- Apple Developer Program team access or Team ID.
- App Store Connect app record creation permissions.
- Final company/personal seller details.
- Final store screenshots and marketing metadata approval.

## App privacy questionnaire draft

Likely data categories to disclose:

- Contact info / identifiers from account authentication, depending on what Clerk provider data is made available to SQC.
- User content or gameplay/progress content: saved profile text, public usernames, Side Quest progress, proof receipts, community quests, multiplayer participation, and support messages.
- Diagnostics / analytics: limited first-party product events and platform diagnostics if enabled for store builds.

Likely purposes:

- App functionality.
- Account management.
- Customer support.
- Analytics / product improvement.
- Fraud prevention, security, and abuse prevention.

Likely not collected:

- Chess-site passwords.
- Financial information, unless monetization is added later.
- Precise location, unless a future feature explicitly adds it.

## Verification target

Before store submission, verify:

- `https://sidequestchess.com/privacy` returns HTTP 200 after deploy.
- Mobile Help & Support opens `/privacy`, `/support`, and `/terms`.
- Store build uses production API and production Clerk publishable key.
- iOS build succeeds under the selected Apple Developer Team.
