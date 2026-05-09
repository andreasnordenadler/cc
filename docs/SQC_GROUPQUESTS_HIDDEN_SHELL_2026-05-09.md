# SQC Group Quests Hidden Shell — 2026-05-09

## Scope

Andreas approved starting live implementation of SQC multiplayer/group quests as a hidden website route at `/groupquests`, with no public/user-facing links for now.

This is an explicit, narrow exception to the SQC website feature freeze.

## Shipped in this slice

- Added hidden App Router page: `src/app/groupquests/page.tsx`.
- Did **not** add any links from nav, homepage, quest hub, or public CTAs.
- Added first live workbench surface with:
  - hidden multiplayer framing;
  - single quest race prototype;
  - group settings cards;
  - quest set preview;
  - proof-backed leaderboard mock;
  - system event feed;
  - explicit personal-proof vs group-proof separation rule.
- Added route-specific CSS in `src/app/globals.css`.

## Product rule confirmed in UI

Personal quest completion and group quest completion are separate ledgers.

A player can already own a Coat of Arms personally, but still be incomplete inside a group quest until they produce competition-valid proof after joining and after the group window starts.

## Verification

- `pnpm lint` passed with 3 known warnings.
- `pnpm build` passed and listed `/groupquests` as a built route.

## Deployment

Pending production deploy/smoke at time of writing.
