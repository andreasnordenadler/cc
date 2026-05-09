# SQC Group Quests Draft Builder — 2026-05-09

## Source

Andreas approved continuing autonomously on the next Group Quests slice: a real draft builder flow for name → choose quest → invite mode → preview draft room.

## Shipped

- Added `src/components/group-quest-draft-builder.tsx` as a client component.
- Wired the builder into the hidden `/groupquests` hub create panel.
- Users can now edit:
  - group name;
  - starting quest;
  - invite mode;
  - proof window;
  - duration.
- The draft preview updates live with:
  - selected quest;
  - invite mode;
  - proof policy;
  - time window;
  - future room slug.
- No persistence yet; the UI clearly labels it draft-only.
- `/groupquests` remains hidden/unlinked.

## Verification

- `pnpm lint` passed with 3 known warnings.
- `pnpm build` passed and listed `/groupquests` as a built route.

## Next likely slice

Add client-side draft room state below the builder:

- create local draft room card when the form is confirmed;
- show it under “Managed by you”; 
- add a “Copy invite text” placeholder;
- still no database writes until schema is decided.
