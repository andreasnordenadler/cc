# Chess.com Post-Parity Dual-Host Authenticated Account-Setting Mutation Round-Trip Repeatability Streak Extension Plus Forty-Four Smoke, 2026-04-14

Date: 2026-04-14
Owner: Sam

## Scope

Record one fresh same-run dual-host authenticated-browser `/account` round-trip repeatability streak extension plus forty-four proof that submits one new narrow Chess.com username and then reloads `/account` on both hosts again.

## Exact signed-in `/account` URLs checked

- Canonical host: `https://cc-andreas-nordenadlers-projects.vercel.app/account`
- Active deployment host: `https://cc-taupe-kappa.vercel.app/account`

## Shared proof window

- Start UTC: `2026-04-14T07:52:00Z`
- End UTC: `2026-04-14T07:52:21Z`
- Browser context: one signed-in Google Chrome session on the Mac mini

## Exact narrow mutation submitted on both hosts for this forty-eighth fresh run

- Field: Chess.com username on `/account`
- Submitted value: `and72norcc14075156z`

## Before-submit evidence

Both signed-in `/account` surfaces loaded at the exact URLs above during the same proof window and showed matching authenticated account state before submission.

Immediately before this fresh run, both hosts rendered the same authenticated `/account` body content and the same rendered account summary line `Chess.com: and72norcc14064944z`. The detected Chess.com input value was blank on both hosts before the fresh fill.

Raw captures:

- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-four-smoke-20260414T075156Z/start_utc.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-four-smoke-20260414T075156Z/canonical__account_url_before.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-four-smoke-20260414T075156Z/active__account_url_before.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-four-smoke-20260414T075156Z/canonical__account_before.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-four-smoke-20260414T075156Z/active__account_before.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-four-smoke-20260414T075156Z/canonical__chesscom_before_value.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-four-smoke-20260414T075156Z/active__chesscom_before_value.txt`

## Immediate post-submit evidence

In the same signed-in Chrome session, the Chess.com username input on both hosts was filled with the same fresh value `and72norcc14075156z`, then the visible `Update usernames` button was clicked on both hosts.

Immediately after submit, both hosts stayed on the same signed-in `/account` URLs and rendered the same immediate post-submit state:

- the Chess.com input held `and72norcc14075156z` on both hosts
- the visible action remained `Update usernames` on both hosts
- the surrounding authenticated `/account` body content stayed matched on both hosts
- the rendered account summary line still showed `Chess.com: and72norcc14064944z` on both hosts during this capture
- no host-specific divergence appeared in the captured state

A verifier check confirmed that the canonical and active `account_after_submit.txt` snapshots are byte-identical. An independent verifier pass also confirmed body parity across before, after-submit, and after-reload states while both hosts stayed on their expected distinct `/account` URLs.

Raw captures:

- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-four-smoke-20260414T075156Z/submitted_username.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-four-smoke-20260414T075156Z/canonical__filled_value.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-four-smoke-20260414T075156Z/active__filled_value.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-four-smoke-20260414T075156Z/canonical__submit_result.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-four-smoke-20260414T075156Z/active__submit_result.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-four-smoke-20260414T075156Z/canonical__account_url_after_submit.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-four-smoke-20260414T075156Z/active__account_url_after_submit.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-four-smoke-20260414T075156Z/canonical__account_after_submit.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-four-smoke-20260414T075156Z/active__account_after_submit.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-four-smoke-20260414T075156Z/canonical__chesscom_after_submit_value.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-four-smoke-20260414T075156Z/active__chesscom_after_submit_value.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-four-smoke-20260414T075156Z/verifier_summary.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-four-smoke-20260414T075156Z/independent_verifier_summary.txt`

## Post-reload evidence

Still during the same shared proof window, both signed-in `/account` pages were reloaded in the same Chrome session.

After reload, both hosts again stayed on the same signed-in `/account` URLs and rendered the same post-reload state:

- the Chess.com input was blank again on both hosts after reload
- the surrounding authenticated `/account` body content remained matched on both hosts
- the rendered account summary still showed the same prior saved value `Chess.com: and72norcc14064944z` on both hosts
- no host-specific divergence appeared after reload

A verifier check confirmed that the canonical and active `account_after_reload.txt` snapshots are byte-identical.

Raw captures:

- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-four-smoke-20260414T075156Z/canonical__account_url_after_reload.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-four-smoke-20260414T075156Z/active__account_url_after_reload.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-four-smoke-20260414T075156Z/canonical__account_after_reload.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-four-smoke-20260414T075156Z/active__account_after_reload.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-four-smoke-20260414T075156Z/canonical__chesscom_after_reload_value.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-four-smoke-20260414T075156Z/active__chesscom_after_reload_value.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-four-smoke-20260414T075156Z/end_utc.txt`

## Verdict

During the shared `2026-04-14T07:52:00Z` to `2026-04-14T07:52:21Z` proof window, both `https://cc-andreas-nordenadlers-projects.vercel.app/account` and `https://cc-taupe-kappa.vercel.app/account` accepted the same fresh narrow Chess.com username mutation `and72norcc14075156z`, rendered the same immediate post-submit `/account` state, and matched again after reload on the same prior saved summary value with the same blank-input fallback, so dual-host authenticated account-setting mutation round-trip repeatability streak extension parity passed again for this forty-eighth fresh run even though this capture did not persist the fresh submitted value after reload.
