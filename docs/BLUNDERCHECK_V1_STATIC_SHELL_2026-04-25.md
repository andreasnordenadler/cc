# BlunderCheck v1 Static Shell Proof

Date: 2026-04-25 23:34 Europe/Stockholm  
Commit target: `cc` app  
Scope: CC v1 Phase 2 — move refined `ccdesign` shell into the real app

## What shipped locally

The real `cc` app has been moved from the old generic challenge/account framing toward the BlunderCheck v1 product shell:

- `/` — landing page: “Chess, but with stupidly hard side quests.”
- `/challenges` — Challenge Hub: “Pick your next bad idea.”
- `/challenges/queen-never-heard-of-her` — canonical challenge detail for `Queen? Never Heard of Her`.
- `/connect` — lightweight Lichess/Chess.com connection/onboarding surface.
- `/result` — static share/proof card: “You did it. Somehow.”
- `/account` — public profile/brag shelf instead of a serious analytics dashboard.

## Product alignment

Implemented against `docs/CC_V1_PRODUCT_BRIEF_2026-04-25.md`:

- Product promise is now visible in the app.
- Challenge data model now uses the starter weird side-quest library.
- No PGN upload/import path is presented in the new shell.
- Result moment is treated as a social proof card.
- Profile/account is treated as a brag shelf / chaos résumé.
- Connect page names Lichess and Chess.com without overbuilding the integration.

## Verification

Commands:

```bash
pnpm lint
pnpm build
```

Result: both passed.

Local route checks on dev server `http://localhost:3011`:

- `/` → 200, content marker ok
- `/challenges` → 200, content marker ok
- `/challenges/queen-never-heard-of-her` → 200, content marker ok
- `/connect` → 200, content marker ok
- `/result` → 200, content marker ok
- `/account` → 200, content marker ok

## Notes

- Build still emits a non-blocking Turbopack root warning because this machine has multiple lockfiles. It does not block the v1 shell.
- The old Clerk `SignInButton` usage caused a dev-route 500 during local verification. The nav was simplified to ordinary links for this shell, then checks passed.
- `src/middleware.ts` was renamed to `src/proxy.ts` to match the newer Next.js convention and avoid the middleware deprecation warning.

## Next implementation step

Phase 3 should make the active challenge/checking state feel real without drifting into manual upload/import:

1. Add an active challenge page/state that says what BlunderCheck is checking.
2. Add static success/failure examples for `Queen? Never Heard of Her`.
3. Then spike the actual verifier for queen-loss-before-move-15 using real Lichess/Chess.com game data.
