# SQC My Quest Log locked coat artifact fix — 2026-05-06

## User-visible issue

Andreas reported a missile-like line in the blurred locked coat-of-arms previews on My Quest Log.

## Change

Adjusted the locked coat-of-arms shelf treatment in `src/app/globals.css`:

- removed the blur from locked badge art so small high-contrast crest details do not smear into diagonal streaks;
- hid the pseudo-element radial ring overlay that could read as a projectile/line when clipped inside the small coat slot;
- softened the locked-state shadow/opacity so the badges still feel locked without visual artifacts.

## Verification

- `pnpm lint` passed with existing warnings only:
  - `scripts/deploy-production-guard.mjs` unused `envOutput` warning
  - `src/components/site-nav.tsx` `<img>` optimization warning
- `pnpm build` passed.

## Deployment status

Pending production deploy at time of writing.
