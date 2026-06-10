# SQC Web Multiplayer joined/hosted filters — 2026-06-10

Closed a small website discovery parity gap versus mobile-v251: mobile Public Multiplayer browse has `joined` and `hosted` filters alongside open/all/finished, while website `/groupquests/public` only exposed open/all/finished plus host shelves.

## Shipped

- Added signed-in `Joined by me` and `Hosted by me` status filters to `/groupquests/public`.
- Kept signed-out users on the existing public-safe open/all/finished filters.
- Added safe `Joined by you` / `Hosted by you` labels to public listing rows.
- Preserved privacy boundaries: no participant emails, private invite-only tables, private account metadata, or invite codes are exposed.

## Verification

- `pnpm lint -- src/app/groupquests/public/page.tsx`
- `pnpm build`
