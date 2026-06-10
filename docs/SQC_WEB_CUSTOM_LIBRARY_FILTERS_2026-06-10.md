# SQC Web Custom Library Filters — 2026-06-10

## Sprint slice

Closed a small Custom Solo management parity gap versus mobile-v251: the website `/account/custom-side-quests` library now has the same saved-shelf filter model as the mobile Custom Solo library.

## What changed

- Added account-local Custom Solo shelf filters: All, Published, Drafts, Public, and Archived.
- Added safe shelf search across title, summary, public rule label, and safe rule detail summaries.
- Kept raw custom rule config, private metadata, invite codes, and account details hidden.
- Updated empty-state copy so website-first users can create/manage on the website without being told to switch to the app.
- Preserved existing website card layout, buttons, and visual language.

## Verification

- `pnpm lint -- src/app/account/custom-side-quests/page.tsx`
- `pnpm build`

## Deployment

Pending production deploy/smoke after the focused code/doc commit.
