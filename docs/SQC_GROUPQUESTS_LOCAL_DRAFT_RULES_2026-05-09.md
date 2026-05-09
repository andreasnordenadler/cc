# SQC Group Quests Local Draft + Mandatory Rules — 2026-05-09

## Source

Andreas approved continuing autonomously and asked to consider group owners manipulating rules, including making certain provider/game settings mandatory from a Lichess screenshot to follow.

## Shipped

- Extended `GroupQuestDraftBuilder` with first-pass mandatory game setting constraints:
  - speed;
  - rated/casual state;
  - variant;
  - player color.
- Added live preview of mandatory rules.
- Added “Create local draft” behavior that creates a browser-session draft room card below the builder.
- Added “Copy invite text” placeholder.
- Still no database writes; this remains hidden/unlinked and draft-only.

## Notes

The current options are intentionally generic and can be refined to match the exact Lichess screenshot controls once received. The important product/data shape is now present: room owners can make game provider settings mandatory per group quest.

## Verification

- `pnpm lint` passed with 3 known warnings.
- `pnpm build` passed and listed `/groupquests` as a built route.
