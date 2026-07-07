# SQC Mobile-App Web Rebuild Sprint - 2026-07-07

## Goal

Rebuild the SQC website as the browser version of the current mobile app. Treat the original website as non-existent for visible UI decisions.

## Correction

The previous clean rebuild was paused because it still copied stale mobile-source and public-asset references too literally, including old-looking logo and bottom navigation behavior. The next sprint must start from verified current mobile-app truth, not from old web pages and not from unvalidated source references.

## Source Of Truth

The mobile app is the only product/UI template.

Before building each visible web slice:

- Capture or inspect the current mobile app screen/state being rebuilt.
- Confirm whether the mobile app currently has persistent bottom navigation, top identity, hamburger/menu behavior, labels, logo/brand treatment, and primary actions for that state.
- Treat old web assets, old public logos, old website navigation, and stale-looking source references as suspect until proven current.
- Preserve backend/auth/API/proof logic only as infrastructure.

## Non-Negotiable Gate

No web slice counts as progress unless it passes this question:

Does this look and behave like the current mobile app translated to browser constraints, rather than like the old website refitted with app-like parts?

If no, stop and document the mismatch before committing.

## Execution Order

1. Produce a mobile source-of-truth capture/checklist for the current app home/navigation model.
2. Remove or replace stale visible baseline elements in the clean preview, especially old-looking logo/nav treatments.
3. Rebuild the root signed-out/signed-in shell from the verified mobile model.
4. Replace route screens one at a time:
   - Solo Side Quests
   - Multiplayer Side Quests
   - Trophy Cabinet
   - Account/settings/support
   - Official Leaderboards and custom Side Quest helper routes
5. After each slice: run build, deploy preview only, smoke live URL, and capture screenshot/DOM proof.

## Report Format

Each visible report must include:

- The slice actually changed.
- The mobile source-of-truth used.
- The preview URL.
- Verification: build, live HTTP, screenshot or DOM proof.
- What still looks suspect.
- Next single slice.

## Hard Exclusions

- No production deploy unless Andreas explicitly asks.
- No old website chrome.
- No persistent bottom nav unless verified in the current mobile app.
- No old SQC logo/brand treatment unless verified current.
- No route-page refit that preserves old website composition.
