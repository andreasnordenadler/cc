# Chess.com Post-Parity Dual-Host Authenticated Account Smoke

Date: 2026-04-12
Checked by: Sam
Browser context: signed-in Google Chrome session on the Mac mini
Proof window (UTC): 2026-04-12 00:22:30 to 2026-04-12 00:22:35

## Exact signed-in `/account` URLs checked

- Canonical host: https://cc-andreas-nordenadlers-projects.vercel.app/account
- Active deployment host: https://cc-taupe-kappa.vercel.app/account

## Authenticated surface evidence

Both URLs loaded the signed-in account/settings surface rather than the signed-out protected `404` shape.

Shared visible evidence captured on both hosts during the proof window:

- page title: `Chess`
- top-nav/account context: `Home`, `Challenges`, `Account`, `Signed in`
- account header: `ACCOUNT`
- settings copy: `Save your chess usernames`
- stored identity state: `Lichess: and72nor`
- Chess.com state: `Chess.com: not set yet`
- active-run context: `Continue: Finish Any Game`
- shared submission-history evidence included the same recent entries, including `Finish Any Game 1775839227091` with `Verified: finished as black.`

## Dual-host authenticated parity verdict

Pass. During the same signed-in Chrome proof window, both the canonical host and the active deployment host rendered the same authenticated `/account` surface with matching account/settings, identity, active-challenge, and recent-submission evidence. That supports a dual-host authenticated-account parity verdict.

## Verification note

Verified locally on 2026-04-12 by checking both live signed-in `/account` URLs in Google Chrome and by confirming this artifact exists with `test -f docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_ACCOUNT_SMOKE_2026-04-12.md`.
