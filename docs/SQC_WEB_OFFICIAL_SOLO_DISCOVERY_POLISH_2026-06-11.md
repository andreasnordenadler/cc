# SQC web official Solo discovery polish — 2026-06-11

## Sprint slice

Continued the SQC website UX parity sprint by polishing the official Solo discovery deck on `/challenges`. The official finder now feels more deliberate and app-quality without changing verifier behavior:

- Reframed the filter area as an SQC-styled `Official Solo finder` with short player-facing guidance.
- Added quick filter chips for `Good first runs`, `My active run`, and `Big point targets` so runners can choose an intent before tuning dropdowns.
- Added a live visible result count including scheduled quest context.
- Upgraded official quest cards with a compact `Run preview` receipt/rule hint and a clear card-level next-step line (`Inspect quest`, `Continue run`, or `View receipt`).

## Files changed

- `src/components/challenge-deck-browser.tsx`
- `src/app/globals.css`

## Verification

- `pnpm lint -- src/components/challenge-deck-browser.tsx src/app/globals.css` *(CSS ignored-file warning only)*
- `pnpm build`
- `pnpm deploy:prod` including `pnpm quest:release-gate`
- Production deploy: `https://cc-at2ng1fsv-andreas-nordenadlers-projects.vercel.app`
- Aliased production: `https://sidequestchess.com`

## Live smoke

- `https://sidequestchess.com/challenges?officialDiscoverySmoke=20260611c` → 200 with `Official Solo finder`, `Run preview`, and `Inspect quest`
- `https://cc-at2ng1fsv-andreas-nordenadlers-projects.vercel.app/challenges?officialDiscoverySmoke=20260611c` → 200 with `Official Solo finder`, `Run preview`, and `Inspect quest`
- `https://sidequestchess.com/challenges/finish-any-game?officialDiscoverySmoke=20260611c` → 200 with `Any Game Counts` and `Next step`
- `https://sidequestchess.com/groupquests/public?officialDiscoverySmoke=20260611c` → 200 with `Find a table`, `Rule preview`, and `Next step`

## Commit

- `2c8200e` — `Polish official solo discovery cards`
