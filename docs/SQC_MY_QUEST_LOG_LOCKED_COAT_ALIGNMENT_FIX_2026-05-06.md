# SQC My Quest Log locked coat alignment fix — 2026-05-06

## User-visible issue

Andreas sent a My Quest Log screenshot showing the locked coat-of-arms previews misaligned inside the coat shelf slots.

## Change

Tightened the `hero-coat-slot` layout in `src/app/globals.css`:

- moved overflow clipping to all shelf slots consistently;
- removed the inherited 104px `min-width` from shelf badge art;
- made shelf badge art an explicit centered grid item;
- forced badge images to fill the shelf art box with `object-fit: contain` and centered object position;
- kept the earlier missile-line artifact fix by leaving the locked blur/ring overlay removed.

## Verification

- `pnpm lint` passed with existing warnings only.
- `pnpm build` passed.

## Deployment status

Pending production deploy at time of writing.
