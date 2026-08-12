# Google Play Internal testing baseline and future candidate plan — Android code 350

Reconciled: 2026-08-12
Status: code 350 is published to Internal testing and physically approved; production remains blocked

## Authoritative Play baseline

- Existing Play Console app: **Side Quest Chess** (`com.sidequestchess.app`), published by Crowdler AB.
- Published Internal testing release: `0.1.349` / Android version code `350`.
- Immutable source: `189c93a350eb48d2a325f3a3f4edd99ed110c4b5`.
- EAS build: `462821e5-6e2a-47c2-bfb8-0c2debcb0e34` (`production` / `STORE`).
- AAB SHA-256: `8003d55e46ed443dd34a9a9a6778334e5abf50081b417fd98685a2620778d01c`.
- Production API: `https://sidequestchess.com`.
- Internal testing is complete; do not upload or publish code 350 again. Expanded release details confirming code 350 are authoritative over stale release-title text.
- Production is inactive and unauthorized.

## Tester baseline

Exactly these two approved testers must remain:

1. `samnordbot@gmail.com`
2. `andreas.nordenadler@gmail.com`

Do not add or remove testers without explicit owner approval. Do not replace this two-person list with an older single-tester plan.

## Acceptance evidence and limits

Andreas enrolled, installed, launched, and approved the Play-delivered app and launcher logo on a Samsung Galaxy S24 Ultra through the existing Internal testing track.

Exact-artifact Android evidence also covers compact, narrow, standard, tall, wide, enlarged font, and enlarged display profiles. That seven-profile responsive matrix is emulator-derived engineering evidence, not a claim that every profile was physically tested. A future substantive runtime change must repeat the responsive matrix and receive appropriate physical-device acceptance before production consideration.

## Future candidate rule

Create code `351` or later only after a substantive mobile source or release-input change. Do not increment versions, rebuild identical bytes, or create a replacement candidate merely for activity. Before freezing a future candidate:

1. Reconcile current `origin/main`, mobile/Android worktrees, open PRs, artifacts, and Play state.
2. Add behavior tests first and record expected RED, focused GREEN, and full regression evidence.
3. Run the real mobile release gates, typecheck, strict lint, tests, production build, Expo Doctor, dependency audit, and Android release lint against the exact source.
4. Verify compact, narrow, standard, tall, and wide phones plus enlarged font and display scales; preserve configuration, interaction, crash/ANR/freeze, clipping, overlap, keyboard, navigation, and Android Back evidence.
5. Bind source SHA, EAS build/fingerprint, package, version, artifact hash/size, upload signer, SDK levels, permissions, endpoint, and rollback handle.
6. Obtain independent review, required CI, and preview/release-gate evidence before requesting any Play action.

## Production-readiness contract

Store facts remain: Worldwide availability; 13+ and not directed to children under 13; free; no ads, in-app purchases, subscriptions, or real-money prizes; Swedish law; Crowdler AB publisher; and `sam@crowdler.com` support, privacy, and moderation contact.

Before a production request, reconcile the listing copy, phone screenshots, feature graphic and rights/provenance, Data safety, App access, target audience, content rating, privacy/terms adoption, moderation/reporting, account deletion, release notes, staged-rollout percentage, halt criteria, and rollback procedure. Production rollback must identify the last known-good Play release and preserve server/API compatibility; stopping rollout or shipping a corrective higher version requires its own authorized Play action.

Google Play upload, Internal-track update, production rollout, store publication, tester mutation, and declaration changes require explicit owner approval. This plan grants no authority for app/account creation, signing-key changes, legal or financial changes, secrets, destructive actions, or external communication.
