# SQC web Community Solo coat reassignment deploy — 2026-06-11

Sprint: `sqc-website-ux-parity-review-24h`

## What changed

- Finished the Community Solo coat reassignment slice after Andreas requested replacing the old repeated community-created Side Quest coat.
- Kept the approved random pool to 12 no-text/generated coats and excluded the weak checker-background `custom-coat-11.png` plus old generic/custom crest variants.
- Hardened display sanitization so legacy/stale custom badge metadata and saved Multiplayer snapshots render deterministic approved random-pool coats instead of old generic crest paths.
- Public custom proof links now also use sanitized approved Custom Solo coat art.

## Checks

- `pnpm lint` — passes with existing warnings only.
- `pnpm build` — passes.
- `pnpm lint -- src/lib/custom-side-quests.ts 'src/app/groupquests/[id]/page.tsx' src/lib/proof-share.ts` — passes.
- `pnpm build` — passes after the display sanitization fix.
- `pnpm deploy:prod` — includes `pnpm quest:release-gate`; passes.

## Production

- Metadata/reassignment commits already on main: `f1f7154`, `31dfea4`.
- Display hardening commits: `bbef11b` (`Normalize community coat rendering`), `d61d162` (`Harden custom coat display sanitization`).
- Proof-note commit: `cec651e` (`Record community coat proof`).
- Production deploy: `https://cc-ama3kx0ad-andreas-nordenadlers-projects.vercel.app`
- Alias: `https://sidequestchess.com`

## Smoke

Initial live smoke caught stale rendered `/badges/custom/custom-side-quest-crest.png` references on Community Solo; fixed before final deploy.

Final smoke:

- `https://sidequestchess.com/challenges/community?coatSmoke=20260611final` → 200, shows only approved random-pool custom coats (`02`, `05`, `06`, `07`, `08`, `09`, `10`, `12`, `13`, `15`, `16`, `17`).
- `https://cc-ama3kx0ad-andreas-nordenadlers-projects.vercel.app/challenges/community?coatSmoke=20260611final` → 200, same approved-pool refs.
- `https://sidequestchess.com/challenges/community/seed-opening-hipster-24-1?coatSmoke=detail` → 200, approved random-pool coat.
- `https://sidequestchess.com/challenges/community/seed-opening-hipster-32-1?coatSmoke=detail` → 200, approved random-pool coat.
- No final smoke body contains `/badges/custom/custom-side-quest-crest.png`, old `/badges/custom/custom-coat-*.png`, or excluded `/badges/custom/random/custom-coat-11.png`.
