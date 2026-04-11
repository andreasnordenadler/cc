# Chess.com Post-Parity Dual-Host Full Mixed-Surface Bundle Smoke

Date: 2026-04-11
Proof window: 2026-04-11 20:41:49 UTC to 2026-04-11 20:41:54 UTC (same-run dual-host fetch)

## Exact live URLs checked

### Canonical host
- `https://cc-andreas-nordenadlers-projects.vercel.app/`
- `https://cc-andreas-nordenadlers-projects.vercel.app/challenges`
- `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/win-as-white`
- `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/lose-as-black`
- `https://cc-andreas-nordenadlers-projects.vercel.app/account`

### Active deployment host
- `https://cc-taupe-kappa.vercel.app/`
- `https://cc-taupe-kappa.vercel.app/challenges`
- `https://cc-taupe-kappa.vercel.app/challenges/win-as-white`
- `https://cc-taupe-kappa.vercel.app/challenges/lose-as-black`
- `https://cc-taupe-kappa.vercel.app/account`

## Result

Dual-host full mixed-surface bundle parity passed.

All ten checks completed during the same proof window. The four public routes returned `200` on both hosts, and the signed-out protected `/account` route returned the same protected `404` shape on both hosts.

## Live response evidence

### Canonical host

- `/`
  - Status: `200`
  - Visible text snippet:

```text
Chess Home Challenges Account Sign in Create account Your next chess challenge starts with your real game on Lichess or Chess.com. Play real games, verify the result automatically, and track your progress clearly.
```

- `/challenges`
  - Status: `200`
  - Visible text snippet:

```text
Chess Home Challenges Account Sign in Create account Challenges Pick a real game challenge Start with one simple run, then come back with a Lichess game ID or Chess.com game URL.
```

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

- `/`
  - Status: `200`
  - Visible text snippet:

```text
Chess Home Challenges Account Sign in Create account Your next chess challenge starts with your real game on Lichess or Chess.com. Play real games, verify the result automatically, and track your progress clearly.
```

- `/challenges`
  - Status: `200`
  - Visible text snippet:

```text
Chess Home Challenges Account Sign in Create account Challenges Pick a real game challenge Start with one simple run, then come back with a Lichess game ID or Chess.com game URL.
```

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

## Shared surface signals supporting the full mixed-surface verdict

The same-run responses on both hosts exposed these shared full mixed-surface signals:

- Home: `Your next chess challenge starts with your real game on Lichess or Chess.com.`
- Challenge list: `Start with one simple run, then come back with a Lichess game ID or Chess.com game URL.`
- Representative detail: `Return with a finished game ID or Chess.com game URL. Lichess and Chess.com are supported here today.`
- Boundary detail: `Play a real game as Black, finish it with a loss, and return with the game ID or Chess.com game URL. Lichess and Chess.com are supported here today.`
- Signed-out protected route: `/account` returned `404` with the same visible not-found protection shape on both hosts during the same run.

## Parity verdict

The canonical host and active deployment host served the same full mixed-surface bundle successfully in one proof window across `/`, `/challenges`, `/challenges/win-as-white`, `/challenges/lose-as-black`, and signed-out `/account`. The four public routes matched with shared Chess.com-supported wording, and the protected route matched with the same signed-out `404` shape. This is a clean dual-host full mixed-surface bundle parity pass.

## Verification

Verified live on 2026-04-11 by fetching all ten exact URLs in one Python run and confirming the four public `200` results plus the shared signed-out protected-route `404` shape during the same proof window.
