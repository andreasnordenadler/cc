# SQC Mobile Source Of Truth - Home / Navigation - 2026-07-07

Sprint source: `docs/SQC_MOBILE_APP_WEB_REBUILD_SPRINT_2026-07-07.md`

Verified source file: `apps/mobile/App.tsx`

## Current App Shell

- The app root renders `SafeAreaView`, `StatusBar`, `GradientBackdrop`, a very faint app watermark, and a scroll view with top padding. Source: `apps/mobile/App.tsx` around `ActiveScreen` render.
- The active app shell renders `GlobalHamburgerMenu` only when the account is authenticated.
- Non-home screens get a fixed close button that returns to home.
- `BottomNav` exists in source, but there is no current render call for it. It is not current visible product truth for this rebuild.

## Signed-Out Home

- Header is centered text: `Side Quest Chess`.
- No hamburger menu appears while signed out.
- Brand art is the current coat of arms with `SQC_GENERIC_COAT_GLOW_ASSET` behind `SQC_COAT_OF_ARMS_ASSET`, not the old public website logo treatment.
- Primary content is centered:
  - `Sign in to continue.`
  - Browse Solo Side Quests.
  - Browse Multiplayer Side Quests.
  - `Choose sign-in method`.
- The signed-out copy says: `Chess, but with stupidly hard side quests — solo or multiplayer. Browse the live boards first; sign in when you want SQC to save progress, verify proof, or join a table.`

## Signed-In Home Header

- Header height is 40px and is visually aligned with the hamburger and account avatar/dot.
- Hamburger is a 40px circular control on the left.
- Identity is centered between controls.
- Account avatar/dot is a 40px circular control on the right.
- Identity shows display name and connected chess accounts; missing chess accounts should prompt account connection.

## Signed-In Menu

Current menu item order:

1. Home
2. Solo Side Quests
3. Multiplayer Side Quests
4. Trophy Cabinet
5. My Custom Side Quests
6. Create Custom Side Quest
7. Create Multiplayer Side Quest
8. My Account / Sign in / Account
9. Help & Support

Menu styling:

- Panel width is 232px in native source, brown translucent background, 13px radius, tight 2px row gap.
- Rows are compact, icon plus label, active row highlighted with translucent gold.

## Web Rebuild Decisions

- Do not preserve the old website topbar, public logo lockup, or persistent bottom dock as visible UI.
- Use old web routes only as compatibility targets for auth, account, proof, and route compatibility.
- Browser translation may use real links instead of native callbacks, but the visible navigation model should be the hamburger/menu model above.
- Root signed-out shell should remain centered and coat-led; root signed-in shell should use centered identity, hamburger, account dot, and home content sections.

## Checklist For Future Slices

- Confirm screen-specific header and menu behavior in `apps/mobile/App.tsx` before editing web UI.
- Confirm whether the native screen is signed-out browse, signed-in home, modal/detail, or non-home full screen.
- Do not add persistent bottom navigation unless a current rendered mobile app path proves it.
- Do not use `/sqc-logo-v11.png` or old `/brand/*` logo lockups for visible chrome unless the current mobile app surface proves it.
