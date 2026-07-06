# SQC website/mobile Solo community mode parity - 2026-07-06

Source of truth: `apps/mobile/App.tsx`.

This slice preserves existing user changes and focuses on the top-level Solo Side Quests surface. The mobile app's `Side Quests` tab uses a first-class Official/Community catalog split, then keeps My Custom Side Quests and Create Custom Side Quest as related actions inside the same Solo area. The website already had matching routes; this pass tightens the hierarchy so `/solo` and `/community` present that relationship more like the app.

## Parity matrix

| Mobile app surface | Native label/source | Website route/control | Status |
| --- | --- | --- | --- |
| Bottom tab | `Side Quests` | `/solo` / `/challenges` | Preserved |
| Solo catalog tab | `Official` | Primary switcher item to `/solo` | Improved hierarchy |
| Solo catalog tab | `Community` | Primary switcher item to `/community` | Improved hierarchy |
| Hamburger action | `My Custom Side Quests` | Secondary switcher action to `/custom` | Preserved |
| Hamburger action | `Create Custom Side Quest` | Secondary switcher action to `/custom#custom-side-quest-builder` | Preserved |

## Slice changes

- Updated `src/components/side-quest-mode-switcher.tsx` so Official and Community are grouped as the primary Solo catalog choice.
- Kept My Custom Side Quests and Create Custom Side Quest available as secondary Solo actions.
- Updated `src/app/globals.css` to render the primary two-choice catalog control and stack it cleanly on mobile web.
- Left mobile app code, APIs, account flows, proof flows, and route aliases untouched.

## Proof

- Desktop Solo screenshot: `artifacts/sqc-solo-community-mode-parity-2026-07-06/solo-desktop.png`
- Mobile-web Solo screenshot: `artifacts/sqc-solo-community-mode-parity-2026-07-06/solo-mobile.png`
- Desktop Community screenshot: `artifacts/sqc-solo-community-mode-parity-2026-07-06/community-desktop.png`
- Mobile-web Community screenshot: `artifacts/sqc-solo-community-mode-parity-2026-07-06/community-mobile.png`
- Screenshot server: `pnpm exec next start -p 3071` after `pnpm build`.

## Verification

- `pnpm lint -- src/components/side-quest-mode-switcher.tsx src/app/globals.css` passed with the existing CSS ignore warning.
- `pnpm exec tsc --noEmit --pretty false` passed.
- `pnpm --dir apps/mobile exec tsc --noEmit --pretty false` passed.
- `pnpm build` passed with the existing Next workspace-root warning.
