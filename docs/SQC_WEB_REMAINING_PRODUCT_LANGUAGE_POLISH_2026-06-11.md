# SQC Web remaining product-language polish — 2026-06-11

## Sprint slice

Continued the SQC website UX parity review after the Multiplayer create-flow polish. This slice focused on newly reintroduced player-visible internal wording in Custom Solo, Community Solo detail, and Multiplayer create copy.

## UX changes

- Replaced remaining visible “recipe” wording in the Custom Solo shelf, library heading, builder guide, quality checklist, starter panel, lifecycle helper copy, and manage/edit actions with player-facing Custom Solo Side Quest / quest / rule language.
- Renamed the starter panel from `Recipe starters` to `Quest starters` while preserving the existing SQC tavern-card styling and layout.
- Cleaned Community Solo detail checklist copy from “account handoff” / “recipe looks wrong” to normal SQC account start and quest-report language.
- Cleaned Multiplayer create helper copy from “Custom Solo recipes” to “Custom Solo Side Quests.”

## Verification

- `grep -RInE "website creator|website-first|Website-first|web-first|website or app|mobile app|mobile-style|mobile shortcut|mobile flow|web view|switch to mobile|recipe|Recipe|Account handoff|account handoff|Start/check|Report weird|raw config|Safe rule summary|player shelf" src/app src/components src/lib` now only finds the admin-only support reply label `Reply visible in this user’s mobile app thread`.
- `pnpm lint -- src/app/account/custom-side-quests/page.tsx 'src/app/challenges/community/[id]/page.tsx' src/components/group-quest-draft-builder.tsx src/app/globals.css` passed with the known CSS ignored-file warning only.
- `pnpm build` passed.

## Production

Pending deploy/smoke for this focused language-cleanup commit.
