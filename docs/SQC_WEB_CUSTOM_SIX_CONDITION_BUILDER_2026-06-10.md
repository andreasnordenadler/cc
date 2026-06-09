# SQC Web Custom Solo six-condition builder — 2026-06-10

## Slice

Closed the next website Custom Solo creator parity gap versus mobile-v251: the `/account/custom-side-quests` website builder now supports up to six proof conditions, matching the mobile custom-rule cap, instead of stopping at two conditions.

## What changed

- Reused the existing website form/card style; no visual redesign or navigation changes.
- Added optional condition slots 2–6 with the same safe condition types as the mobile app: game result, opening pattern, move pattern, and piece state.
- Keeps `Complete every condition` / `Complete any one condition` logic across the full six-condition stack.
- Prefills existing saved rules up to six conditions when editing on the website.
- Continues preserving unusually larger/mobile-future rule stacks instead of collapsing them during metadata/state edits.

## Verification

- `pnpm lint -- src/app/account/custom-side-quests/page.tsx`
- `pnpm build`
