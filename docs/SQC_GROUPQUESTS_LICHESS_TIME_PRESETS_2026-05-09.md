# SQC Group Quests Lichess Time Presets — 2026-05-09

## Source

Andreas sent a Lichess create-game screenshot and asked that group owners be able to make settings like those mandatory.

## Visible settings mapped

The screenshot showed `Tidskontroll` / time control presets:

- Bullet: `0+1`, `1+0`, `1+1`, `2+1`
- Blitz: `3+0`, `3+2`, `5+0`, `5+3`
- Rapid: `10+0`, `10+5`, `15+0`, `15+10`
- Classical: `25+0`, `30+0`, `30+20`, `60+0`
- Custom collapsed option

## Change

The Group Quest draft builder now has a `Time control` mandatory-rule selector with these exact visible presets and defaults to `Blitz 5+3`, matching the selected preset in the screenshot.

## Verification

- `pnpm lint` passed with 3 known warnings.
- `pnpm build` passed and listed `/groupquests` as a built route.
