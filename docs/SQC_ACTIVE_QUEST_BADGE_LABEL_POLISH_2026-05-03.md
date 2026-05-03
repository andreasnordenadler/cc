# SQC Active Quest Badge Label Polish — 2026-05-03

## Change
- Updated the quest hub active quest card label from `Continue now` to `Active quest`.
- Removed the separate green `active` indicator pill.
- Added the current quest badge before the quest title using the existing bare badge presentation, so `Knights Before Coffee` and other active quest names are visually anchored by their badge without an extra square/card wrapper.

## Verification
- `pnpm install --frozen-lockfile`
- `pnpm lint`
- `pnpm build`

## Files changed
- `src/app/challenges/page.tsx`
- `src/app/globals.css`
