# Public web / Android parity audit — 2026-07-11

## Scope

Signed-out, public-only comparison of production web (`https://sidequestchess.com`) and the installed Android app (`com.sidequestchess.app` 0.1.336) on the `sqc_verify_35` Android 35 AVD. No credentials or private user data were used.

## Outcome

| Flow | Web | Android | Parity |
| --- | --- | --- | --- |
| Signed-out home | “Sign in to continue”, Solo/Multiplayer browse actions, auth entry | Same signed-out message and both browse actions; auth entry says “Choose sign-in method” | Strong |
| Solo browsing | 13 official quests; `Any Game Counts` first; rules visible without auth | 13 official quests; `Any Game Counts` first; catalog visible without auth | Strong |
| Multiplayer browsing | 3 official public rows, signed-out rows marked “Sign in” | 3 official public rows, signed-out rows marked “SIGN IN” | Strong behavior, stale/different content |
| Auth entry | Dedicated sign-in page and form boundary | Native account screen with Google, Facebook, and username/password choices | Equivalent capability; intentionally native UI |
| Public challenge/share | Public `Any Game Counts` detail exposes rules, “Share public link”, and sign-in boundary | Public detail/share capability exists in app source, but was not exercised beyond catalog without credentials | Partial verification |
| Mobile layout | Pixel 7 browser checks pass with no document-level horizontal overflow on home and Solo | Native 1080×2400 layout exposed all critical home actions and catalogs | Strong |

## Focused findings

1. **Critical signed-out information architecture is aligned.** Both clients let guests enter Solo and Multiplayer catalogs before authentication and present a clear auth boundary.
2. **Solo catalog parity is strong at the public entry point.** Both reported `13 official` and led with `Any Game Counts` during this audit.
3. **Multiplayer behavior matches, but public content did not.** Web showed `Official 14-Day Starter Shield`, `Official 14-Day Royal Route`, and `Official 14-Day Chaos Ladder`; Android showed `Knights Before Coffee Rush`, `No Castle Club Night`, and another app-fed row. Counts and signed-out behavior match, but the row sets appear to come from different snapshots/feed timing. **Priority: medium** — verify that the installed Android build is using the intended production bootstrap and refresh policy.
4. **Auth wording differs but is not a blocker.** Web leads with “Sign in, then go make terrible chess decisions”; Android leads with “Sign in to sync your board” and exposes native provider choices. The capability and guest-to-auth boundary are equivalent.
5. **No visual snapshot suite was added.** Browser smoke tests use role/text/URL/HTTP and overflow assertions only, with traces and screenshots retained only on failure to avoid screenshot churn.

## Evidence and repeatability

- Browser suite: `pnpm test:browser:public` → **7 passed** (5 desktop, 2 Pixel 7 mobile).
- Web coverage: `/`, `/solo`, `/multiplayer`, `/sign-in`, `/challenges/finish-any-game`.
- Android evidence: Android 35 AVD `sqc_verify_35`; UI Automator dumps confirmed the signed-out home, `13 official` Solo catalog, `3 official` Multiplayer catalog, and native auth choices.
- Android package inspected: `com.sidequestchess.app`, version `0.1.336` (`versionCode=336`).
- Static checks: `pnpm lint` completed with 0 errors and 4 pre-existing warnings; `pnpm --dir apps/mobile typecheck` passed after installing workspace dependencies.

## Not covered

Authenticated progress/proof, joining or creating Multiplayer quests, private account state, external OAuth completion, and proof-token URLs requiring a stable known token. These require a dedicated non-production test account/fixture and are intentionally outside this public smoke lane.
