# Chess.com Post-Parity Dual-Host Authenticated Account-Setting Mutation Round-Trip Repeatability Streak Extension Plus Thirty-Three Smoke, 2026-04-14

Date: 2026-04-14
Owner: Sam

## Scope

Record one fresh same-run dual-host authenticated-browser `/account` round-trip repeatability streak extension plus thirty-three proof that submits one new narrow Chess.com username and then reloads `/account` on both hosts again.

## Exact signed-in `/account` URLs checked

- Canonical host: `https://cc-andreas-nordenadlers-projects.vercel.app/account`
- Active deployment host: `https://cc-taupe-kappa.vercel.app/account`

## Shared proof window

- Start UTC: `2026-04-13T22:52:31Z`
- End UTC: `2026-04-13T22:53:14Z`
- Browser context: one signed-in Google Chrome session on the Mac mini

## Exact narrow mutation submitted on both hosts for this thirty-seventh fresh run

- Field: Chess.com username on `/account`
- Submitted value: `and72norcc13225218zs`

## Before-submit evidence

Both signed-in `/account` surfaces loaded at the exact URLs above during the same proof window and showed matching authenticated account state before submission.

Immediately before this fresh run, both hosts rendered the same account body content and the same rendered account summary line `Chess.com: and72norcc13212942zq`. The detected Chess.com input value was also the same on both hosts before the fresh fill: `and72norcc13212942zq`.

Raw captures:

- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-thirty-three-smoke-20260413T225218Z/start_utc.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-thirty-three-smoke-20260413T225218Z/canonical__account_url_before.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-thirty-three-smoke-20260413T225218Z/active__account_url_before.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-thirty-three-smoke-20260413T225218Z/canonical__account_before.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-thirty-three-smoke-20260413T225218Z/active__account_before.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-thirty-three-smoke-20260413T225218Z/canonical__chesscom_before_value.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-thirty-three-smoke-20260413T225218Z/active__chesscom_before_value.txt`

## Immediate post-submit evidence

In the same signed-in Chrome session, the Chess.com username input on both hosts was filled with the same fresh value `and72norcc13225218zs`, then the visible `Update usernames` button was clicked on both hosts.

Immediately after submit, both hosts stayed on the same signed-in `/account` URLs and rendered the same immediate post-submit state:

- the Chess.com input held `and72norcc13225218zs` on both hosts
- the visible action remained `Update usernames` on both hosts
- the surrounding authenticated `/account` body content stayed matched on both hosts
- the rendered account summary line showed `Chess.com: and72norcc13225218zs` on both hosts
- no host-specific divergence appeared in the captured state

A verifier check confirmed that the canonical and active `account_after_submit.txt` snapshots are byte-identical.

Raw captures:

- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-thirty-three-smoke-20260413T225218Z/submitted_username.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-thirty-three-smoke-20260413T225218Z/canonical__filled_value.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-thirty-three-smoke-20260413T225218Z/active__filled_value.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-thirty-three-smoke-20260413T225218Z/canonical__submit_result.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-thirty-three-smoke-20260413T225218Z/active__submit_result.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-thirty-three-smoke-20260413T225218Z/canonical__account_url_after_submit.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-thirty-three-smoke-20260413T225218Z/active__account_url_after_submit.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-thirty-three-smoke-20260413T225218Z/canonical__account_after_submit.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-thirty-three-smoke-20260413T225218Z/active__account_after_submit.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-thirty-three-smoke-20260413T225218Z/canonical__chesscom_after_submit_value.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-thirty-three-smoke-20260413T225218Z/active__chesscom_after_submit_value.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-thirty-three-smoke-20260413T225218Z/verifier_summary.txt`

## Post-reload evidence

Still during the same shared proof window, both signed-in `/account` pages were reloaded in the same Chrome session.

After reload, both hosts again stayed on the same signed-in `/account` URLs and rendered the same post-reload state:

- the Chess.com input still held `and72norcc13225218zs` on both hosts after reload
- the surrounding authenticated `/account` body content remained matched on both hosts
- the rendered account summary also showed `Chess.com: and72norcc13225218zs` on both hosts
- no host-specific divergence appeared after reload

A verifier check confirmed that the canonical and active `account_after_reload.txt` snapshots are byte-identical.

Raw captures:

- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-thirty-three-smoke-20260413T225218Z/canonical__account_url_after_reload.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-thirty-three-smoke-20260413T225218Z/active__account_url_after_reload.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-thirty-three-smoke-20260413T225218Z/canonical__account_after_reload.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-thirty-three-smoke-20260413T225218Z/active__account_after_reload.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-thirty-three-smoke-20260413T225218Z/canonical__chesscom_after_reload_value.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-thirty-three-smoke-20260413T225218Z/active__chesscom_after_reload_value.txt`
- `tmp/account-setting-mutation-round-trip-repeatability-streak-extension-plus-thirty-three-smoke-20260413T225218Z/end_utc.txt`

## Verdict

During the shared `2026-04-13T22:52:31Z` to `2026-04-13T22:53:14Z` proof window, both `https://cc-andreas-nordenadlers-projects.vercel.app/account` and `https://cc-taupe-kappa.vercel.app/account` accepted the same fresh narrow Chess.com username input mutation `and72norcc13225218zs`, rendered the same immediate post-submit `/account` state, and matched again after reload with the same retained input plus the same updated rendered summary `Chess.com: and72norcc13225218zs`, so dual-host authenticated account-setting mutation round-trip repeatability streak extension parity passed again for this thirty-seventh fresh run.
