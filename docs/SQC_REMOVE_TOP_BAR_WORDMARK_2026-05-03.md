# SQC remove top-bar wordmark — 2026-05-03

## Request

Andreas asked to remove the “Side Quest Chess” text/image from the top bar and leave replacement branding for later.

## Change

- Removed the visible top-bar brand lockup from `src/components/site-nav.tsx`.
- Kept primary navigation and auth actions unchanged.

## Verification

- `pnpm lint` passed.
- `pnpm build` passed.
- Production deployed from the rebased latest `main` state to `https://cc-isxhx0rp4-andreas-nordenadlers-projects.vercel.app` and aliased to `https://sidequestchess.com`.
- Live smoke:
  - `https://cc-isxhx0rp4-andreas-nordenadlers-projects.vercel.app/` returned HTTP 200.
  - `https://sidequestchess.com/` returned HTTP 200.
  - Rendered top-nav HTML no longer contains `brand-text`, `wordmark-brand`, `nav-wordmark`, or `<strong>Side Quest Chess</strong>`.
  - Primary nav remains present.
  - Existing `Support` nav link remains present, confirming the deploy did not roll back the newer nav simplification state.

## Note

A bounded Vercel runtime-log scan was attempted, but the installed Vercel CLI rejected the attempted filtered log invocation and the unfiltered log stream produced no bounded output before timeout. HTTP/live markup smoke was clean.
