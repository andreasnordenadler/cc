# SQC Group Side Quests Scalable Dashboard Simplification — 2026-05-10

## Request

Andreas liked the clearer logged-in Group Side Quests dashboard, but asked to simplify further while accounting for users who may eventually have many finished, live, upcoming, or draft Group Side Quests.

## Change

Updated signed-in `/groupquests` so it scales better:

- simplified the hero copy for logged-in users;
- changed the main prompt to **What needs me?**;
- kept **Needs your attention** as the highest-priority section;
- replaced four equal-weight room buckets with:
  - **Active** compact list: live, upcoming, and drafts in one actionable list;
  - **Finished** compact/recent-results side panel;
- made active room rows denser and list-like instead of card-heavy;
- moved finished rooms out of the main decision path and added a `View all finished` affordance;
- preserved signed-out explainer content.

## Rationale

If a user has many Group Side Quests, the page should not show large card grids for every state. Most visits should answer:

1. What needs me now?
2. Which active room should I open?
3. Where are old results if I need them?

Finished/history should be searchable or paginated later, but it should not compete with live action.

## Verification

- `pnpm lint` passed with 3 known warnings.
- `pnpm build` passed and built `/groupquests`, `/groupquests/create`, and `/groupquests/gq_demo_no_castle_01`.

## Deployment

- Production deploy: `https://cc-dlrf1aio0-andreas-nordenadlers-projects.vercel.app`
- Alias: `https://sidequestchess.com`
- Smoke checks: `/groupquests`, `/groupquests/create`, and `/groupquests/gq_demo_no_castle_01` all returned HTTP 200.
- Authenticated Chrome Apple Events check confirmed the signed-in `/groupquests` page contains `What needs me?`, `Active`, and `View all finished`.
