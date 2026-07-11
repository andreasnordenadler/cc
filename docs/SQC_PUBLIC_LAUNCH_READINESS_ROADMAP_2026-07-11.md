# SQC public-launch readiness roadmap

**Status:** not ready for public web launch or store submission  
**Evidence cutoff:** 2026-07-11, repository `4f9022ca`, GitHub releases through `mobile-v337`  
**Scope:** production web, Google Play Android, Apple App Store iOS  
**Owners:** **Hermes** = repository implementation/automation/evidence; **Andreas/external** = accounts, policy decisions, credentials, console actions, and approval.

This is the launch single source of truth. It extends—not duplicates—the product backlog in `ROADMAP.md`. Existing product gaps remain there (especially Multiplayer rule enforcement and verifier diagnostics); this document adds the bounded public/store gates required to launch safely. No date is implied: launch happens only when every applicable P0 gate below is green.

## Evidence snapshot

| Area | Verified baseline | Material gap |
| --- | --- | --- |
| Web/deploy | Live read-only checks returned HTTP 200 for `/`, `/privacy`, `/terms`, `/support`, `/help-support`, `/robots.txt`, and `/sitemap.xml`. HTTPS sends HSTS. Signed-out `/api/mobile/account` returned the expected 401 JSON boundary. | `/privacy` currently redirects to `/support`, so there is no dedicated policy body. No production authenticated smoke path, release SLO/rollback drill, or demonstrated error alerting. Response inspection did not show CSP, `X-Content-Type-Options`, `X-Frame-Options`, or Referrer-Policy headers. |
| CI/QA | `.github/workflows/ci.yml` runs unit tests, lint, mobile typecheck, and web build. Playwright covers five desktop public flows and two Pixel 7 overflow flows. Multiplayer regression tests exist. | Browser tests are not invoked by CI. No automated authenticated production smoke, accessibility audit, performance budget, iOS build/test, or store-install test. |
| Android | `app.json` has package `com.sidequestchess.app`, version `0.1.337` / code 337, no requested permissions, `allowBackup=false`, and production API. Non-draft GitHub release `mobile-v337` has APK SHA256 `6c13438f…ffc0c`. Android release workflow and AAB command exist. | Store docs and `REAL_DEVICE_SMOKE.md` still point to v336. No Play Console/internal-track install evidence, completed physical-device checklist, finalized Data Safety/listing, or current-v337 AAB provenance. |
| iOS | Bundle ID `com.sidequestchess.app`, URL scheme `sidequestchess`, EAS production profile, and `supportsTablet=true` are configured. | No checked-in/generated iOS project, successful signed archive, TestFlight build/install, iPhone/iPad QA, Apple credential proof, or callback proof. |
| Privacy/deletion/support | Support UI/API and legal routes exist; mobile Help links legal/support surfaces. | No in-app or web account-deletion implementation was found. Store draft only promises deletion by support request. Privacy/data-retention/subprocessor/UGC-moderation declarations are drafts pending owner confirmation. |
| Auth/data | Clerk auth and bearer-protected mobile APIs exist; public Lichess/Chess.com proof sources are documented. | Production authenticated QA is unresolved. Social-provider configuration and iOS/Android deep-link callback behavior are not proven end to end. |
| Analytics/operations | First-party Clerk-metadata events and admin analytics exist. | No crash/error provider, alert route, retention policy, operational dashboard/SLO, or incident/rollback runbook is demonstrated. |
| Accessibility/performance | Mobile uses many accessibility roles/labels; public tests use semantic roles. Next core-web-vitals ESLint config is present. | No WCAG/VoiceOver/TalkBack/keyboard audit, axe gate, reduced-motion/dynamic-type evidence, Lighthouse/Web Vitals budget, cold-start/API latency budget, or low-end-device evidence. |

## P0 — launch blockers

| Gate / work item | Platforms | Acceptance criteria / production-store gate | Dependencies | Owner |
| --- | --- | --- | --- | --- |
| **P0.1 Publish an accurate privacy policy and declarations** | Web, Android, iOS | `/privacy` contains a stable policy body (not a support redirect) covering controller/contact, collected data, purposes, public content, Clerk/chess providers/hosting, retention, deletion, security, children/age posture, regions, and change date. Store Data Safety and App Privacy answers match source behavior and the policy. Legal text is owner-approved and all URLs return 200 without auth. | Final publisher identity, support email, regions, analytics/ads/IAP/age decisions. | Hermes implementation/evidence; Andreas/legal approval and console declarations. |
| **P0.2 Ship account deletion** | Web, Android, iOS | A signed-in user can initiate deletion in-app without contacting support; UI explains scope and any confirmation/re-authentication. Backend deletes the Clerk user and SQC metadata/content or documents lawful retention. Public deletion URL/instructions exist for Play. Automated authorization tests plus Android and iOS end-to-end evidence prove success, cancellation, stale-token handling, and signed-out state. | Retention/public-UGC policy; Clerk deletion API; owner approval for irreversible semantics. | Hermes; Andreas approves policy. |
| **P0.3 Close critical product-integrity gaps already reconciled in `ROADMAP.md`** | Web, Android, iOS | Multiplayer proof enforces selected provider/time control/rated/color rules with tests across web/mobile refresh. Official verifiers expose one structured first-failure contract and both clients render actionable diagnostics. No open severity-1 integrity defect. | Existing provider normalization and verifier work. | Hermes. |
| **P0.4 Establish a reproducible release candidate and freeze** | All | One commit SHA is named for web + mobile contracts. CI is green; lockfile install is reproducible; version/store artifacts derive from that SHA; release notes, checksums, signer identity, rollback target, and freeze exceptions are recorded. Any post-freeze change creates a new candidate and repeats affected gates. | P0 product fixes complete. | Hermes evidence; Andreas go/no-go. |
| **P0.5 Production web release gate** | Web | CI runs unit, lint, typecheck, build, and Playwright public desktop/mobile suites. A dedicated non-personal production QA account proves sign-in, username save, Solo proof, Multiplayer create/join/refresh, support, deletion cancellation, and logout. Security headers are deliberately configured/tested. Error alerting and rollback procedure are exercised. Smoke runs against the candidate before and after deploy; no production change occurs from this roadmap PR. | Production QA identity; monitoring destination; Vercel/Clerk access. | Hermes automation; Andreas/external credentials and deploy approval. |
| **P0.6 Android internal-track gate** | Android | Store artifact is a signed **AAB** from the frozen SHA/version; candidate check proves package/version, non-debuggable, `allowBackup=false`, checksum, and release signer. Upload to Play internal testing succeeds. Install **from Play** on a physical supported device and complete `REAL_DEVICE_SMOKE.md`, including auth callback, proof, Multiplayer, support, deletion, and logout. Pre-launch report has no unresolved blocker. | Play developer account/app, signing continuity, current checklist update. | Hermes artifact/checks; Andreas/external console and physical-device actions. |
| **P0.7 iOS TestFlight gate** | iOS | App Store Connect record and signing are configured; production EAS/iOS archive succeeds from frozen SHA. Install from TestFlight on a physical iPhone; prove `sidequestchess://sso-callback`, auth, account sync, proof, Multiplayer, support, deletion, share links, logout, offline/error states, and no launch crash. Because `supportsTablet=true`, either supply valid iPad UX/screenshots or deliberately disable tablet support before submission. | Apple Developer/App Store Connect team, credentials, test hardware. | Hermes config/QA; Andreas/external account, signing, TestFlight. |
| **P0.8 Store truth and review pack** | Android, iOS | Publisher/support details, countries, category, age/content rating, ads/IAP, UGC/public-content behavior, reviewer notes/account, privacy forms, support/deletion URLs, and current-candidate screenshots are complete and mutually consistent. Feature graphic/icon/screenshots pass console validation. Review credentials are stored only in the store console—not Git/docs. | P0.1/P0.2; account decisions; current builds. | Hermes drafts/evidence; Andreas final answers/submission. |
| **P0.9 Accessibility and critical-device QA** | All | Keyboard-only web smoke, visible focus, labels/errors, zoom/reflow, contrast, and automated axe checks pass critical routes. VoiceOver (iOS) and TalkBack (Android) complete auth, core quest/proof, support, and deletion. Reduced-motion and text scaling do not block use. Supported browser/OS/device matrix is documented; no severity-1/2 accessibility defect remains. | Physical iOS/Android candidates. | Hermes automation/fixes; Andreas/external physical-device evidence as needed. |
| **P0.10 Monitoring, support, and incident readiness** | All | Named support inbox/operator and response path are live. Production has actionable frontend/server/mobile crash/error signals with alert recipient, privacy-safe diagnostics, release/version correlation, and tested alert delivery. Define launch SLOs and rollback/disable criteria; perform one non-destructive rollback/incident tabletop. | Provider/account decisions and alert destination. | Hermes implementation/runbook; Andreas on-call and provider approval. |

## P1 — required launch hardening (complete before broad promotion)

| Work item | Acceptance criteria | Dependencies | Owner |
| --- | --- | --- | --- |
| Performance budgets | Record p75 Core Web Vitals for key public/authenticated routes; set CI Lighthouse budgets. Measure Android/iOS cold start, memory, bundle size, and key API latency on representative devices. Fix regressions above agreed budgets. | Frozen near-final candidate; analytics choice. | Hermes; Andreas approves budgets. |
| Auth/provider matrix | Prove supported email/social methods and redirect/logout/reinstall/session-expiry behavior on web, Android, and iOS. Remove any visible provider that is not production-configured. | Clerk/provider console access. | Hermes; Andreas/external configuration. |
| UGC/community safety | Publish report/block/removal workflow, moderation owner, prohibited-content rules, and review SLA for custom/community quests and public proof/player names. Verify report flow preserves actionable context without exposing secrets. | Policy decision/support operations. | Hermes workflow; Andreas moderation owner. |
| Data lifecycle and recovery | Document retention/export/deletion semantics, metadata size/scale limits, backup/recovery assumptions, and provider outage behavior. Test account deletion and one recovery/outage scenario. | P0 privacy/deletion. | Hermes; Andreas accepts residual risk. |
| QA expansion | Add authenticated staging/production-safe regression, API authorization/abuse cases, offline/slow-network/provider outage, upgrade/reinstall, deep links, and store-build smoke. Triage all results by severity. | QA identities and store builds. | Hermes. |
| Store rollout controls | Use staged/phased rollout, define halt thresholds, validate release notes, and retain last-known-good artifacts/checksums. | Store approval. | Hermes plan; Andreas console execution. |

## P2 — post-launch improvements

| Work item | Acceptance criteria | Owner |
| --- | --- | --- |
| Localization foundation | Reactivate only after Andreas's product decision; define locale architecture, legal/store metadata ownership, and pseudo-localization tests before adding languages. | Hermes + Andreas. |
| Analytics maturity | Privacy-reviewed funnel/crash dashboards, consent/opt-out where legally required, retention controls, and weekly launch-health review. | Hermes + Andreas. |
| Broader device/browser coverage | Add Safari/Firefox and expanded Android/iOS OS/device coverage based on traffic and support evidence. | Hermes. |
| Operational automation | Automate candidate provenance, store metadata validation, changelog generation, uptime probes, synthetic auth-safe smoke, and rollback evidence. | Hermes. |

## Explicit go/no-go checklists

### Web public launch

- [ ] P0.1–P0.5, P0.9, and P0.10 are green for the frozen SHA.
- [ ] Live pre/post-deploy smoke and authenticated production QA are attached to the release record.
- [ ] Monitoring/alert delivery and rollback target are confirmed by named owners.
- [ ] Andreas records go; Hermes executes only an explicitly approved production deploy.

### Google Play production

- [ ] All shared P0 items and P0.6/P0.8 are green for the exact AAB version.
- [ ] Internal-track install and physical-device smoke pass; console declarations and pre-launch report are resolved.
- [ ] Staged rollout, halt thresholds, support coverage, and last-known-good artifact are recorded.
- [ ] Andreas submits/rolls out from Play Console.

### Apple App Store production

- [ ] All shared P0 items and P0.7/P0.8 are green for the exact TestFlight build.
- [ ] iPhone (and iPad if supported) physical smoke, privacy nutrition labels, deletion, review notes/account, and screenshots are complete.
- [ ] Phased release, halt thresholds, support coverage, and last-known-good build are recorded.
- [ ] Andreas submits/releases from App Store Connect.

## Verification commands

Read-only/live commands used for this audit:

```sh
for path in / /privacy /terms /support /help-support /robots.txt /sitemap.xml; do
  curl -L -sS -o /dev/null -w "$path %{http_code}\n" "https://sidequestchess.com$path"
done
curl -sSI https://sidequestchess.com/
curl -sS -i https://sidequestchess.com/api/mobile/account
gh release view mobile-v337 --json tagName,publishedAt,isDraft,isPrerelease,url,assets,targetCommitish
```

Repository gates for this documentation change:

```sh
pnpm test
pnpm lint
pnpm --dir apps/mobile typecheck
pnpm build
pnpm test:browser:public
git diff --check
```

## Reconciliation notes

- `ROADMAP.md` remains the historical product ledger; its active P0 Multiplayer enforcement and verifier-diagnostic items are dependencies here, not copied into a second feature backlog.
- `docs/SQC_MOBILE_STORE_LAUNCH_PREP_2026-07-07.md`, `docs/SQC_MOBILE_STORE_SUBMISSION_PACK_2026-07-07.md`, `docs/SQC_MOBILE_APPLE_PRIVACY_PREP_2026-07-03.md`, and `apps/mobile/REAL_DEVICE_SMOKE.md` are useful evidence/workbooks but are stale at v336 and do not prove store submission.
- GitHub APK releases prove Android distribution engineering, not Google Play readiness. EAS configuration proves intent, not an iOS build.
- A 200 response at `/privacy` is not sufficient while the route redirects to support; policy content and store declarations must be reviewed as one contract.
