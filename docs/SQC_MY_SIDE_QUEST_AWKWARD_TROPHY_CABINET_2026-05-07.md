# SQC My Side Quest awkward trophy cabinet — 2026-05-07

## Request
Andreas asked to improve how completed quests are shown on the My Side Quest page: fancy, funny, awkward, like the player is supposed to be proud of completed quests — but not really.

## Change
- Reworked `/account` completed quests from a plain list into an “awkward trophy cabinet”.
- Added a ceremonially over-serious section title and subcopy.
- Added summary stats with SQC tone: questionable triumphs, suspicious points, receipts in the evidence drawer.
- Turned completed quests into larger trophy cards with coat-of-arms focus, awkward ribbon labels, and funny supporting lines.
- Kept each trophy linking to the quest detail page and preserving completion time display.

## Verification
- `pnpm lint` passed with warnings only.
- `pnpm build` passed.
