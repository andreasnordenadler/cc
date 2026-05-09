# SQC Mobile UI Review — 2026-05-09

## Directive

Andreas asked for full focus on SQC Mobile and a big UI review before further implementation.

Hard constraint: **SQC Mobile must follow the Side Quest Chess website look and feel.** The website is the visual/product canon; mobile should compress and clarify it, not invent a separate product language.

Website freeze remains in force: this review targets the mobile app only. No new SQC website features are implied.

## Current mobile state reviewed

Reviewed current `apps/mobile/App.tsx`, website canon (`src/app/page.tsx`, `src/app/challenges/page.tsx`, `src/components/site-nav.tsx`, `src/app/globals.css`), current mobile screenshots/artifacts, and the mobile app plan.

Current mobile strengths:

- Strong SQC identity is already present: dark background, gold accents, heraldic reward art, weird-chess tone.
- Public quest browsing works without auth, which is the right fallback while Clerk Native API is pending.
- Quest cards are visually scannable: difficulty, points, title, objective, reward art.
- The app already respects the architecture rule: website/backend owns quest definitions, verifier logic, account state, and proof receipts.
- Recent Android builds were stable after the startup crash fixes; emulator smoke confirmed live quest board rendering.

Current mobile weaknesses:

- First screen is too much “companion explainer” and not enough “what should I do next?”
- Hero/header consumes too much vertical space before core actions.
- Build/version pill is too prominent for a product UI; it should become a small debug/footer detail.
- The app’s information architecture does not yet match the website clearly enough: website nav is Home / Side Quests / Coat of Arms / My Side Quests, while app tabs are Quests / Detail / Me / Status / Proof.
- Several cards explain the website/mobile split repeatedly, making the app feel secondary rather than confidently useful.
- Important website concepts are not yet first-class enough in mobile: current active quest, proof receipt history/log, coat shelf, next reward, completed coats.
- Card density is high in places, but mobile hierarchy is still not tight enough: too many cards compete above the fold.

## Comparable app patterns used as inspiration

Sources checked as inspiration, not as authority:

- Chess.com App Store: https://apps.apple.com/us/app/chess-play-learn-online/id329218549
- Lichess App Store: https://apps.apple.com/us/app/lichess/id1662361230
- Duolingo App Store: https://apps.apple.com/us/app/duolingo-language-lessons/id570060128
- Strava App Store: https://apps.apple.com/us/app/strava-run-bike-walk/id426826309
- Nike Run Club App Store: https://apps.apple.com/us/app/nike-run-club-running-coach/id387771637
- React Native accessibility docs: https://reactnative.dev/docs/accessibility
- Apple tab bar guidance: https://developer.apple.com/design/human-interface-guidelines/tab-bars
- Material navigation bar guidance: https://m3.material.io/components/navigation-bar/overview

Useful patterns for SQC:

- Chess.com / Lichess: fast entry to core play/browse flows, clear separation between play, puzzles/quests, profile, and analysis/status.
- Duolingo: one dominant next action, visible progression, bite-sized nodes, celebratory reward states.
- Strava / Nike Run Club: personal progress, streaks, achievement history, challenge identity, opt-in sharing.
- Mobile platform guidance: keep bottom navigation to 4–5 major destinations, make tap targets large, avoid hidden primary actions, maintain high contrast and accessible labels.

## Website parity canon for mobile

Mobile should mirror the website’s product structure:

1. **Home** — signed-in/signed-out landing, active quest cockpit, one next action.
2. **Side Quests** — browse/pick quests, recommended starts, difficulty/heroism framing.
3. **Coat of Arms** — rewards, unlocked coats, upcoming/locked preview.
4. **My Side Quests** — account, active quest, connected usernames, progress, receipts.
5. **Proof / Status** — verifier/result/proof receipt flow, only as a top-level area if it becomes active enough; otherwise it can live inside My/Quest detail.

Mobile can compress this, but labels should stay close to the website:

- Prefer **Side Quests** over generic “Quests”.
- Prefer **Coat of Arms** or **Coats** over generic “Rewards”.
- Prefer **My Side Quests** over generic “Me” if space allows.
- Keep **Proof** tied to receipts and verifier outcomes, not generic status.

## Priority recommendations

### P0 — Make the first screen an active quest cockpit

The current first screen should be refocused around one question: **what is the next SQC action?**

Above the fold should show:

- SQC brand lockup, compact.
- Active quest or suggested starter quest.
- One primary CTA:
  - signed out: “Sign in / Open website setup” until Clerk Native API is ready;
  - signed in with no quest: “Pick a side quest”;
  - signed in with active quest: “Check latest game” or “Open active quest”;
  - completed quest: “View proof”.
- Mini progress strip: coats earned, active quest, proof receipts/streak if available.

Move long explanation and build label lower.

### P0 — Align bottom navigation with website canon

Replace the current Quests / Detail / Me / Status / Proof model with a website-parity model.

Recommended first version:

1. **Home**
2. **Side Quests**
3. **Coats**
4. **My SQC**

Optional fifth later: **Proof** if receipt/checking becomes a frequent native action.

Reason: the website already has a clear simple nav. Mobile should feel like the same product in the user’s pocket.

### P0 — Stop making the app sound apologetic

Current copy repeatedly says the website is authoritative and mobile cannot mutate account state yet. That is technically true but over-presented.

Better pattern:

- Keep one honest “website handles account setup for now” card.
- Elsewhere, present mobile as useful: browse, prepare, track, share, and inspect rewards.
- Turn limitations into crisp handoffs, not apologies.

Example tone:

- Current-ish: “website remains authoritative.”
- Better: “Quest setup opens on the web board. Your mission brief stays here.”

### P1 — Build a mobile “Today’s Side Quest” card

Borrow the best of Duolingo/Strava without copying them:

- One featured quest or active quest.
- Goal in one line.
- Reward preview.
- Progress/status chip.
- One action.

This should become the mobile home anchor.

### P1 — Make Coat of Arms a first-class mobile surface

The website’s coat-of-arms identity is one of SQC’s strongest differentiators. Mobile should not hide it under proof preview.

Add/strengthen:

- earned coats shelf;
- locked/upcoming coats preview;
- next unlock card;
- completed receipt → coat identity → share proof flow.

### P1 — Reduce card stack density above the fold

Current app has: hero, quick start, website parity dock, first-run card, auth card, Clerk readiness, tabs, then actual content.

For normal users, this is too much.

Recommended order:

1. Compact header.
2. Today’s Side Quest / Active Quest cockpit.
3. Bottom nav or sticky nav.
4. Current tab content.
5. Debug/readiness cards lower or behind a diagnostics/debug section.

### P1 — Treat onboarding as the product flow

Instead of a separate tutorial, use empty states:

- No account: “Start with a public quest preview.”
- No chess username: “Connect Lichess or Chess.com on the web board.”
- No active quest: “Pick your first side quest.”
- No proof: “Play one public game, then check it.”

Each empty state should include one clear CTA.

### P2 — Tighten visual tokens to match website exactly

The app already uses the website palette. Next step is stricter parity:

- source mobile colors from the website token names (`ink`, `muted`, `bg`, `panel`, `line`, `gold`, `pink`, `green`, `blue`, `orange`, `danger`);
- use the same logo treatment as `SiteNav`;
- keep card radii, gold/pink/green accent meanings consistent;
- prefer website labels and copy patterns.

### P2 — Make accessibility a design requirement now

Minimum mobile UI standard:

- 44–48px minimum tap targets;
- strong contrast on small all-caps labels;
- accessibility labels on icon-only or badge-like buttons;
- do not rely on color alone for pass/fail/pending;
- reduce-motion-compatible reward moments later.

### P2 — Use social/share carefully

SQC’s shareable proof is a strength, but avoid making beginners feel exposed.

Default pattern:

- progress private by default;
- sharing opt-in and celebratory;
- proof share only after a meaningful completion.

## Recommended implementation slices

### Slice 1 — Mobile IA + first-screen hierarchy

- Add Home tab.
- Replace current initial stack with compact header + Today’s Side Quest cockpit.
- Move build label/readiness/debug cards lower.
- Rename tabs toward website canon.

Risk: low, app-only.

### Slice 2 — Coats surface

- Add Coats/Coat of Arms tab.
- Show earned/locked previews from existing API data.
- Keep proof receipt actions inside the relevant coat/proof card.

Risk: low-to-medium, app-only; depends on available mobile API shape.

### Slice 3 — Account/proof state clarity

- Turn current auth/status/proof cards into state-driven empty states.
- Reduce repeated website-authority copy.
- Ensure every state has exactly one next action.

Risk: low, app-only.

### Slice 4 — Clerk Native API activation test

After Clerk Native API/env is ready:

- rebuild APK;
- test Google sign-in;
- verify `/api/mobile/account` accepts bearer token;
- only then expose account mutation actions natively.

Risk: medium; auth-specific.

## Non-goals for now

- Do not add new website features.
- Do not fork quest/verifier/proof logic into mobile.
- Do not add mobile-only quest definitions.
- Do not build social feeds or leaderboards before the core mobile loop is clean.

## Immediate recommendation

Start with **Slice 1: Mobile IA + first-screen hierarchy**.

It best matches Andreas’s instruction: full focus on SQC Mobile, better UI, popular-app-inspired hierarchy, and strict website look/feel parity. It is also app-only and respects the website feature freeze.
