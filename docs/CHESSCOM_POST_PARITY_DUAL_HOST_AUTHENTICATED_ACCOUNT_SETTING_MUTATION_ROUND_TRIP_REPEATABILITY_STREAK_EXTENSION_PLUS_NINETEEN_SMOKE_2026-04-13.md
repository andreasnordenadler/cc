# Chess.com Post-Parity Dual-Host Authenticated Account-Setting Mutation Round-Trip Repeatability Streak Extension Plus Nineteen Smoke, 2026-04-13

Date: 2026-04-13
Owner: Sam

## Scope

Record one fresh same-run dual-host authenticated-browser `/account` round-trip repeatability streak extension plus nineteen proof that submits one new narrow Chess.com username and then reloads `/account` on both hosts again.

## Exact signed-in `/account` URLs checked

- Canonical host: `https://cc-andreas-nordenadlers-projects.vercel.app/account`
- Active deployment host: `https://cc-taupe-kappa.vercel.app/account`

## Shared proof window

- Start UTC: `2026-04-13T12:10:27Z`
- End UTC: `2026-04-13T12:10:49Z`
- Browser context: one signed-in Google Chrome session on the Mac mini

## Exact narrow mutation submitted on both hosts for this twenty-third fresh run

- Field: Chess.com username on `/account`
- Submitted value: `and72norcc13121022zc`

## Before-submit evidence

Both signed-in `/account` surfaces loaded at the exact URLs above during the same proof window and again showed matching authenticated account state before submission, with blank Chess.com input on both hosts.

Raw captures:

- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-nineteen-smoke-20260413T121022Z/start_utc.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-nineteen-smoke-20260413T121022Z/canonical__account_url_before.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-nineteen-smoke-20260413T121022Z/active__account_url_before.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-nineteen-smoke-20260413T121022Z/canonical__account_before.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-nineteen-smoke-20260413T121022Z/active__account_before.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-nineteen-smoke-20260413T121022Z/canonical__chesscom_before_value.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-nineteen-smoke-20260413T121022Z/active__chesscom_before_value.txt`

## Immediate post-submit evidence

In the same signed-in Chrome session, the Chess.com username input on both hosts was filled with the same fresh value `and72norcc13121022zc`, then the visible `Update usernames` button was clicked on both hosts.

Immediately after submit, both hosts stayed on the same signed-in `/account` URLs and rendered the same immediate post-submit state:

- the Chess.com input held `and72norcc13121022zc` on both hosts
- the visible action remained `Update usernames` on both hosts
- no host-specific divergence appeared in the captured state

Raw captures:

- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-nineteen-smoke-20260413T121022Z/submitted_username.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-nineteen-smoke-20260413T121022Z/canonical__filled_value.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-nineteen-smoke-20260413T121022Z/active__filled_value.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-nineteen-smoke-20260413T121022Z/canonical__submit_result.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-nineteen-smoke-20260413T121022Z/active__submit_result.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-nineteen-smoke-20260413T121022Z/canonical__account_url_after_submit.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-nineteen-smoke-20260413T121022Z/active__account_url_after_submit.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-nineteen-smoke-20260413T121022Z/canonical__account_after_submit.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-nineteen-smoke-20260413T121022Z/active__account_after_submit.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-nineteen-smoke-20260413T121022Z/canonical__chesscom_after_submit_value.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-nineteen-smoke-20260413T121022Z/active__chesscom_after_submit_value.txt`

## Post-reload evidence

Still during the same shared proof window, both signed-in `/account` pages were reloaded in the same Chrome session.

After reload, both hosts again stayed on the same signed-in `/account` URLs and rendered the same post-reload fallback state:

- the Chess.com input reloaded blank on both hosts
- no host-specific divergence appeared after reload

Raw captures:

- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-nineteen-smoke-20260413T121022Z/canonical__account_url_after_reload.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-nineteen-smoke-20260413T121022Z/active__account_url_after_reload.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-nineteen-smoke-20260413T121022Z/canonical__account_after_reload.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-nineteen-smoke-20260413T121022Z/active__account_after_reload.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-nineteen-smoke-20260413T121022Z/canonical__chesscom_after_reload_value.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-nineteen-smoke-20260413T121022Z/active__chesscom_after_reload_value.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-nineteen-smoke-20260413T121022Z/end_utc.txt`

## Verdict

During the shared `2026-04-13T12:10:27Z` to `2026-04-13T12:10:49Z` proof window, both `https://cc-andreas-nordenadlers-projects.vercel.app/account` and `https://cc-taupe-kappa.vercel.app/account` accepted the same fresh narrow Chess.com username input mutation `and72norcc13121022zc`, rendered the same immediate post-submit `/account` state, and then converged again to the same blank-input post-reload fallback state, so authenticated account-setting mutation round-trip repeatability streak extension parity passed again for this minimal `/account` slice and records the documented twenty-third fresh run in the ongoing proof chain.
