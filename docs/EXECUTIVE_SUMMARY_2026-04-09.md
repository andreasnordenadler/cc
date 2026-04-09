# CC Executive Summary

Date: 2026-04-09
Scope: current app surface and routing baseline only

## Current routes and routing state

- `/`
  - Implemented by `src/app/page.tsx`
  - Acts as the only concrete App Router page in the repo today
  - Includes signed-out marketing copy plus signed-in challenge/progress UI driven from Clerk metadata
- `/account`
  - Linked from the home page
  - Protected by `src/middleware.ts`
  - No matching `src/app/account/*` route exists in the repo yet, so the route is assumed but not implemented
- `/challenges`
  - Linked from the home page
  - No matching `src/app/challenges/*` route exists in the repo yet
- `/challenges/[id]`
  - Linked from the home page for active and suggested challenges
  - No matching dynamic route exists in the repo yet

## Current components and modules shaping the surface

- `src/app/layout.tsx`
  - Global shell, fonts, and `ClerkProvider`
- `src/app/page.tsx`
  - Monolithic landing + signed-in dashboard page
  - Handles auth-aware rendering, challenge summary cards, progress summary, CTA buttons, and local metadata parsing helpers in one file
- `src/lib/challenges.ts`
  - Static challenge catalog with three starter challenges and a lookup helper
- `src/middleware.ts`
  - Clerk middleware protecting `/account(.*)` only

## Product baseline

- The visible product promise is a Lichess-linked chess challenge flow: sign in, save a Lichess username, choose a challenge, play a game, then return for verification.
- The current implementation mostly presents that promise on the homepage but does not yet provide the linked route structure needed to complete the flow.
- Signed-in state depends on Clerk user public metadata for challenge state, progress, and latest attempt summaries.

## Most important product gap

The most important visible gap is that the homepage sells a multi-step product loop, but the core destination routes it points to (`/account`, `/challenges`, `/challenges/[id]`) are not implemented in the current app surface. That means the app has a promising front door but no reviewable in-product path to actually configure identity or start/inspect a challenge.

## Verification note

Artifact created at `cc/docs/EXECUTIVE_SUMMARY_2026-04-09.md` for the roadmap audit item.
