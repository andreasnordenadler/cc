# Chess.com Post-Parity Dual-Host Catalog-Mixed Smoke

Date: 2026-04-11
Proof window: 2026-04-11 21:21:54 UTC to 2026-04-11 21:21:58 UTC (same-run dual-host fetch)

## Exact live URLs checked

### Canonical host
- `https://cc-andreas-nordenadlers-projects.vercel.app/challenges`
- `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/win-as-white`
- `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/lose-as-black`
- `https://cc-andreas-nordenadlers-projects.vercel.app/account`

### Active deployment host
- `https://cc-taupe-kappa.vercel.app/challenges`
- `https://cc-taupe-kappa.vercel.app/challenges/win-as-white`
- `https://cc-taupe-kappa.vercel.app/challenges/lose-as-black`
- `https://cc-taupe-kappa.vercel.app/account`

## Result

Dual-host catalog-mixed parity passed.

All eight checks completed during the same proof window. Both `/challenges` responses returned `200` and exposed the full eleven-route challenge catalog. Both representative and boundary detail routes returned `200`, and both signed-out `/account` checks returned the same protected `404` shape.

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

## Mixed-surface evidence

### Canonical host

- `/challenges/win-as-white`
  - Status: `200`
  - Visible text snippet:

```text
Chess Home Challenges Account Sign in Create account ← Back to challenge list Challenge detail Win as White Win one complete game as White. Start a real game and play as White. Return with a finished game ID or Chess.com game URL. Lichess and Chess.com are supported here today.
```

- `/challenges/lose-as-black`
  - Status: `200`
  - Visible text snippet:

```text
Chess Home Challenges Account Sign in Create account ← Back to challenge list Challenge detail Lose as Black Finish and submit one lost game where you played as Black. Play a real game as Black, finish it with a loss, and return with the game ID or Chess.com game URL. Lichess and Chess.com are supported here today.
```

- `/account`
  - Status: `404`
  - Visible text snippet:

```text
404: This page could not be found. Chess 404 This page could not be found.
```

### Active deployment host

- `/challenges/win-as-white`
  - Status: `200`
  - Visible text snippet:

```text
Chess Home Challenges Account Sign in Create account ← Back to challenge list Challenge detail Win as White Win one complete game as White. Start a real game and play as White. Return with a finished game ID or Chess.com game URL. Lichess and Chess.com are supported here today.
```

- `/challenges/lose-as-black`
  - Status: `200`
  - Visible text snippet:

```text
Chess Home Challenges Account Sign in Create account ← Back to challenge list Challenge detail Lose as Black Finish and submit one lost game where you played as Black. Play a real game as Black, finish it with a loss, and return with the game ID or Chess.com game URL. Lichess and Chess.com are supported here today.
```

- `/account`
  - Status: `404`
  - Visible text snippet:

```text
404: This page could not be found. Chess 404 This page could not be found.
```

## Shared signals supporting the catalog-mixed verdict

The same-run responses on both hosts exposed these shared signals:

- `/challenges` listed the full eleven shipped challenge routes on both hosts during the same proof window.
- Representative detail: `Return with a finished game ID or Chess.com game URL. Lichess and Chess.com are supported here today.`
- Boundary detail: `Play a real game as Black, finish it with a loss, and return with the game ID or Chess.com game URL. Lichess and Chess.com are supported here today.`
- Signed-out protected route: `/account` returned `404` with the same visible not-found protection shape on both hosts during the same run.

## Parity verdict

The canonical host and active deployment host served the same catalog-mixed parity slice successfully in one proof window across `/challenges`, `/challenges/win-as-white`, `/challenges/lose-as-black`, and signed-out `/account`. Both hosts exposed the full eleven-route Chess.com-supported catalog on `/challenges`, both detail routes matched with the same visible wording, and the protected route matched with the same signed-out `404` shape. This is a clean dual-host catalog-mixed parity pass.

## Verification

Verified live on 2026-04-11 by fetching all eight exact URLs in one Python run, confirming eleven challenge routes on both `/challenges` surfaces, and then independently rechecking the two `/challenges` surfaces plus both signed-out `/account` responses in a second Python pass.