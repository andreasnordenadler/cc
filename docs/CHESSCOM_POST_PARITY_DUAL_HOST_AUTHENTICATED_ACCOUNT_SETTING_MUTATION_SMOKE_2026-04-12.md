# Chess.com Post-Parity Dual-Host Authenticated Account-Setting Mutation Smoke, 2026-04-12

Date: 2026-04-12
Owner: Sam

## Scope

Record one fresh same-run dual-host authenticated-browser `/account` Chess.com username-setting mutation proof on the canonical host and the active deployment host.

## Exact signed-in `/account` URLs checked

- Canonical host: `https://cc-andreas-nordenadlers-projects.vercel.app/account`
- Active deployment host: `https://cc-taupe-kappa.vercel.app/account`

## Shared proof window

- Start UTC: `2026-04-12T17:34:26Z`
- End UTC: `2026-04-12T17:34:41Z`
- Browser context: one signed-in Google Chrome session on the Mac mini

## Exact narrow mutation reused on both hosts

- Field: Chess.com username on `/account`
- Submitted value: `and72norcc193421`

## Before-submit evidence

Both signed-in `/account` surfaces loaded at the exact URLs above during the same proof window and showed the same visible authenticated account state:

- `Lichess: and72nor`
- `Chess.com: not set yet`
- `Continue: Win As Black`
- repeated recent-submission rows stating `Submitted Chess.com game saved, but no Chess.com username is stored yet. Add it in account settings so verification can finish.`

Raw captures:

- `tmp/account-setting-mutation-smoke-20260412T173421Z/canonical__account_before.txt`
- `tmp/account-setting-mutation-smoke-20260412T173421Z/active__account_before.txt`
- `tmp/account-setting-mutation-smoke-20260412T173421Z/canonical__account_url_before.txt`
- `tmp/account-setting-mutation-smoke-20260412T173421Z/active__account_url_before.txt`
- `tmp/account-setting-mutation-smoke-20260412T173421Z/canonical__chesscom_before_value.txt`
- `tmp/account-setting-mutation-smoke-20260412T173421Z/active__chesscom_before_value.txt`

## Submit evidence

In the same signed-in Chrome session, the Chess.com username input on both hosts was filled with the exact same value `and72norcc193421`, then the visible `Update usernames` button was clicked on both hosts.

Raw submit captures:

- `tmp/account-setting-mutation-smoke-20260412T173421Z/submitted_username.txt`
- `tmp/account-setting-mutation-smoke-20260412T173421Z/canonical__filled_value.txt`
- `tmp/account-setting-mutation-smoke-20260412T173421Z/active__filled_value.txt`
- `tmp/account-setting-mutation-smoke-20260412T173421Z/canonical__submit_result.txt`
- `tmp/account-setting-mutation-smoke-20260412T173421Z/active__submit_result.txt`

## Immediate post-submit evidence

Immediately after the button click, both hosts stayed on the same signed-in `/account` URLs and converged to the same immediate post-submit state:

- the Chess.com input still held `and72norcc193421`
- the visible page copy still rendered `Chess.com: not set yet`
- no success banner, validation error, or divergent host-specific message appeared in the captured body text
- the same `Continue: Win As Black` and recent-submission context remained visible on both hosts

Raw after-submit captures:

- `tmp/account-setting-mutation-smoke-20260412T173421Z/canonical__account_after.txt`
- `tmp/account-setting-mutation-smoke-20260412T173421Z/active__account_after.txt`
- `tmp/account-setting-mutation-smoke-20260412T173421Z/canonical__account_url_after.txt`
- `tmp/account-setting-mutation-smoke-20260412T173421Z/active__account_url_after.txt`
- `tmp/account-setting-mutation-smoke-20260412T173421Z/canonical__chesscom_after_value.txt`
- `tmp/account-setting-mutation-smoke-20260412T173421Z/active__chesscom_after_value.txt`

## Verdict

During the shared `2026-04-12T17:34:26Z` to `2026-04-12T17:34:41Z` proof window, both `https://cc-andreas-nordenadlers-projects.vercel.app/account` and `https://cc-taupe-kappa.vercel.app/account` accepted the same narrow Chess.com username input mutation `and72norcc193421` and rendered the same immediate post-submit signed-in `/account` state, so authenticated account-setting mutation parity passed for this minimal `/account` smoke slice.
