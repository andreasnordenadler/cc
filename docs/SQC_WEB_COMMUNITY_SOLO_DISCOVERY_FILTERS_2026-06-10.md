# SQC web Community Solo discovery filters — 2026-06-10

Closed a small website discovery parity gap versus mobile-v251: mobile Community Solo browse exposed search plus All/Popular/New/Completed filters and Top/New/A–Z sorting, while website `/challenges/community` only had creator-context filtering.

## Shipped

- Added website Community Solo search by title, creator, rule, and goal.
- Added All, Popular, New, and Completed-by-me discovery filters.
- Added Top, Newest, and A–Z sorting controls.
- Preserved creator-context URLs and safe empty states without exposing private drafts or account metadata.
- Added safe community stats labels for completions, active runners, and Multiplayer lineup usage.

## Verification

- `pnpm lint -- src/lib/community-side-quests.ts src/app/challenges/community/page.tsx`
- `pnpm build`
