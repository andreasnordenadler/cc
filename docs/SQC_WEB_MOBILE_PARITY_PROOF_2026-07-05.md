# SQC Website/Mobile Parity Proof - 2026-07-05

## Source of truth inspected

- Mobile app: `apps/mobile/App.tsx`
- Website nav: `src/components/site-nav.tsx`
- Website entry routes: `src/app/page.tsx`, `src/app/challenges/page.tsx`, `src/app/solo/page.tsx`, `src/app/community/page.tsx`, `src/app/custom/page.tsx`, `src/app/multiplayer/page.tsx`, `src/app/groupquests/page.tsx`, `src/app/account/page.tsx`, `src/app/settings/page.tsx`, `src/app/support/page.tsx`

## Mobile app top-level map

| Mobile surface | Mobile label | Web parity route | Status |
| --- | --- | --- | --- |
| Bottom tab | Home | `/` | Present |
| Bottom tab | Side Quests | `/solo` | Present, aliases `/challenges` |
| Hamburger item | Solo Side Quests | `/solo` | Present |
| Hamburger item | My Custom Side Quests | `/custom` | Present |
| Hamburger item | Create Custom Side Quest | `/custom#custom-side-quest-builder` | Present |
| Bottom tab | Multiplayer Side Quests | `/multiplayer` | Present, aliases `/groupquests` |
| Hamburger item | Create Multiplayer Side Quest | `/groupquests/create` | Present |
| Bottom tab | Trophy Cabinet | `/trophy-cabinet` | Present |
| Bottom tab | Account | `/account` or `/sign-in` | Present |
| Hamburger item | Help & Support | `/support` | Present |
| Account-adjacent web route | Settings | `/settings` | Present |
| Web-only catalog split | Community Side Quests | `/community` | Present, mirrors mobile Side Quest catalog intent |
| Web-only multiplayer split | Official Leaderboards | `/leaderboards` | Present, mirrors mobile multiplayer official catalog tab |

## Slice completed

- Updated home primary CTAs and fallback links from older top-level aliases (`/challenges`, `/groupquests`) to canonical mobile-parity routes (`/solo`, `/multiplayer`).
- Updated Solo hub cross-links to `Community` and `Multiplayer` from older aliases.
- Updated remaining visible browse/back/account links to prefer the canonical mobile-parity entry routes: `/solo`, `/community`, `/custom`, and `/multiplayer`.
- Updated the Community Solo discovery form to submit to `/community`, keeping filter/search URLs on the parity route.
- Left deep route URLs intact where they identify concrete records, public community detail pages, or existing API revalidation paths.

## Remaining high-impact parity item

Bring the signed-in website Account home closer to the mobile Account tab by grouping chess username readiness, active Solo proof, Custom Side Quest management, Multiplayer participation, Settings, and Help & Support in the same order as the mobile account/support flow.
