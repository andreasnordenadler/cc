# Chess.com Post-Parity Dual-Host Authenticated Account-Setting Mutation Round-Trip Repeatability Streak Extension Plus Twenty-Six Smoke, 2026-04-13

Date: 2026-04-13
Owner: Sam

## Scope

Record one fresh same-run dual-host authenticated-browser `/account` round-trip repeatability streak extension plus twenty-six proof that submits one new narrow Chess.com username and then reloads `/account` on both hosts again.

## Exact signed-in `/account` URLs checked

- Canonical host: `https://cc-andreas-nordenadlers-projects.vercel.app/account`
- Active deployment host: `https://cc-taupe-kappa.vercel.app/account`

## Shared proof window

- Start UTC: `2026-04-13T17:50:13Z`
- End UTC: `2026-04-13T17:50:21Z`
- Browser context: one signed-in Google Chrome session on the Mac mini

## Exact narrow mutation submitted on both hosts for this thirtieth fresh run

- Field: Chess.com username on `/account`
- Submitted value: `and72norcc13175013zj`

## Before-submit evidence

Both signed-in `/account` surfaces loaded at the exact URLs above during the same proof window and again showed matching authenticated account state before submission.

Immediately before this fresh run, both hosts showed the same prior Chess.com username value `and72norcc13174946zi` in the input and in the rendered account summary.

Raw captures:

- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-twenty-six-smoke-20260413T175013Z/start_utc.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-twenty-six-smoke-20260413T175013Z/canonical__account_url_before.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-twenty-six-smoke-20260413T175013Z/active__account_url_before.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-twenty-six-smoke-20260413T175013Z/canonical__account_before.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-twenty-six-smoke-20260413T175013Z/active__account_before.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-twenty-six-smoke-20260413T175013Z/canonical__chesscom_before_value.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-twenty-six-smoke-20260413T175013Z/active__chesscom_before_value.txt`

## Immediate post-submit evidence

In the same signed-in Chrome session, the Chess.com username input on both hosts was filled with the same fresh value `and72norcc13175013zj`, then the visible `Update usernames` button was clicked on both hosts.

Immediately after submit, both hosts stayed on the same signed-in `/account` URLs and rendered the same immediate post-submit state:

- the Chess.com input held `and72norcc13175013zj` on both hosts
- the visible action remained `Update usernames` on both hosts
- the surrounding authenticated `/account` body content stayed matched, including the same rendered summary line `Chess.com: and72norcc13175013zj` on both hosts
- no host-specific divergence appeared in the captured state

Raw captures:

- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-twenty-six-smoke-20260413T175013Z/submitted_username.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-twenty-six-smoke-20260413T175013Z/canonical__filled_value.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-twenty-six-smoke-20260413T175013Z/active__filled_value.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-twenty-six-smoke-20260413T175013Z/canonical__submit_result.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-twenty-six-smoke-20260413T175013Z/active__submit_result.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-twenty-six-smoke-20260413T175013Z/canonical__account_url_after_submit.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-twenty-six-smoke-20260413T175013Z/active__account_url_after_submit.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-twenty-six-smoke-20260413T175013Z/canonical__account_after_submit.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-twenty-six-smoke-20260413T175013Z/active__account_after_submit.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-twenty-six-smoke-20260413T175013Z/canonical__chesscom_after_submit_value.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-twenty-six-smoke-20260413T175013Z/active__chesscom_after_submit_value.txt`

## Post-reload evidence

Still during the same shared proof window, both signed-in `/account` pages were reloaded in the same Chrome session.

After reload, both hosts again stayed on the same signed-in `/account` URLs and rendered the same post-reload state:

- the Chess.com input reloaded with `and72norcc13175013zj` on both hosts
- the surrounding authenticated `/account` body content remained matched on both hosts
- the rendered account summary still showed `Chess.com: and72norcc13175013zj` on both hosts
- no host-specific divergence appeared after reload

Raw captures:

- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-twenty-six-smoke-20260413T175013Z/canonical__account_url_after_reload.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-twenty-six-smoke-20260413T175013Z/active__account_url_after_reload.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-twenty-six-smoke-20260413T175013Z/canonical__account_after_reload.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-twenty-six-smoke-20260413T175013Z/active__account_after_reload.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-twenty-six-smoke-20260413T175013Z/canonical__chesscom_after_reload_value.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-twenty-six-smoke-20260413T175013Z/active__chesscom_after_reload_value.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-twenty-six-smoke-20260413T175013Z/end_utc.txt`

## Verdict

During the shared `2026-04-13T17:50:13Z` to `2026-04-13T17:50:21Z` proof window, both `https://cc-andreas-nordenadlers-projects.vercel.app/account` and `https://cc-taupe-kappa.vercel.app/account` accepted the same fresh narrow Chess.com username input mutation `and72norcc13175013zj`, rendered the same immediate post-submit `/account` state, and then converged again to the same post-reload `/account` state with the saved value still present, so authenticated account-setting mutation round-trip repeatability streak extension parity passed again for this minimal `/account` slice and records the documented thirtieth fresh run in the ongoing proof chain.
