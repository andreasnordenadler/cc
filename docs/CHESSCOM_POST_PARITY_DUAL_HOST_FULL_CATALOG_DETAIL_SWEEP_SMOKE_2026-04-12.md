# Chess.com Post-Parity Dual-Host Full Catalog Detail Sweep Smoke

Date: 2026-04-12
Proof window: 2026-04-11 23:02:10 UTC to 2026-04-11 23:02:17 UTC (same-run dual-host fetch)

## Exact live URLs checked

### Canonical host
- `https://cc-andreas-nordenadlers-projects.vercel.app/challenges`
- `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/draw-any-game`
- `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/draw-as-black`
- `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/draw-as-white`
- `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/finish-any-game`
- `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/finish-as-black`
- `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/finish-as-white`
- `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/lose-any-game`
- `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/lose-as-black`
- `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/lose-as-white`
- `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/win-as-black`
- `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/win-as-white`
- `https://cc-andreas-nordenadlers-projects.vercel.app/account`

### Active deployment host
- `https://cc-taupe-kappa.vercel.app/challenges`
- `https://cc-taupe-kappa.vercel.app/challenges/draw-any-game`
- `https://cc-taupe-kappa.vercel.app/challenges/draw-as-black`
- `https://cc-taupe-kappa.vercel.app/challenges/draw-as-white`
- `https://cc-taupe-kappa.vercel.app/challenges/finish-any-game`
- `https://cc-taupe-kappa.vercel.app/challenges/finish-as-black`
- `https://cc-taupe-kappa.vercel.app/challenges/finish-as-white`
- `https://cc-taupe-kappa.vercel.app/challenges/lose-any-game`
- `https://cc-taupe-kappa.vercel.app/challenges/lose-as-black`
- `https://cc-taupe-kappa.vercel.app/challenges/lose-as-white`
- `https://cc-taupe-kappa.vercel.app/challenges/win-as-black`
- `https://cc-taupe-kappa.vercel.app/challenges/win-as-white`
- `https://cc-taupe-kappa.vercel.app/account`

## Result

Dual-host full-catalog detail-sweep parity passed.

All twenty-six checks completed during the same proof window. Both `/challenges` responses returned `200` and exposed the same full eleven shipped challenge routes during that run, all twenty-two detail-route checks returned `200`, and both signed-out `/account` checks returned the same visible protected `404` shape.

## Catalog integrity evidence

### Canonical host `/challenges`
- Status: `200`
- Catalog route count: `11`
- Routes observed:
  - `/challenges/draw-any-game`
  - `/challenges/draw-as-black`
  - `/challenges/draw-as-white`
  - `/challenges/finish-any-game`
  - `/challenges/finish-as-black`
  - `/challenges/finish-as-white`
  - `/challenges/lose-any-game`
  - `/challenges/lose-as-black`
  - `/challenges/lose-as-white`
  - `/challenges/win-as-black`
  - `/challenges/win-as-white`
- Visible text snippet:

```text
Chess Home Challenges Account Sign in Create account Challenges Pick a real game challenge Start with one simple run, then come back with a Lichess game ID or Chess.com game URL.
```

### Active deployment host `/challenges`
- Status: `200`
- Catalog route count: `11`
- Routes observed:
  - `/challenges/draw-any-game`
  - `/challenges/draw-as-black`
  - `/challenges/draw-as-white`
  - `/challenges/finish-any-game`
  - `/challenges/finish-as-black`
  - `/challenges/finish-as-white`
  - `/challenges/lose-any-game`
  - `/challenges/lose-as-black`
  - `/challenges/lose-as-white`
  - `/challenges/win-as-black`
  - `/challenges/win-as-white`
- Visible text snippet:

```text
Chess Home Challenges Account Sign in Create account Challenges Pick a real game challenge Start with one simple run, then come back with a Lichess game ID or Chess.com game URL.
```

## Full detail sweep evidence

| Route | Canonical | Active deployment |
| --- | --- | --- |
| `/challenges/draw-any-game` | `200` - `Play a real game, finish it as a draw, and return with the game ID or Chess.com game URL. Lichess and Chess.com are supported here today.` | `200` - `Play a real game, finish it as a draw, and return with the game ID or Chess.com game URL. Lichess and Chess.com are supported here today.` |
| `/challenges/draw-as-black` | `200` - `Play a real game as Black, finish it as a draw, and return with the game ID or Chess.com game URL. Lichess and Chess.com are supported here today.` | `200` - `Play a real game as Black, finish it as a draw, and return with the game ID or Chess.com game URL. Lichess and Chess.com are supported here today.` |
| `/challenges/draw-as-white` | `200` - `Play a real game as White, finish it as a draw, and return with the game ID or Chess.com game URL. Lichess and Chess.com are supported here today.` | `200` - `Play a real game as White, finish it as a draw, and return with the game ID or Chess.com game URL. Lichess and Chess.com are supported here today.` |
| `/challenges/finish-any-game` | `200` - `Play any game and submit the finished Lichess game ID or Chess.com game URL. This proves the loop end-to-end.` | `200` - `Play any game and submit the finished Lichess game ID or Chess.com game URL. This proves the loop end-to-end.` |
| `/challenges/finish-as-black` | `200` - `Start a real game as Black, finish it, and return with the game ID or Chess.com game URL. Lichess and Chess.com are supported here today.` | `200` - `Start a real game as Black, finish it, and return with the game ID or Chess.com game URL. Lichess and Chess.com are supported here today.` |
| `/challenges/finish-as-white` | `200` - `Start a real game as White, finish it, and return with the game ID or Chess.com game URL. Lichess and Chess.com are supported here today.` | `200` - `Start a real game as White, finish it, and return with the game ID or Chess.com game URL. Lichess and Chess.com are supported here today.` |
| `/challenges/lose-any-game` | `200` - `Play a real game, finish it with a loss, and return with the game ID or Chess.com game URL. Lichess and Chess.com are supported here today.` | `200` - `Play a real game, finish it with a loss, and return with the game ID or Chess.com game URL. Lichess and Chess.com are supported here today.` |
| `/challenges/lose-as-black` | `200` - `Play a real game as Black, finish it with a loss, and return with the game ID or Chess.com game URL. Lichess and Chess.com are supported here today.` | `200` - `Play a real game as Black, finish it with a loss, and return with the game ID or Chess.com game URL. Lichess and Chess.com are supported here today.` |
| `/challenges/lose-as-white` | `200` - `Play a real game as White, finish it with a loss, and return with the game ID or Chess.com game URL. Lichess and Chess.com are supported here today.` | `200` - `Play a real game as White, finish it with a loss, and return with the game ID or Chess.com game URL. Lichess and Chess.com are supported here today.` |
| `/challenges/win-as-black` | `200` - `Play a real game as Black and finish it with a win. Return the finished game ID or Chess.com game URL. Lichess and Chess.com are supported here today.` | `200` - `Play a real game as Black and finish it with a win. Return the finished game ID or Chess.com game URL. Lichess and Chess.com are supported here today.` |
| `/challenges/win-as-white` | `200` - `Start a real game and play as White. Return with a finished game ID or Chess.com game URL. Lichess and Chess.com are supported here today.` | `200` - `Start a real game and play as White. Return with a finished game ID or Chess.com game URL. Lichess and Chess.com are supported here today.` |

## Signed-out protected-route evidence

### Canonical host `/account`
- Status: `404`
- Visible text snippet:

```text
404: This page could not be found. Chess 404 This page could not be found.
```

### Active deployment host `/account`
- Status: `404`
- Visible text snippet:

```text
404: This page could not be found. Chess 404 This page could not be found.
```

## Shared signals supporting the full-catalog detail-sweep verdict

The same-run responses on both hosts exposed these shared signals:

- `/challenges` listed the same full eleven shipped challenge routes on both hosts during the same proof window.
- Every shipped detail route returned `200` on both hosts during the same run.
- Every shipped detail route continued to show the same Chess.com-supported challenge flow wording on both hosts.
- `finish-any-game` continued to show the shared end-to-end submission wording: `Play any game and submit the finished Lichess game ID or Chess.com game URL. This proves the loop end-to-end.`
- Signed-out `/account` returned the same visible `404` protection shape on both hosts during the same run.

## Parity verdict

The canonical host and active deployment host served the same full catalog detail sweep successfully in one proof window across `/challenges`, all eleven shipped `/challenges/[id]` routes, and signed-out `/account`. Both hosts exposed the same eleven-route catalog, every shipped detail route matched with the same visible Chess.com-supported wording, and the protected route matched with the same signed-out `404` shape. This is a clean dual-host full-catalog detail-sweep parity pass.

## Verification

Verified live on 2026-04-12 by fetching all twenty-six exact URLs in one Python run, confirming both `/challenges` responses exposed the same eleven shipped routes during that proof window, and confirming all twenty-two detail responses plus both signed-out `/account` responses matched across hosts.
