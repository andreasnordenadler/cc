# SQC website/mobile Solo entry parity - 2026-07-06

Source of truth: `apps/mobile/App.tsx`.

This slice preserves existing user changes and focuses on the website Solo Side Quests entry route. The native Solo screen leads with the label `Solo Side Quests`, the headline `Choose your next Side Quest`, and first actions for building a custom quest or browsing Community Side Quests.

## Parity matrix

| Mobile app surface | Native label/source | Website route | Status |
| --- | --- | --- | --- |
| Bottom tab | `Side Quests` | `/solo` -> `/challenges` | Matched |
| Hamburger item | `Solo Side Quests` | `/solo`, `/challenges` hero eyebrow | Improved |
| Solo browse hero | `Choose your next Side Quest` | `/solo` hero headline | Matched |
| Solo browse explainer | Pick one, play on Lichess or Chess.com, return for proof | `/solo` hero body | Matched |
| Hero primary action | `Build a Side Quest` | `/custom#custom-side-quest-builder` | Improved |
| Hero secondary action | `Browse Community Side Quests` | `/community` | Matched |
| Cross-mode escape | Multiplayer Side Quests | `/multiplayer` hero action | Matched |

## Slice changes

- Updated `src/app/challenges/page.tsx` hero copy to match the native Solo Side Quests screen structure and labels.
- Added a first-class `Build a Side Quest` action to the Solo web entry, pointing to the existing Custom Side Quest builder.
- Kept route aliases, data loading, ChallengeDeckBrowser behavior, and mobile app files untouched.

## Proof

- Desktop screenshot: `artifacts/sqc-solo-entry-parity-2026-07-06/solo-desktop.png`
- Mobile-web screenshot: `artifacts/sqc-solo-entry-parity-2026-07-06/solo-mobile-web.png`
- Screenshot assertion: `/solo` rendered `Choose your next Side Quest.`, all three hero action links, and `#solo-side-quest-deck`.

## Verification

- `pnpm lint -- src/app/challenges/page.tsx` passed.
- `pnpm exec tsc --noEmit --pretty false` passed.
- `pnpm --dir apps/mobile exec tsc --noEmit --pretty false` passed.
- `pnpm build` passed with the existing Next workspace-root warning.
- Screenshot server: `pnpm exec next start -p 3061`.
