# SQC Mobile + Website Shared Community Surfaces — 2026-06-04

## Source
Andreas confirmed that the mobile app needs a deliberate design pass, but noted the complication that several app functions also belong on the website, especially community/custom Side Quest and Multiplayer discovery.

## Product direction
SQC should not split into “website product” and “mobile product.” The website is the visual/product canon: funny, quirky, graphic, and clearly Side Quest Chess. Mobile should feel like the pocket quest tracker version of the same product, not a separate generic utility app.

## Shared surface rule
Any community-facing function must be designed as a cross-surface capability first, then expressed appropriately per surface:

- **Website:** richer discovery, explanation, browsing, profiles, sharing, moderation/reporting, and public pages.
- **Mobile:** fast action, status, proof, joining/starting/checking, compact browsing, and reward moments.
- **Shared backend/model:** avoid mobile-only or website-only community states unless explicitly intentional.

## Affected functions
- Public custom Solo Side Quest discovery.
- Custom Side Quest create/edit/publish/private/draft lifecycle.
- Public Multiplayer Side Quest discovery and joining.
- Hosted/joined Multiplayer management.
- Trophy Cabinet / Coat of Arms proof and sharing.
- Community trust cues, creator identity, and eventual moderation/reporting.

## Design implications
- Keep the website’s SQC personality as canon: quirky names, graphic coats of arms, stamps/proof, playful “bad idea” copy.
- Keep mobile native and dense, but not sterile: Apple Sports-style clarity plus SQC visuals/microcopy.
- Avoid implementing community UX on mobile that the website cannot represent, and vice versa.
- Treat Home as action-oriented on mobile; use website pages for broader browsing/explanation.
- Use common terminology across both: Solo Side Quests, Multiplayer Side Quests, SQC Official, Community, Trophy Cabinet.

## Next design task
Create a shared website/mobile community IA map before the next major mobile UI polish pass:

1. List every community/custom/multiplayer function.
2. Mark whether it belongs on website, mobile, or both.
3. Decide the canonical data state and public/private visibility for each.
4. Redesign mobile Home/Solo/Multiplayer/Trophy around that map.
5. Backfill website surfaces where mobile currently has functionality first.

## Success criteria
- Website and mobile feel like one product.
- Community content is understandable without duplicating confusing navigation.
- Mobile becomes more delightful without becoming a cramped copy of the website.
- Website does not lag behind mobile on public/community capabilities.
