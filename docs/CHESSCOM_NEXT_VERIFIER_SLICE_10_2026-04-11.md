# Chess.com next verifier-backed slice 10

Date: 2026-04-11

## Current shipped state

CC already supports Chess.com verifier-backed automation for these challenge IDs using the existing single-game public archive loop:

- `finish-any-game`
- `finish-as-white`
- `finish-as-black`
- `win-as-white`
- `win-as-black`
- `draw-any-game`
- `draw-as-white`
- `draw-as-black`
- `lose-any-game`
- `lose-as-white`

The only remaining shipped loss challenge without Chess.com verifier-backed automation is `lose-as-black`.

## Smallest next slice

Implement Chess.com verifier-backed automation for `lose-as-black` only.

## Why this is the smallest reviewable step

- It closes the final Chess.com gap in the already-shipped challenge catalog.
- It reuses the exact same narrow public-archive lookup loop already live for the other Chess.com challenge verdicts.
- It needs no new product surface, no new identity fields, and no broader verifier architecture changes.
- It is smaller and safer than inventing new challenge types or broadening into multi-game or background verification.

## Existing evidence it reuses

This slice can reuse the already-shipped Chess.com evidence path:

- saved Chess.com username from account settings
- recent public archive month lookup
- public game URL matching inside fetched archive games
- username-to-side detection (`white` or `black`)
- finished-game detection
- decisive-result loss detection already used by `lose-any-game` and `lose-as-white`

## Explicit deferrals

This slice does not include:

- any new challenge definitions beyond `lose-as-black`
- multi-game history checks
- background retries or cron-based verifier sweeps
- UI redesigns or submission-flow changes
- any broader Chess.com progression work after the current shipped catalog is fully covered
