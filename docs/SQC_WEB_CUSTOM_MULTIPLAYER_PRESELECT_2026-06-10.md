# SQC web Custom Solo to Multiplayer preselect — 2026-06-10

Closed a small website parity gap versus mobile-v251: mobile's `Use in Multiplayer` action opens the Multiplayer creator with the selected Custom Solo recipe already chosen, while website links only opened a blank/default Multiplayer builder.

## Shipped

- `/groupquests/create` accepts a safe `?quest=` query parameter.
- The Multiplayer draft builder preselects the requested quest only when it is present in the signed-in host's launch-ready picker list.
- Custom Solo library cards now send `Use in Multiplayer` to `/groupquests/create?quest={customId}`.
- Public Community Solo detail pages use the same handoff URL; it preselects only when the signed-in host has that custom recipe available, otherwise the builder falls back to the existing safe default.

## Privacy and safety

- No public/community raw custom config is exposed through the URL.
- The existing create API ownership/lifecycle/rule validation remains the source of truth.
- Unsupported or unavailable quest IDs fall back to the previous default selected quest.

## Verification

- `pnpm lint -- src/app/groupquests/create/page.tsx src/components/group-quest-draft-builder.tsx src/app/account/custom-side-quests/page.tsx 'src/app/challenges/community/[id]/page.tsx'`
- `pnpm build`
