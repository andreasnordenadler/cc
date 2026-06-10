# SQC Web product-language sweep — 2026-06-10

Sprint: `sqc-website-ux-parity-review-24h`

## User-facing slice

Continued Andreas's UX parity sprint by cleaning remaining visible web-vs-app/internal wording across high-traffic SQC website flows. The goal was not to add new capability; it was to make existing website parity work read like a finished SQC product surface.

## Changes

- Reworded Community Solo creator-context UI to player-facing language:
  - `Creator context` → `Player shelf`
  - `More by` → `More from`
  - creator filter empty states now describe public player shelves instead of internal creator links.
- Removed visible web-vs-mobile comparison copy from:
  - Custom Solo empty library state
  - Official Solo share card
  - Solo discovery quick-proof lane
  - Profile readiness
  - Account readiness
  - Multiplayer private invite and official-results lanes
  - Home Trophy Cabinet lane
  - Badges Trophy Cabinet status
  - Support contact copy and copied support packet heading
- Kept technical metadata/API enum values such as Open Graph `type: "website"` and support API `source: "website"` unchanged where they are not player-facing product copy.

## Verification

- `pnpm lint -- src/app/challenges/community/page.tsx 'src/app/challenges/community/[id]/page.tsx' 'src/app/challenges/[id]/page.tsx' src/app/challenges/page.tsx src/app/profile/page.tsx src/app/account/page.tsx src/app/groupquests/page.tsx src/app/page.tsx src/app/badges/page.tsx src/app/support/page.tsx src/components/support-contact-form.tsx`
- `pnpm build`

## Deployment / smoke

Pending production deploy and live smoke for this slice.
