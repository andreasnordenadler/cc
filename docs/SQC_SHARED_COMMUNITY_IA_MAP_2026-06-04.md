# SQC Shared Community IA Map — Website + Mobile

Date: 2026-06-04 15:51 Europe/Stockholm  
Owner: Sam  
Status: product/design planning, ready to drive next mobile UI pass

## Why this exists

Andreas likes the current SQC website direction: funny, quirky, graphic, and product-rich. The mobile app is useful, but still risks feeling like a separate utility shell. The complication is that several mobile functions also need website equivalents, especially community/custom Side Quest and Multiplayer features.

The answer is not to make mobile visually copy the website. The answer is to treat community as a shared SQC product layer with **equal functionality** on both website and app, then adapt layout and interaction patterns to each surface.

## Core principle

**SQC has one product model, two equal surfaces:**

- **Website:** full SQC functionality in a wide, rich, graphic layout.
- **Mobile:** full SQC functionality in a compact, native, touch-first layout.

No community feature should become “mobile-only” or “website-only” by accident. Differences should be interaction/design differences, not missing capabilities.

---

## Surface roles — corrected 2026-06-05

### Website role — full SQC in a wide layout

The website should support the full product: public discovery and browsing, creator/profile context, full quest pages with rules and examples, Custom Side Quest creation/management, public Multiplayer discovery/join/create/manage, leaderboards, trophy/proof sharing, trust cues, moderation/reporting, and account readiness.

### Mobile role — full SQC in a native layout

The app should support the same functional product: public discovery and browsing, creator context, quest detail, Custom Side Quest creation/management, Multiplayer discovery/join/create/manage, proof/check flows, Trophy Cabinet, sharing/reporting/support, and account readiness. Mobile may prioritize fast actions and compact cards, but it must not omit core functionality just because the website has it.

---

## Function ownership map

| Capability | Canonical data/state | Website responsibility | Mobile responsibility | Current state | Gap / next action |
|---|---|---|---|---|---|
| Official Solo Side Quest catalog | `CHALLENGES` + release gates | Full browse, rules, quest pages, proof examples, badge identity | Compact browse, start active quest, proof/check status | Both exist | Keep website and mobile feature-equal; use shared copy/data with surface-appropriate layouts |
| Active Solo Side Quest | Clerk user metadata: active challenge + attempts/progress | Account/current status and proof pages | Primary home/current state, check proof, completion reward | Both should expose current status/proof/reward state | Keep website and mobile completion/proof functionality equivalent |
| Custom Side Quest creation | Clerk private metadata `customSideQuests` | Should exist for creator workflows, probably richer editor/explanation | Already has create/save/publish/private/draft actions | Mobile ahead of website | Backfill website custom quest management before expanding mobile complexity further |
| Custom Side Quest lifecycle | `visibility`: private/public; `lifecycle`: draft/published/archived | Explain public/private/draft states; manage, edit, archive, publish | Fast create/edit/manage; clear status labels | Mobile strong; website incomplete | Maintain equal create/manage/edit/archive/publish capability across website and mobile |
| Public Community Solo discovery | Published public custom quests from user metadata | Rich discovery page with search/filter, creator cards, trust/reporting | Compact browse/search, start public quest | Mobile has community section via mobile account API; website lacks first-class public page | Keep public Community Solo browse/search/filter/start available on both website and mobile |
| Community Solo quest detail | Public custom quest record + creator identity + safe config summary | Public detail page with rules, creator, starts, usage, report | Detail sheet / start action / small creator cue | Mobile has detail-ish flows; website missing | Both need usable detail views; web URL remains shareable canonical link |
| Private custom Solo usage in Multiplayer | Host-private snapshots copied into group quest | Explain that private quests can be used by host in Multiplayer but not browsed/reused | Already supported in builder copy | Both partly supported | Keep this rule; make website builder match mobile behavior |
| Public Multiplayer discovery | Clerk private metadata `sqcGroupQuests` with `inviteMode=public` | Rich browse, official/community sections, inspect/join pages | Compact browse/search/filter and join | Both exist; website now has live seeded community content | Both need discovery/join/detail; mobile can collapse explanation behind native detail affordances |
| Multiplayer detail/leaderboard | Group quest record + participants/proof | Full public detail page, leaderboard, rules, shareable URL | Modal/detail sheet, join/leave/refresh/proof actions | Both exist | Harmonize visual hierarchy and terminology |
| Create Multiplayer Side Quest | Host user metadata group quest | Website create flow should be primary rich flow | Mobile create flow for fast hosting | Both exist | Both should support create; website can be richer, mobile can be compact/native |
| Hosted/joined Multiplayer management | Related group quest lookup | Account/groupquests page for full management | Active list + host/joined actions | Both exist | Both should support active/relevant summaries plus deeper lists in appropriate navigation |
| Official Multiplayer events | Official group quest records | Rich weekly/current/archive leaderboards | Compact official list + standings | Both exist | Keep official separate from community everywhere |
| Trophy Cabinet / Coat of Arms | Challenge progress + custom completions + multiplayer trophies | Public/personal badge vault with heraldry and share links | Reward list, completion celebration, quick proof access | Both exist, website stronger visually | Mobile needs stronger website-canon reward treatment without huge hero clutter |
| Proof pages/sharing | Proof token/result routes + attempts | Public proof pages with share metadata | Copy/share proof, open proof, completion moment | Both exist | Both should show proof and support sharing; web URL can remain canonical for external sharing |
| Creator identity/profile | Clerk public metadata runner name/bio/chess usernames | Public profile/creator card, quest listings, trust cues | Small creator label in community lists/details | Partly exists | Both need creator context; mobile can present it compactly |
| Moderation/reporting | Not yet robust for community content | Report button, filtering, admin review, public safety copy | Native report/flag action plus support path | Gap | Must exist before broad community push |
| Search/filter/sort | Derived from public quest records | Rich filters, categories, maybe trending/new/open | Compact search and chips only | Mobile has compact filters for multiplayer/community | Both should support meaningful discovery; website can expose more filters at once |

---

## Navigation model

### Website navigation recommendation

Website should expose community in a way that feels intentional, not like hidden account metadata:

1. **Side Quests**
   - SQC Official
   - Community Solo Side Quests
   - Create / My Custom Side Quests when signed in
2. **Multiplayer**
   - SQC Official Multiplayer
   - Community Multiplayer
   - My hosted/joined Multiplayer
3. **Trophy Cabinet**
   - Official Coat of Arms
   - My unlocked rewards
   - Multiplayer trophies
4. **Profile / Creator pages**
   - creator bio
   - public custom Side Quests
   - public Multiplayer hosted by creator
   - proof/trophy highlights

### Mobile navigation recommendation

Mobile should stay simple without losing functionality:

1. **Home**
   - current Solo Side Quest
   - active Multiplayer summary
   - next action
   - small Trophy Cabinet preview
   - no giant community lists
2. **Solo Side Quests**
   - SQC Official
   - Community
   - My Custom Side Quests
3. **Multiplayer**
   - Your active/hosted/joined
   - SQC Official
   - Community Multiplayer
   - Join with code / Create
4. **Trophy Cabinet**
   - unlocked coats
   - multiplayer trophies
   - proof/share actions
5. **Account/Profile**
   - chess accounts
   - creator name/bio
   - support/settings

---

## Mobile design pass direction

The next mobile UI pass should not add more sections. It should make existing sections feel more like SQC.

### Keep

- Native density and quick actions.
- Home as “what should I do next?”
- Separate SQC Official vs Community.
- Solo vs Multiplayer as the primary play split.
- Trophy Cabinet as the reward destination.

### Change

- Replace generic dashboard feeling with more SQC-world language and artifacts.
- Use website-canon graphic motifs: coats of arms, seals, proof stamps, parchment/gold/red accents — but in compact form.
- Give community cards creator/trust cues without making the list noisy.
- Make Home less like a menu and more like a quest status board.
- Put deeper browsing/explanation in mobile tabs, sheets, or detail screens rather than removing it.

### Avoid

- A visual website clone in React Native.
- Large decorative hero cards that crowd action.
- Duplicating giant community lists on Home; keep them in the proper mobile section.
- Mobile-only public community concepts that do not have website pages.
- Confusing terms: room/points/By Andreas/official mixed with community.

---

## Sequenced implementation plan

### Phase 1 — Equal-functionality correction

1. Audit recent website/mobile copy that frames mobile as only a pocket tracker or website as the only rich/canonical surface.
2. Replace it with equal-functionality language: both surfaces can browse, create, manage, join, prove, share, and report.
3. Identify concrete capability gaps in both directions and queue the missing parity work.
4. Preserve surface-appropriate design: website can be wider/richer; mobile can be compact/native.

### Phase 2 — Shared terminology and data cleanup

1. Confirm exact labels across surfaces:
   - SQC Official
   - Community
   - Solo Side Quest
   - Multiplayer Side Quest
   - Trophy Cabinet
2. Add shared helpers where practical for source labels, public/private states, and creator names.
3. Ensure website and mobile hide/flag low-quality/test/demo content consistently.

### Phase 3 — Mobile UI identity pass

1. Redesign Home as a compact quest status board.
2. Restyle Solo/Community cards with small coat/seal markers and creator cues.
3. Restyle Multiplayer list/detail with clearer official/community split and more playful proof copy.
4. Strengthen Trophy Cabinet reward presentation.
5. Keep all changes screenshot-driven on emulator before release.

### Phase 4 — Release proof

1. Website smoke: `/`, `/challenges`, `/groupquests`, `/groupquests/public`, new community pages, `/badges`.
2. Mobile gates: typecheck, focused lint, release gate, Next build, Android lint/release build.
3. Emulator screenshots: Home, Solo official/community, Multiplayer official/community, Trophy Cabinet.
4. APK release only after screenshot review passes.

---

## Recommendation

Do **Phase 1 first**: correct the product model and copy. The new rule is:

> SQC website and SQC mobile are equal in functionality. Website is the wide/rich expression; mobile is the compact/native expression. Neither surface is subordinate.

Then continue parity work by auditing gaps in both directions and implementing the missing capability on whichever surface is behind.
