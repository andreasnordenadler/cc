# SQC completed quest wax seal layout and date-only copy — 2026-05-06

## Scope
Andreas confirmed the wax seal now looks good and asked to tune the completed quest hero layout: make the seal sit on top of the section, overlap the text a bit, make it slightly larger, and remove the time from the completion label.

## Changes made

- Enlarged the completed wax seal.
- Moved the seal higher and further over the quest title/text area so it reads like it is stamped on top of the hero section.
- Kept the seal away from the quest coat-of-arms reward art.
- Reduced the completed title padding so overlap feels intentional instead of creating a large empty gap.
- Changed `formatCompletedDate` to date-only output, removing hour/minute from the completion pill.

## Verification

- `pnpm lint` passed with only existing accepted warnings.
- `pnpm build` passed.
