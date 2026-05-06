# SQC completed quest compact title overlap — 2026-05-06

## Scope
Andreas asked to compact the completed quest hero layout: let `Proof Loop Test` use two rows and extend under the wax seal, with the seal sitting on top of it, and give the highlighted title/body copy a wider area to extend across at least half of the section.

## Changes made

- Reduced the completed hero's right/reward-art grid column so the text column gets more horizontal room.
- Reduced completed hero min-height to make the section more compact.
- Moved the wax seal further right and higher so it overlays the title/text area like a stamp on top of the section.
- Made the seal slightly larger while keeping it away from the quest coat-of-arms reward art.
- Removed right padding from completed copy so the title/body text can extend under the seal instead of stopping before it.
- Added completed-title max-width rules so `Proof Loop Test` can occupy a wider/two-row title area.

## Verification

- `pnpm lint` passed with only existing accepted warnings.
- `pnpm build` passed.
