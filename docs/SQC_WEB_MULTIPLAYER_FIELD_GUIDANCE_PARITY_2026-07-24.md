# SQC web Multiplayer field-guidance parity — 2026-07-24

## DONE

- Reconciled current `origin/main`, open PRs #90/#27/#2, production deployment/source alignment, Android v339's reachable `ActiveScreen` dispatcher and authenticated Multiplayer create modal, and the exhaustive parity matrix.
- Matched Android v339's Quest name and Intro text field guidance: exact placeholders plus the required-name and pre-join helper copy now appear in the real web create form.
- Preserved the editable Android intro default, canonical create payload, server-derived identity boundary, schedule/rules, quest picker, and create action.

## VERIFIED

- Strict TDD RED failed on the missing production-form guidance; focused GREEN passed after the minimum component change.
- Android reference: shipped v339 APK `0.1.339` / versionCode `339` from immutable `mobile-v339` source `3830e3fb912faf2d37e435b9d73211f4b4de7e6c`; authenticated create modal in `apps/mobile/App.tsx`, lines 7790–7796. Exact 1080×2400 native evidence was captured with the authorized `samnordbot@gmail.com` test account; no fabricated account or Multiplayer data was used.
- Final full tests, lint, typechecks, production build, exact-preview desktop/mobile browser checks, and exact-HEAD independent review are recorded in the PR/release evidence.

## NEXT

- Reconcile current main/open work and continue the highest-value still-open Android v339 state that can be proved truthfully.

## NEEDS USER INPUT

- None.
