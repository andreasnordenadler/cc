# SQC homepage feedback simplification — 2026-05-02

## Source

Andreas pointed to `~/Downloads/SQC Beta Test feedback.docx`, containing beta feedback on the SQC homepage/account entry experience.

## Feedback themes applied

- Too confusing / too many items.
- Too many boxes inside boxes.
- “Edit profile” felt off as a primary visible action.
- Text brand lockup (“Side Quest Chess — stupidly hard side quests”) should be replaced by the logo or removed.
- Logged-in homepage should not keep showing generic onboarding that feels irrelevant.
- “3 Step” and small points copy were not visible enough.
- Language mixed “dare”, “challenge”, and “quest”; visible homepage/nav copy should prefer “quest”.

## Change

- Reworked the homepage into one logo-led hero, one recommended first quest panel, one state-aware run card, and three secondary route cards.
- Removed the large route-sprawl grid from the homepage.
- Replaced nav brand text with the current SQC logo.
- Reduced primary nav to Quests / Today / Badges / Support / Account.
- Removed “Edit profile” from the global signed-in nav action; profile editing remains available from account/profile surfaces when needed.
- Changed visible homepage language to prefer “quest” and “proof card”.
- Made points copy read as “points” instead of small `pts` shorthand on the homepage status card.

## Verification

- `pnpm install --frozen-lockfile` passed.
- `pnpm lint` passed.
- `pnpm build` passed.
- Production deploy completed: `https://cc-cw6fljat6-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`.
- Live smoke passed for `/`, `/challenges`, `/account`, `/support`, and `/sqc-logo.png`.
- Homepage HTML confirms new simplified copy (`Play normal chess. Complete weird quests.`, `Start a quest`, `View proof card`) and no longer contains the old visible `Edit profile`, `Open today’s dare`, or `Your chaos status` homepage strings.
