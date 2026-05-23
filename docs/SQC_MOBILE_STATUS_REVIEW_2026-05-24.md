# SQC Mobile Status Review — 2026-05-24

## Executive read

**Status: promising preview, not yet launch-ready.**

The app now has a much stronger mobile-specific Solo Side Quest flow than it had a few days ago:
- logged-in preview UX is far clearer,
- Browse Solo Side Quests is much closer to the website’s logic,
- completed quests now feel more distinct,
- proof handoff now points at the same public proof-scroll route shape as the website.

But the app is still not ready to call "done" because the core product loop is only **partly native** and some of the current surfaces are still more like a polished preview shell than a complete player app.

## What is working well now

### Solo Side Quest mobile UX
- Empty states are much better and more on-brand.
- Browse Solo Side Quests now works as a compact, closeable picker instead of a noisy deck.
- Completed, available, and Coming Soon states are much easier to distinguish.
- Difficulty labels are now closer to website visual language.
- Completed quests open a dedicated proof-oriented screen instead of the generic quest detail.

### Visual/product direction
- The app is finally starting to feel like **SQC mobile**, not a generic tracker app.
- The dark/gold palette, coat-of-arms treatment, and proof/completion moments are meaningfully stronger.
- The app is now much less confused about terminology: `Side Quest`, `Completed`, `View victory proof`, etc.

### Proof route direction
- Mobile preview proof links now use `/proof/...` shape rather than fake `/result/...` links.
- Website support for preview proof tokens was added and deployed so preview proof handoff can behave more like the real product.

## What is still missing or weak

## 1. Core solo loop is still incomplete

This is still the biggest product gap.

### Missing / incomplete
- **Submit specific game URL** is still missing natively.
  - If latest-game detection misses, mobile still lacks the strongest recovery path.
- **Deactivate active quest** is still missing as a clear native action.
- **Proof/share parity is still web-handoff-heavy**.
  - The app can open proof, but it is still mostly handing the reward moment to web rather than owning it natively.
- **Reset flow exists, but full repeatability needs a careful real-user pass**.

### Tomorrow priority
1. specific game submit
2. deactivate/change active quest
3. verify the whole native completed -> proof -> reset -> retry loop with a realistic account state

## 2. Home / app architecture still needs tightening

The current app is better, but it still does not fully match the strongest app definition:
> Open SQC. See what to do next. Check if it counted.

### Current issues
- There is still too much legacy structure in the app shell.
- Navigation/state naming still reflects older experiments (`coatOfArms`, tracker/dashboard layering, etc.).
- The app is not yet a clean, obvious **Home-first command center**.
- Some surfaces still feel like multiple competing concepts rather than one crisp product.

### Tomorrow priority
- Decide whether to keep the current shell as the base, or do a more aggressive cleanup toward:
  - Home
  - Side Quests
  - Multiplayer
  - Proof
  - Account

## 3. Multiplayer is still far behind solo

Multiplayer remains a major parity gap.

### Current state
- There is some surface coverage.
- But it is not yet a strong native product flow for:
  - browsing official Multiplayer Side Quests,
  - joining,
  - tracking current standing,
  - understanding live vs soon vs finished,
  - feeling like this is a first-class mobile use case.

### Tomorrow priority
Not first task tomorrow unless you want it — but it remains a major phase after solo-loop cleanup.

## 4. Native proof/reward experience is still partial

The product truth is that proof is one of SQC’s strongest reward moments.

### Current state
- Completed mobile detail is better.
- Public proof scroll handoff is now better aligned.
- But the app still does **not fully own** the reward/share moment natively.

### Missing / weak
- native proof image viewing feels limited
- native share-sheet flow for proof could be better
- completed proof screen still has room to feel more ceremonial / rewarding
- coat-of-arms / proof collection experience could be clearer and more addictive

### Tomorrow priority
After core solo loop issues, this is one of the best polish/value areas.

## 5. Production / release hygiene still needs work

### Important non-product gaps
- Deploy path is fragile from the main dirty workspace because local artifacts can poison Vercel upload size.
- Clean deploy succeeded only after switching to a clean temporary clone/worktree approach.
- The repo still has a lot of local artifact clutter around mobile previewing.
- This makes release work riskier than it should be.

### Tomorrow priority
- clean up deploy/release hygiene
- tighten ignore rules / artifact handling
- document the safe deploy path for SQC mobile/web touches

## Recommended tomorrow work order

### Tier 1 — do first
1. **Audit and finish the native solo loop**
   - start
   - check
   - submit specific game
   - completed proof
   - reset
   - retry
   - deactivate/change active quest
2. **Do a real UX pass on the primary logged-in path**
   - what do I do next?
   - what is active?
   - did it count?
   - where is proof?

### Tier 2 — high-value polish
3. **Upgrade the proof/reward moment**
   - stronger completed screen
   - better proof/share flow
   - clearer coat-of-arms reward loop
4. **Simplify app information architecture**
   - remove legacy tracker feel
   - make the shell more obviously product-shaped

### Tier 3 — next phase after that
5. **Multiplayer native parity**
6. **Account/settings cleanup**
7. **Store/release readiness pass**

## Blunt conclusion

The app is no longer in the "confused prototype" zone.
It is now in the **"real product taking shape, but the loop still needs finishing"** zone.

That is good news.

Tomorrow, the best use of time is **not** random surface polish.
The best use of time is to make the entire Solo Side Quest loop feel complete, reliable, and intentional from start to proof to repeat.
