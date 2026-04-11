# Chess.com Post-Parity Canonical-Host Detail Parity Smoke

Date: 2026-04-11
Proof window: 2026-04-11 18:01:41 UTC (same-run dual-host fetch)
Representative route: `/challenges/win-as-white`
Canonical host URL: `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/win-as-white`
Active deployment host URL: `https://cc-taupe-kappa.vercel.app/challenges/win-as-white`

## Result

Dual-host representative-detail parity passed.

Both hosts returned success during the same proof window and both exposed the shipped Chess.com-supported submission wording on the representative detail route.

## Live response evidence

### Canonical host
- Status: `200`
- `date`: `Sat, 11 Apr 2026 18:01:41 GMT`
- `x-matched-path`: `/challenges/[id]`
- `x-vercel-id`: `arn1::iad1::zzlgd-1775930499413-2c4d2a381797`
- Extracted visible text snippet:

```text
Challenge detail Win as White Win one complete game as White. Start a real game and play as White. Return with a finished game ID or Chess.com game URL. Lichess and Chess.com are supported here today.
```

### Active deployment host
- Status: `200`
- `date`: `Sat, 11 Apr 2026 18:01:41 GMT`
- `x-matched-path`: `/challenges/[id]`
- `x-vercel-id`: `arn1::iad1::vw82n-1775930501472-f74b2d6598d8`
- Extracted visible text snippet:

```text
Challenge detail Win as White Win one complete game as White. Start a real game and play as White. Return with a finished game ID or Chess.com game URL. Lichess and Chess.com are supported here today.
```

## Parity verdict

The canonical host and active deployment host both served the same representative Chess.com-supported `/challenges/win-as-white` detail surface in the same proof window, with matching success status and matching submission wording that explicitly keeps Chess.com game URL support visible.
