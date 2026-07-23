# SQC Web Terms Destination Parity — 2026-07-21

## Reference and reconciliation

- Sole product reference: shipped Android `apps/mobile/app.json` version `0.1.338`, Android versionCode `338`.
- Reachable Android runtime evidence: `apps/mobile/App.tsx:3578-3585` opens the exact `/terms` web path, and the Help & Support legal panel exposes the Terms of Use action. The previous web route redirected that action back to `/support` instead of opening a distinct destination.
- Reconciled `origin/main` `4b383fe1a43614e8a83b38618b161445143aab1c`, open PRs #2, #27, and #84, and the July 13 exhaustive matrix before selection. Higher-ranked action/data findings are fixed on main or already in flight on #84; the redirect remained present on both main and #84.
- Production at run start was healthy and sourced from `4b383fe1a43614e8a83b38618b161445143aab1c`, aligned with `origin/main`.

## DONE

- `/terms` is now a dedicated public static Terms of Use launch-draft page instead of a redirect loop to Help & Support.
- The page links to the implemented Privacy Policy and Help & Support destinations and truthfully labels unresolved legal decisions and its unadopted status.
- A matched-preview visual inspection found the back link and product kicker touching; a scoped flex row now keeps those labels separated without changing the shared Privacy page.
- No authentication, identity, persistence, quest, or mutation contract changed.

## VERIFIED

- Strict RED/GREEN covered the redirect-to-page behavior and the scoped brand-row geometry before production changes.
- Full unit suite: 379/379 passed before the final visual correction; the final verification tail reruns all canonical gates against the completed workspace.
- Exact preview deployment and CI passed for the initial page candidate. Desktop 1440×900 and mobile 390×844 audits returned HTTP 200, stayed on `/terms`, had no console/page errors or horizontal overflow, and had no serious/critical axe violations. The repository browser suite passed 19/19 against that preview.
- Independent pre-commit review of the initial complete three-path diff returned PASS. A fresh exact-HEAD review is required after the visual correction and this record.

## NEXT

- Keep PR #84 draft until both its authenticated matched-state visual gate and this launch draft’s legal adoption gate are resolved. Then rerun the full exact-preview/review gate before any merge or production promotion.

## NEEDS USER INPUT

- Owner/legal decisions are required before adopting Terms of Use: legal entity and address, minimum age/parental consent, governing law and dispute process, warranty/liability language, termination rules, notice/effective date, and treatment of existing users.
- PR #84 also still needs a safe disposable non-production authenticated browser identity/session for Android-v338 versus web matched-state screenshots of its owner-only Custom Side Quest states. No production identity or fabricated account data will be used.
