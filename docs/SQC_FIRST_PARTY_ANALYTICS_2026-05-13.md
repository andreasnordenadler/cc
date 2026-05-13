# SQC first-party analytics — 2026-05-13

## Purpose

Give Andreas a simple launch-monitoring view of whether users start using Side Quest Chess and what they do next, without adding a third-party tracker.

## What v1 tracks

Stored for signed-in users in Clerk private metadata under `sqcAnalytics`:

- `page_view` for in-app route changes
- `profile_saved` when chess usernames/profile details are saved
- `quest_started` when a quest is activated
- `quest_completed` when a latest-game verifier passes
- `quest_failed` when a latest-game verifier fails
- `quest_pending` when a latest-game verifier cannot prove completion yet

Anonymous page views are accepted by `/api/analytics` and logged server-side, but not tied to a user profile.

## Dashboard

Private dashboard route: `/admin/analytics`

Access is allowed when either:

- Clerk user `publicMetadata.sqcAdmin === true`
- Clerk user `privateMetadata.sqcAdmin === true`
- the user's primary email is included in `SQC_ADMIN_EMAILS`

Dashboard sections:

- tracked users / page views / quest starts / completions / failures
- quest popularity and failure/pending summary
- per-user activity rows
- recent event trail

## Admin helper

Local helper script:

```bash
SQC_ENV_FILE=.env.local pnpm admin:grant-analytics user@example.com
```

This sets `privateMetadata.sqcAdmin = true` on the matching Clerk user.

## Notes

This is intentionally lightweight for close launch monitoring. If traffic grows or we need long-term funnels/cohorts, migrate event storage from Clerk metadata to a database-backed event table while keeping the same event names.
