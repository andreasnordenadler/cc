# Chess.com Post-Parity Dual-Host Authenticated Account-Setting Mutation Persistence Smoke, 2026-04-12

Date: 2026-04-12
Owner: Sam

## Scope

Record one fresh same-run dual-host authenticated-browser `/account` persistence recheck for the already-submitted narrow Chess.com username mutation.

## Exact signed-in `/account` URLs checked

- Canonical host: `https://cc-andreas-nordenadlers-projects.vercel.app/account`
- Active deployment host: `https://cc-taupe-kappa.vercel.app/account`

## Rechecked Chess.com username value

- Previously submitted narrow value: `and72norcc193421`

## Shared proof window

- Start UTC: `2026-04-12T18:13:46Z`
- End UTC: `2026-04-12T18:13:59Z`
- Browser context: one signed-in Google Chrome session on the Mac mini

## Reload persistence evidence

During the shared proof window, both signed-in `/account` pages were revisited and force-reloaded in the same Chrome session.

Both hosts stayed on the exact signed-in `/account` URLs above and rendered the same persisted fallback state after reload:

- `Lichess: and72nor`
- `Chess.com: not set yet`
- the Chess.com username input reloaded blank on both hosts
- the same `Continue: Win As Black` active-challenge context remained visible
- the same recent-submission copy remained visible, including `Submitted Chess.com game saved, but no Chess.com username is stored yet. Add it in account settings so verification can finish.`

Raw captures:

- `tmp/account-setting-mutation-persistence-smoke-20260412T181341Z/start_utc.txt`
- `tmp/account-setting-mutation-persistence-smoke-20260412T181341Z/end_utc.txt`
- `tmp/account-setting-mutation-persistence-smoke-20260412T181341Z/rechecked_username.txt`
- `tmp/account-setting-mutation-persistence-smoke-20260412T181341Z/canonical__account_url_recheck.txt`
- `tmp/account-setting-mutation-persistence-smoke-20260412T181341Z/active__account_url_recheck.txt`
- `tmp/account-setting-mutation-persistence-smoke-20260412T181341Z/canonical__account_recheck.txt`
- `tmp/account-setting-mutation-persistence-smoke-20260412T181341Z/active__account_recheck.txt`
- `tmp/account-setting-mutation-persistence-smoke-20260412T181341Z/canonical__chesscom_recheck_value.txt`
- `tmp/account-setting-mutation-persistence-smoke-20260412T181341Z/active__chesscom_recheck_value.txt`

## Verdict

During the shared `2026-04-12T18:13:46Z` to `2026-04-12T18:13:59Z` proof window, both `https://cc-andreas-nordenadlers-projects.vercel.app/account` and `https://cc-taupe-kappa.vercel.app/account` rendered the same persisted post-reload fallback state for the previously submitted Chess.com username value `and72norcc193421`, so authenticated account-setting mutation persistence parity passed for this narrow `/account` recheck slice.
