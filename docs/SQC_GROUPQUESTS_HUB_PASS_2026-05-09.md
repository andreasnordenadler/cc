# SQC Group Quests Hub Pass — 2026-05-09

## Source

Andreas asked for high tempo on Group Quest work and described the right direction: logged-in users should have a hub showing groups they belong to and groups they manage.

## Shipped

- Reframed `/groupquests` from a single room prototype into a hidden multiplayer hub.
- Added a create-draft panel for the next real interaction.
- Added “Managed by you” room cards.
- Added “Groups you belong to” room cards.
- Kept the existing focused room prototype, quest set preview, leaderboard, event feed, and personal-vs-group proof separation rule.
- Kept route hidden/unlinked from public nav/homepage.

## Verification

- `pnpm lint` passed with 3 known warnings.
- `pnpm build` passed and listed `/groupquests` as a built route.

## Next likely slice

Turn “Create draft group quest” into a real client-side draft builder:

1. enter group name;
2. choose one quest;
3. choose invite mode;
4. preview room before persistence.
