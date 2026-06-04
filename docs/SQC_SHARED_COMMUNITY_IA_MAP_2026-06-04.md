# SQC Shared Community IA Map — Website + Mobile

Date: 2026-06-04 15:51 Europe/Stockholm  
Owner: Sam  
Status: product/design planning, ready to drive next mobile UI pass

## Why this exists

Andreas likes the current SQC website direction: funny, quirky, graphic, and product-rich. The mobile app is useful, but still risks feeling like a separate utility shell. The complication is that several mobile functions also need website equivalents, especially community/custom Side Quest and Multiplayer features.

The answer is not to make mobile copy the website. The answer is to treat community as a shared SQC product layer, then give each surface the right job.

## Core principle

**SQC has one product model, two expressions:**

- **Website:** browse, understand, share, inspect, moderate, and enjoy the full SQC personality.
- **Mobile:** act quickly, track status, join/start/check/prove, and get reward moments in a compact native shape.

No community feature should become “mobile-only” or “website-only” by accident.

---

## Surface roles

### Website role — the full tavern wall

The website should be where SQC feels richest:

- public discovery and browsing
- creator/profile context
- full quest pages with rules and examples
- public Multiplayer pages and leaderboards
- trophy/proof sharing
- trust cues and moderation/reporting
- stronger visual storytelling, badges, seals, heraldry, quirky copy

### Mobile role — the pocket quest tracker

The app should be fast and native:

- current Solo Side Quest status
- active Multiplayer status
- check proof / refresh proof
- join with invite or public listing
- lightweight community browsing
- create/edit/publish for power users
- Trophy Cabinet and reward moments
- enough SQC humor/graphics to feel like the same world, but not a cramped website clone

---

## Function ownership map

| Capability | Canonical data/state | Website responsibility | Mobile responsibility | Current state | Gap / next action |
|---|---|---|---|---|---|
| Official Solo Side Quest catalog | `CHALLENGES` + release gates | Full browse, rules, quest pages, proof examples, badge identity | Compact browse, start active quest, proof/check status | Both exist | Keep website as visual canon; mobile should use tighter native cards with stronger SQC flavor |
| Active Solo Side Quest | Clerk user metadata: active challenge + attempts/progress | Account/current status and proof pages | Primary home/current state, check proof, completion reward | Mobile strong; website has account/result/proof surfaces | Align copy/reward states so mobile completion feels as premium/funny as website |
| Custom Side Quest creation | Clerk private metadata `customSideQuests` | Should exist for creator workflows, probably richer editor/explanation | Already has create/save/publish/private/draft actions | Mobile ahead of website | Backfill website custom quest management before expanding mobile complexity further |
| Custom Side Quest lifecycle | `visibility`: private/public; `lifecycle`: draft/published/archived | Explain public/private/draft states; manage, edit, archive, publish | Fast create/edit/manage; clear status labels | Mobile strong; website incomplete | Website needs `/account/custom-side-quests` or equivalent |
| Public Community Solo discovery | Published public custom quests from user metadata | Rich discovery page with search/filter, creator cards, trust/reporting | Compact browse/search, start public quest | Mobile has community section via mobile account API; website lacks first-class public page | Add website Community Solo browse before treating mobile community as final |
| Community Solo quest detail | Public custom quest record + creator identity + safe config summary | Public detail page with rules, creator, starts, usage, report | Detail sheet / start action / small creator cue | Mobile has detail-ish flows; website missing | Need canonical web URL for public custom quest |
| Private custom Solo usage in Multiplayer | Host-private snapshots copied into group quest | Explain that private quests can be used by host in Multiplayer but not browsed/reused | Already supported in builder copy | Both partly supported | Keep this rule; make website builder match mobile behavior |
| Public Multiplayer discovery | Clerk private metadata `sqcGroupQuests` with `inviteMode=public` | Rich browse, official/community sections, inspect/join pages | Compact browse/search/filter and join | Both exist; website now has live seeded community content | Mobile should mirror website personality but not duplicate all explanation |
| Multiplayer detail/leaderboard | Group quest record + participants/proof | Full public detail page, leaderboard, rules, shareable URL | Modal/detail sheet, join/leave/refresh/proof actions | Both exist | Harmonize visual hierarchy and terminology |
| Create Multiplayer Side Quest | Host user metadata group quest | Website create flow should be primary rich flow | Mobile create flow for fast hosting | Both exist | Website should remain clearer/richer; mobile create should be simplified and native |
| Hosted/joined Multiplayer management | Related group quest lookup | Account/groupquests page for full management | Active list + host/joined actions | Both exist | Mobile Home should show only active/relevant; deeper lists on Multiplayer tab |
| Official Multiplayer events | Official group quest records | Rich weekly/current/archive leaderboards | Compact official list + standings | Both exist | Keep official separate from community everywhere |
| Trophy Cabinet / Coat of Arms | Challenge progress + custom completions + multiplayer trophies | Public/personal badge vault with heraldry and share links | Reward list, completion celebration, quick proof access | Both exist, website stronger visually | Mobile needs stronger website-canon reward treatment without huge hero clutter |
| Proof pages/sharing | Proof token/result routes + attempts | Public proof pages with share metadata | Copy/share proof, open proof, completion moment | Both exist | Mobile should route to web proof for rich sharing; app shows compact native confirmation |
| Creator identity/profile | Clerk public metadata runner name/bio/chess usernames | Public profile/creator card, quest listings, trust cues | Small creator label in community lists/details | Partly exists | Website needs stronger creator surface for community quests; mobile should show minimal creator identity |
| Moderation/reporting | Not yet robust for community content | Report button, filtering, admin review, public safety copy | Report/flag action or “Open on web to report” | Gap | Must exist before broad community push |
| Search/filter/sort | Derived from public quest records | Rich filters, categories, maybe trending/new/open | Compact search and chips only | Mobile has compact filters for multiplayer/community | Website should own the deeper discovery logic |

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

Mobile should stay simple:

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
- Move deeper browsing/explanation to website links where appropriate.

### Avoid

- A full website clone in React Native.
- Large decorative hero cards that crowd action.
- Duplicating community lists on Home.
- Mobile-only public community concepts that do not have website pages.
- Confusing terms: room/points/By Andreas/official mixed with community.

---

## Sequenced implementation plan

### Phase 1 — Website backfill before major mobile polish

1. Add/strengthen website public Community Solo browse.
2. Add website creator/public custom quest detail route.
3. Add website My Custom Side Quests management parity for draft/private/public/archive.
4. Add website report/trust affordances for community content.

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

Do **Phase 1 first**, even if small. The mobile app already has enough community capability to expose the product direction. The website needs the missing community/custom Solo surfaces so the next mobile UI pass can confidently point to the website for richer browsing and sharing.

Then do the mobile UI pass with the website as visual canon and this rule:

> Mobile is not the website squeezed into a phone. Mobile is the SQC quest tracker you keep in your pocket.
