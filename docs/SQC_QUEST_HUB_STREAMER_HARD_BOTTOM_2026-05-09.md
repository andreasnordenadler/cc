# SQC Quest Hub Streamer-hard Bottom Move — 2026-05-09

## Source

Andreas sent a screenshot of the Quest Hub “Streamer-hard lane” section and asked to move this section to the bottom.

## Change

Reordered `src/app/challenges/page.tsx` so the Streamer-hard lane now appears after the recommended starting quests section, keeping the section content unchanged.

## Verification

- `pnpm lint` passed with 3 known warnings.
- `pnpm build` passed.
