# SQC Web Multiplayer quick duration chips — 2026-06-10

Closed a small Multiplayer create/manage parity gap versus mobile-v251: the mobile Multiplayer creator has quick duration chips for common proof windows, while website hosts still had to type the closing date manually.

## Shipped

- Added `Quick duration` chips to `/groupquests/create` schedule controls: 24h, 3 days, 7 days, and 14 days.
- Added the same chips to host `/groupquests/[id]/edit` so existing table windows can be adjusted without switching to mobile.
- Kept exact `datetime-local` open/close editing, current website cards/forms, invite/privacy behavior, and verifier semantics unchanged.
- The chips only set the close time relative to the current open time; they do not alter quest stack, provider, access mode, participants, proof, or production data.

## Verification

- `pnpm lint -- src/components/group-quest-draft-builder.tsx src/components/group-quest-edit-form.tsx src/app/globals.css` — passed (CSS file emitted the existing ESLint ignored-file warning only).
- `pnpm build` — passed.
- Production deploy `https://cc-2scuif1uc-andreas-nordenadlers-projects.vercel.app` aliased to `https://sidequestchess.com`.
- Live smoke: signed-out production and deploy `/groupquests/create?quickDurationSmoke=20260610` returned `307` sign-in protection; production `/groupquests/public?quickDurationSmoke=20260610` returned 200 with Multiplayer content; production seeded detail `/groupquests/seed-public-sqcseed11-11?quickDurationSmoke=20260610` returned 200 with Side Quest content.
