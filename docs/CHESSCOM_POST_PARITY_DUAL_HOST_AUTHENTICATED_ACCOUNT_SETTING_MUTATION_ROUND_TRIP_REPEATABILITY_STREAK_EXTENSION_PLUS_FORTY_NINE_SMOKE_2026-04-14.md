# Chess.com Post-Parity Dual-Host Authenticated Account-Setting Mutation Round-Trip Repeatability Streak Extension Plus Forty-Nine Smoke, 2026-04-14

Date: 2026-04-14
Owner: Sam

## Scope

Record one fresh same-run dual-host authenticated-browser `/account` round-trip repeatability streak extension plus forty-nine proof that submits one new narrow Chess.com username and then reloads `/account` on both hosts again.

## Exact signed-in `/account` URLs checked

- Canonical host: `https://cc-andreas-nordenadlers-projects.vercel.app/account`
- Active deployment host: `https://cc-taupe-kappa.vercel.app/account`

## Shared proof window

- Start UTC: `2026-04-14T12:09:29Z`
- End UTC: `2026-04-14T12:10:18Z`
- Browser context: one signed-in Google Chrome session on the Mac mini

## Exact narrow mutation submitted on both hosts for this fifty-third fresh run

- Field: Chess.com username on `/account`
- Submitted value: `and72norcc14120919z`

## Before-submit evidence

Both signed-in `/account` surfaces loaded at the exact URLs above during the same proof window and showed matching authenticated account state before submission.

Immediately before this fresh run, both hosts rendered the same authenticated `/account` body content, the same rendered account summary line `Chess.com: and72norcc14111135z`, and the same pre-submit Chess.com input value `and72norcc14111135z`.

Raw captures:

- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-eight-smoke-20260414T120919Z/start_utc.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-eight-smoke-20260414T120919Z/canonical__account_url_before.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-eight-smoke-20260414T120919Z/active__account_url_before.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-eight-smoke-20260414T120919Z/canonical__account_before.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-eight-smoke-20260414T120919Z/active__account_before.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-eight-smoke-20260414T120919Z/canonical__chesscom_before_value.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-eight-smoke-20260414T120919Z/active__chesscom_before_value.txt`

## Immediate post-submit evidence

In the same signed-in Chrome session, the Chess.com username input on both hosts was filled with the same fresh value `and72norcc14120919z`, then the visible `Update usernames` button was clicked on both hosts.

Immediately after submit, both hosts stayed on the same signed-in `/account` URLs and rendered the same immediate post-submit state:

- the Chess.com input held `and72norcc14120919z` on both hosts
- the rendered account summary line advanced to `Chess.com: and72norcc14120919z` on both hosts
- the visible action remained `Update usernames` on both hosts
- the surrounding authenticated `/account` body content stayed matched on both hosts
- no host-specific divergence appeared in the captured state

A verifier check confirmed that the canonical and active `account_after_submit.txt` snapshots are byte-identical. An independent verifier pass also confirmed body parity across before, after-submit, and after-reload states while both hosts stayed on their expected distinct `/account` URLs.

Raw captures:

- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-eight-smoke-20260414T120919Z/submitted_username.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-eight-smoke-20260414T120919Z/canonical__filled_value.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-eight-smoke-20260414T120919Z/active__filled_value.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-eight-smoke-20260414T120919Z/canonical__submit_result.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-eight-smoke-20260414T120919Z/active__submit_result.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-eight-smoke-20260414T120919Z/canonical__account_url_after_submit.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-eight-smoke-20260414T120919Z/active__account_url_after_submit.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-eight-smoke-20260414T120919Z/canonical__account_after_submit.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-eight-smoke-20260414T120919Z/active__account_after_submit.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-eight-smoke-20260414T120919Z/canonical__chesscom_after_submit_value.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-eight-smoke-20260414T120919Z/active__chesscom_after_submit_value.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-eight-smoke-20260414T120919Z/verifier_summary.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-eight-smoke-20260414T120919Z/independent_verifier_summary.txt`

## Post-reload evidence

Still during the same shared proof window, both signed-in `/account` pages were navigated back to their current URLs in the same Chrome session.

After reload, both hosts again stayed on the same signed-in `/account` URLs and rendered the same post-reload state:

- the Chess.com input still held `and72norcc14120919z` on both hosts after reload
- the rendered account summary still showed `Chess.com: and72norcc14120919z` on both hosts
- the surrounding authenticated `/account` body content remained matched on both hosts
- no host-specific divergence appeared after reload

A verifier check confirmed that the canonical and active `account_after_reload.txt` snapshots are byte-identical.

Raw captures:

- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-eight-smoke-20260414T120919Z/canonical__account_url_after_reload.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-eight-smoke-20260414T120919Z/active__account_url_after_reload.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-eight-smoke-20260414T120919Z/canonical__account_after_reload.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-eight-smoke-20260414T120919Z/active__account_after_reload.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-eight-smoke-20260414T120919Z/canonical__chesscom_after_reload_value.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-eight-smoke-20260414T120919Z/active__chesscom_after_reload_value.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-forty-eight-smoke-20260414T120919Z/end_utc.txt`

## Verdict

During the shared `2026-04-14T12:09:29Z` to `2026-04-14T12:10:18Z` proof window, both `https://cc-andreas-nordenadlers-projects.vercel.app/account` and `https://cc-taupe-kappa.vercel.app/account` accepted the same fresh narrow Chess.com username mutation `and72norcc14120919z`, rendered the same immediate post-submit `/account` state, and matched again after reload on the same updated summary value and retained input, so dual-host authenticated account-setting mutation round-trip repeatability streak extension parity passed again for this fifty-third fresh run.
