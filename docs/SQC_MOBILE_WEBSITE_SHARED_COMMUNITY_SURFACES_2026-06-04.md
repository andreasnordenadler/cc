# SQC Mobile + Website Shared Community Surfaces — 2026-06-04

## Source
Andreas confirmed that the mobile app needs a deliberate design pass, but noted the complication that several app functions also belong on the website, especially community/custom Side Quest and Multiplayer discovery.

## Product direction — corrected 2026-06-05
SQC should not split into “website product” and “mobile product.” Andreas reviewed the direction and decided the correct approach is **equal functionality on app and website**.

The website and app should each expose the same core product capabilities: Solo Side Quests, Community Solo, Custom Side Quest create/manage, Multiplayer discovery/join/create/manage, Trophy Cabinet, proof, creator context, support/reporting, and account readiness. The difference is presentation, not capability: website can use wider/richer layouts; mobile should use native, compact interaction patterns. Mobile is not a lesser “pocket tracker,” and website is not the only product canon.

**Standalone-surface rule — added 2026-06-05:** assume most users will use the website **or** the app as their primary SQC home, not both. Do not design required handoffs between surfaces for core functionality. A shareable web URL can still be useful, and the app can still open web links where natural, but neither surface should depend on the other for browse/create/manage/join/prove/share/report/reward flows.

## Shared surface rule
Any community-facing function must be designed as a standalone capability on each surface first, then expressed appropriately per surface:

- **Website:** full functionality with wide-layout browsing, creation, management, proof, sharing, reporting, and account flows.
- **Mobile:** full functionality with native compact browsing, creation, management, proof, sharing, reporting, and account flows.
- **Shared backend/model:** avoid mobile-only or website-only capability gaps unless explicitly approved; avoid website-to-app or app-to-website dependency for core flows.

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
- Avoid implementing community UX on mobile that the website cannot represent, and vice versa; also avoid requiring users to switch surfaces to finish a normal flow.
- Treat mobile Home as action-oriented, but do not use that as a reason to omit deeper mobile functionality; deeper flows can live under mobile tabs/modals.
- Use common terminology across both: Solo Side Quests, Multiplayer Side Quests, SQC Official, Community, Trophy Cabinet.

## Next design task
Create a shared website/mobile community IA map before the next major mobile UI polish pass:

1. List every community/custom/multiplayer function.
2. Mark whether it belongs on website, mobile, or both.
3. Decide the canonical data state and public/private visibility for each.
4. Redesign mobile Home/Solo/Multiplayer/Trophy around that map.
5. Backfill whichever surface is behind so website and app remain functionally equal.

## Success criteria
- Website and mobile feel like one product even when a user only uses one of them.
- Community content is understandable without duplicating confusing navigation.
- Mobile becomes equally capable without becoming a cramped visual copy of the website.
- Neither website nor mobile lags behind the other on public/community capabilities, and neither requires the other for core use.
