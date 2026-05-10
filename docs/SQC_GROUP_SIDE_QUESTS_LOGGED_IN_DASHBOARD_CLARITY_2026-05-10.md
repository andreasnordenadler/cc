# SQC Group Side Quests Logged-In Dashboard Clarity — 2026-05-10

## Request

Andreas said the logged-in Group Side Quests main page was still not clear and agreed to reshape it into a dashboard/control-center rather than a mixed explainer.

## Change

Updated `/groupquests` for signed-in users:

- changed the heading model to **My Group Side Quests**;
- replaced the vague stats row with a concrete **Needs your attention** panel;
- added top-level actions for **Create Group Side Quest** and **Join with invite link**;
- grouped rooms by state:
  - Live now;
  - Starting soon;
  - Drafts you manage;
  - Finished;
- made each room card answer the key questions directly:
  - hosting/playing/draft/finished context;
  - room state;
  - what is next;
  - direct action.

Signed-out explanatory page content was left intact.

## Verification

- `pnpm lint` passed with 3 pre-existing warnings.
- `pnpm build` passed and built `/groupquests`, `/groupquests/create`, and `/groupquests/gq_demo_no_castle_01`.

## Deployment

- Production deploy: `https://cc-l3rm76xwr-andreas-nordenadlers-projects.vercel.app`
- Alias: `https://sidequestchess.com`
- Smoke checks: `/groupquests`, `/groupquests/create`, and `/groupquests/gq_demo_no_castle_01` all returned HTTP 200.
- Authenticated Chrome Apple Events check confirmed the signed-in `/groupquests` page contains `My Group Side Quests`, `Needs your attention`, and `Live now`.
