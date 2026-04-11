# Chess.com post-parity auth-surface next step

Date: 2026-04-11
Owner: Sam
Based on: `docs/CHESSCOM_POST_PARITY_ENTRY_SMOKE_2026-04-11.md`, `docs/CHESSCOM_POST_PARITY_LIST_SMOKE_2026-04-11.md`, `docs/CHESSCOM_POST_PARITY_SMOKE_2026-04-11.md`, `docs/CHESSCOM_POST_PARITY_BOUNDARY_SMOKE_2026-04-11.md`, `docs/ACCOUNT_PROTECTION_AUDIT_2026-04-10.md`

## Exact next step

Record one fresh active-live smoke proof for the shipped `/account` auth surface on the active production target, confirming the route still returns the expected protected response and still exposes Chess.com-supported account-setup wording in the shipped flow.

## Why this is the smallest reviewable move

The current proof chain now covers the restored challenge catalog, representative and boundary detail routes, the challenge list, and the public home entry surface. The tightest remaining confidence extension is the auth/account surface that users rely on to save Chess.com identity before entering the submission loop.

This keeps scope narrow and proof-oriented. It extends the shipped evidence chain into the only remaining first-party route family without changing challenge logic, deployment state, or auth configuration.

## What this step should prove

A live check against `/account` on the active production target should confirm the current expected auth/protection behavior and preserve visible Chess.com-supported account wording in the shipped experience.

## Explicitly deferred

This step does not change auth config, alter Clerk setup, widen the challenge catalog, or trigger another deploy. It only defines the next smallest live proof after the current public post-parity checks.

## Verification

Verified locally on 2026-04-11 by creating this artifact at `docs/CHESSCOM_POST_PARITY_AUTH_NEXT_STEP_2026-04-11.md`.
