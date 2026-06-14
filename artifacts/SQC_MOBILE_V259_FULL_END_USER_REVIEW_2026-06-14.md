# SQC Mobile v259 — Full End-User Review

Date: 2026-06-14 22:22–22:34 Europe/Stockholm  
APK reviewed: `artifacts/mobile-releases/sqc-mobile-android-v259-2026-06-14.apk`  
Installed metadata observed in app: `mobile-v259`, app `0.1.259 (259)`, package `com.sidequestchess.app`  
Reviewer account/state: signed-in SAM account (`samnordbot@gmail.com`), Lichess/Chess.com usernames `and72nor`; active Solo Side Quest `Knights Before Coffee`; active Multiplayer Side Quest `Endgame Goblin League`.

## Evidence

- Screenshot/XML folder: `artifacts/emulator-screenshots/sqc-v259-end-user-review-2026-06-14/`
- Guided capture helper: `tmp/sqc_v259_end_user_review.py`
- Captured surfaces:
  - Today dashboard top + scrolled
  - Main hamburger menu
  - Solo Side Quest catalog
  - Community Solo Side Quests Discover / My Custom selected states
  - Multiplayer Lobby top + scrolled
  - Trophy Cabinet top + scrolled
  - My SQC / Account surfaces
  - My Custom Side Quests
  - Create Multiplayer Side Quest top + scrolled
  - Help & Support

## Verification already passed before review

- `pnpm mobile:smoke:hamburger -- --apk artifacts/mobile-releases/sqc-mobile-android-v259-2026-06-14.apk` passed.
- The smoke includes the v259 regression check: both `Discover` and `My Custom` labels remain visible in both selected states.

## Verdict

**Yellow.** v259 is functionally usable and the v258/v259 visible regressions are fixed, but it still has launch-readiness UX/polish issues. No P0 blocker was found. The top issues are mostly end-user polish/trust/clarity rather than broken core functionality.

## P0 — Blockers

None found in this pass.

## P1 — Should fix before broad tester rollout

1. **Help & Support exposes internal QA/release diagnostics to end users.**  
   Evidence: `24-support-top.png` shows `INSTALLED CANDIDATE`, `mobile-v259`, package name, GitHub release URL, and real-device launch-smoke wording. This is useful for QA but feels internal/janky for a normal player.
   - Recommendation: hide diagnostics behind a small “Diagnostics” disclosure or long-press/debug toggle; keep Help user-facing by default.

2. **Floating scroll control overlaps content in several screens.**  
   Evidence: visible on long pages such as Help/Support and Create Multiplayer. It sits over text/cards/forms and can visually fight with tappable content.
   - Recommendation: either remove it for public builds, dock it into bottom safe-area chrome, or make it non-overlapping with larger bottom padding.

3. **Android bottom gesture bar overlaps low content on list/detail screens.**  
   Evidence: screenshots show the white gesture handle sitting over bottom content in long scroll states.
   - Recommendation: add stronger bottom safe-area padding to all ScrollViews/modal sheets, especially Trophy/Community/Create/Support.

4. **Community quest metadata has a trust-confusing mismatch.**  
   Evidence: Community list cards can show a `COMMUNITY` badge while metadata says `Official public`.
   - Recommendation: for user-created/community items, use `Community public`; reserve `Official` only for SQC official catalog items.

5. **Time defaults/statuses look inconsistent.**  
   Evidence: Create Multiplayer default start time appeared just behind the visible current time, and Account/Profile showed a last-login time a few minutes ahead of device time.
   - Recommendation: make default start clearly `Now` / `Starts when published` instead of a precise past-ish timestamp; normalize displayed server/client times or avoid minute-precise `Last login` when skew can look wrong.

6. **Trophy Cabinet modal/page semantics are still mixed.**  
   Evidence: Trophy Cabinet shows both global hamburger and a close `X`, so it feels half modal, half page.
   - Recommendation: choose one model. If it is a destination page, remove `X`; if it is a modal, hide hamburger or make hamburger clearly global and not competing with close.

## P2 — Polish / copy / clarity

1. **Copy still has a few awkward lines.**
   - `Community Solo Side Quests, ready in your hand.` → better: `Community Solo Side Quests, ready to play.` or `Ready at your fingertips.`
   - `How we can help` → `How can we help?`
   - `same Multiplayer product surface in a wider layout` is internal/product language; rewrite for players.
   - `Official and Custom Solo Side Quest Coat of Arms.` should likely be plural: `Official and Custom Solo Side Quest Coats of Arms`.
   - `1 / 13 official Side Quest Coat of Arms unlocked` → `1 of 13 official Side Quest coats unlocked`.

2. **Some labels are now technically correct but too heavy.**  
   The full `Solo Side Quest` terminology is correct per direction, but repeated dense headings can make screens feel wordy. Use full terminology in headings/buttons; shorter supporting copy can use `these quests` after context is established.

3. **Selected/unselected segmented states are fixed but inactive labels still look slightly disabled.**  
   The disappearance bug is fixed, but inactive labels could use a clearer selectable state.

4. **Community cards truncate too much before tap.**  
   Several rule/description cards are hard to understand from the list. Consider one more line or clearer rule summary chips.

5. **Duplicate-looking community entries can look like a bug.**  
   Example: similar/duplicate `Win The Mess` entries appear in Community. If intentional, show creator/date/difficulty more prominently.

6. **Some actions use unclear icons.**  
   The refresh/proof check icon near active Solo is not self-explanatory without tapping.

7. **Form language in Create Multiplayer can be clearer.**
   - `Games allowed → Both` should be `Lichess or Chess.com`.
   - `Hosted and joined by you` could be `Your Multiplayer Side Quests` or `Hosted or joined by you`.

## What looks good after v259

- The Discover/My Custom segmented labels no longer disappear in the smoke-tested selected states.
- Hamburger navigation is available and works for the main destinations tested.
- Signed-in state is coherent: usernames, active Solo, active Multiplayer, Trophy Cabinet, Account, and Support all load.
- v259 installed metadata is correctly shown in diagnostics.
- The app has a strong visual identity and feels much closer to a real mobile product than v251/v253.

## Recommended next implementation order

1. Hide Help diagnostics by default and clean Help copy.
2. Add global bottom safe-area padding / remove or dock floating scroll control.
3. Fix Community card metadata from `Official public` to `Community public` where appropriate.
4. Clean Create Multiplayer time defaults and account time wording.
5. Resolve Trophy Cabinet modal-vs-page semantics.
6. Sweep remaining P2 copy and density issues.
