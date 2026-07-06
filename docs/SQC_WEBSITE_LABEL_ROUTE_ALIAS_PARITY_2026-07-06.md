# SQC website label route alias parity - 2026-07-06

Source of truth: `apps/mobile/App.tsx`.

This cron slice preserves existing user changes and adds thin website route aliases for native app labels that players may reasonably type, share, or expect from the mobile navigation. Canonical routes and page implementations stay unchanged.

## Parity matrix

| Mobile app surface | Native label/source | Website alias added | Canonical web surface | Status |
| --- | --- | --- | --- | --- |
| Solo catalog | `Solo Side Quests` hamburger item | `/solo-side-quests` | `/solo` | Added |
| Community catalog | community discover mode under Side Quests | `/community-side-quests` | `/community` | Added |
| Custom catalog | `My Custom Side Quests` hamburger item | `/custom-side-quests` | `/custom` | Added |
| Multiplayer catalog | `Multiplayer Side Quests` tab and hamburger item | `/multiplayer-side-quests` | `/multiplayer` | Added |
| Official results | `officialLeaderboards` shell screen | `/official-leaderboards` | `/leaderboards` | Added |
| Account shell | `My Account` / `Sign in / Account` | `/my-account` | `/account` | Added |
| Support flow | `Help & Support` hamburger item | `/help-support` | `/support` | Added |
| Custom creation | `Create Custom Side Quest` hamburger action | `/create-custom-side-quest` | `/custom#custom-side-quest-builder` | Added |
| Multiplayer creation | `Create Multiplayer Side Quest` hamburger action | `/create-multiplayer-side-quest` | `/groupquests/create` | Added |

## Slice changes

- Added App Router alias pages that re-export existing canonical website pages for the app's user-facing labels.
- Added redirect-only creation aliases for the two mobile hamburger creation actions.
- Left mobile app code, website canonical routes, data flows, auth behavior, and navigation labels untouched.

## Proof

- Desktop screenshot: `artifacts/sqc-label-route-alias-parity-2026-07-06/solo-side-quests-desktop.png`
- Mobile-web screenshot: `artifacts/sqc-label-route-alias-parity-2026-07-06/multiplayer-side-quests-mobile.png`
- Mobile-web support screenshot: `artifacts/sqc-label-route-alias-parity-2026-07-06/help-support-mobile.png`
- Route smoke:
  - `/solo-side-quests` -> 200
  - `/community-side-quests` -> 200
  - `/custom-side-quests` -> 200, then existing signed-out custom auth handoff
  - `/multiplayer-side-quests` -> 200
  - `/official-leaderboards` -> 200
  - `/my-account` -> 200
  - `/help-support` -> 200
  - `/create-custom-side-quest` -> existing signed-out custom builder auth handoff
  - `/create-multiplayer-side-quest` -> existing signed-out multiplayer create auth handoff

## Verification

- `pnpm lint -- src/app/solo-side-quests/page.tsx src/app/community-side-quests/page.tsx src/app/custom-side-quests/page.tsx src/app/multiplayer-side-quests/page.tsx src/app/official-leaderboards/page.tsx src/app/my-account/page.tsx src/app/help-support/page.tsx src/app/create-custom-side-quest/page.tsx src/app/create-multiplayer-side-quest/page.tsx` passed.
- `pnpm exec tsc --noEmit --pretty false` passed.
- `pnpm --dir apps/mobile exec tsc --noEmit --pretty false` passed.
- `pnpm build` passed with the existing Next workspace-root warning.
