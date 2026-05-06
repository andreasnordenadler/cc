# SQC My Side Quests label rename — 2026-05-06

## Scope
Andreas asked to change the visible navigation/account label from `My Quest Log` to `My Side Quests`.

## Changes made

- Replaced visible UI strings in `src/` from `My Quest Log` to `My Side Quests`.
- This includes the site nav pill and related CTA/helper copy that points users to the account quest surface.

## Verification

- `pnpm lint` passed with only existing accepted warnings.
- `pnpm build` passed.
