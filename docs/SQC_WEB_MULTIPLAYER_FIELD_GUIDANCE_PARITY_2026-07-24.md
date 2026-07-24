# SQC web Multiplayer field-guidance parity — 2026-07-24

## DONE

- Reconciled `origin/main` `66c834f8132e631d53f1abb543bf0a16a65dfb1f`, open PRs #27/#2, production deployment/source alignment, Android v338's reachable `ActiveScreen` dispatcher and Multiplayer create modal, and the exhaustive July 13 parity matrix.
- Matched Android v338's Quest name and Intro text field guidance: exact placeholders plus the required-name and pre-join helper copy now appear in the real web create form.
- Preserved the editable Android intro default, canonical create payload, server-derived identity boundary, schedule/rules, quest picker, and create action.

## VERIFIED

- Strict TDD RED failed on the missing production-form guidance; focused GREEN passed after the minimum component change.
- Android reference: shipped v338 `apps/mobile/App.tsx` reachable authenticated create modal, lines 7791–7796. Production-component evidence requires no fabricated account or Multiplayer data.
- Final full tests, lint, typechecks, production build, exact-preview desktop/mobile browser checks, and exact-HEAD independent review are recorded in the PR/release evidence.

## NEXT

- Reconcile current main/open work and continue the highest-value still-open Android v338 state that can be proved truthfully.

## NEEDS USER INPUT

- Release remains blocked on matched Android-v338 authenticated viewport evidence for this create screen. The installed v338 emulator is currently signed out, and no safe disposable non-production identity/session is available; no production or fabricated account will be used. The reviewed PR stays unmerged until that evidence can be captured.
