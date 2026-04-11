# Chess.com Post-Parity Dual-Host Public-Bundle Smoke

Date: 2026-04-11
Proof window: 2026-04-11 18:41:47 UTC to 2026-04-11 18:41:49 UTC (same-run dual-host fetch)

## Exact live URLs checked

### Canonical host
- `https://cc-andreas-nordenadlers-projects.vercel.app/`
- `https://cc-andreas-nordenadlers-projects.vercel.app/challenges`
- `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/win-as-white`
- `https://cc-andreas-nordenadlers-projects.vercel.app/challenges/lose-as-black`

### Active deployment host
- `https://cc-taupe-kappa.vercel.app/`
- `https://cc-taupe-kappa.vercel.app/challenges`
- `https://cc-taupe-kappa.vercel.app/challenges/win-as-white`
- `https://cc-taupe-kappa.vercel.app/challenges/lose-as-black`

## Result

Dual-host public-bundle parity passed.

All eight checks returned successfully during the same proof window across the representative public bundle of home, challenge list, representative detail, and boundary detail routes.

## Live response evidence

### Canonical host

- `/`
  - Status: `200`
  - `date`: `Sat, 11 Apr 2026 18:41:47 GMT`
  - `x-matched-path`: `/`
  - `x-vercel-id`: `arn1::iad1::jrdwp-1775932905610-a7ac6b7d9b48`
  - Visible text snippet:

```text
Chess Home Challenges Account Sign in Create account Your next chess challenge starts with your real game on Lichess or Chess.com. Play real games, verify the result automatically, and track your progress clearly.
```

- `/challenges`
  - Status: `200`
  - `date`: `Sat, 11 Apr 2026 18:41:47 GMT`
  - `x-matched-path`: `/challenges`
  - `x-vercel-id`: `arn1::iad1::fd4jj-1775932907732-6cb44b5a5749`
  - Visible text snippet:

```text
Chess Home Challenges Account Sign in Create account Challenges Pick a real game challenge Start with one simple run, then come back with a Lichess game ID or Chess.com game URL.
```

- `/challenges/win-as-white`
  - Status: `200`
  - `date`: `Sat, 11 Apr 2026 18:41:48 GMT`
  - `x-matched-path`: `/challenges/[id]`
  - `x-vercel-id`: `arn1::iad1::4vh9x-1775932908324-60f60820b3c7`
  - Visible text snippet:

```text
Challenge detail Win as White Win one complete game as White. Start a real game and play as White. Return with a finished game ID or Chess.com game URL. Lichess and Chess.com are supported here today.
```

- `/challenges/lose-as-black`
  - Status: `200`
  - `date`: `Sat, 11 Apr 2026 18:41:48 GMT`
  - `x-matched-path`: `/challenges/[id]`
  - `x-vercel-id`: `arn1::iad1::scqv8-1775932908848-a8f8aa3cce18`
  - Visible text snippet:

```text
Challenge detail Lose as Black Finish and submit one lost game where you played as Black. Play a real game as Black, finish it with a loss, and return with the game ID or Chess.com game URL. Lichess and Chess.com are supported here today.
```

### Active deployment host

- `/`
  - Status: `200`
  - `date`: `Sat, 11 Apr 2026 18:41:47 GMT`
  - `x-matched-path`: `/`
  - `x-vercel-id`: `arn1::iad1::2vnbl-1775932907430-e608841df503`
  - Visible text snippet:

```text
Chess Home Challenges Account Sign in Create account Your next chess challenge starts with your real game on Lichess or Chess.com. Play real games, verify the result automatically, and track your progress clearly.
```

- `/challenges`
  - Status: `200`
  - `date`: `Sat, 11 Apr 2026 18:41:48 GMT`
  - `x-matched-path`: `/challenges`
  - `x-vercel-id`: `arn1::iad1::kzqc9-1775932908047-638796e00b98`
  - Visible text snippet:

```text
Chess Home Challenges Account Sign in Create account Challenges Pick a real game challenge Start with one simple run, then come back with a Lichess game ID or Chess.com game URL.
```

- `/challenges/win-as-white`
  - Status: `200`
  - `date`: `Sat, 11 Apr 2026 18:41:48 GMT`
  - `x-matched-path`: `/challenges/[id]`
  - `x-vercel-id`: `arn1::iad1::2vnbl-1775932908594-86070e84547d`
  - Visible text snippet:

```text
Challenge detail Win as White Win one complete game as White. Start a real game and play as White. Return with a finished game ID or Chess.com game URL. Lichess and Chess.com are supported here today.
```

- `/challenges/lose-as-black`
  - Status: `200`
  - `date`: `Sat, 11 Apr 2026 18:41:49 GMT`
  - `x-matched-path`: `/challenges/[id]`
  - `x-vercel-id`: `arn1::iad1::nz7m5-1775932909124-249bf9bd89c7`
  - Visible text snippet:

```text
Challenge detail Lose as Black Finish and submit one lost game where you played as Black. Play a real game as Black, finish it with a loss, and return with the game ID or Chess.com game URL. Lichess and Chess.com are supported here today.
```

## Shared visible wording supporting the bundle verdict

The same-run responses on both hosts exposed these shared public Chess.com-supported surface signals:

- Home: `Your next chess challenge starts with your real game on Lichess or Chess.com.`
- Challenge list: `Start with one simple run, then come back with a Lichess game ID or Chess.com game URL.`
- Representative detail: `Return with a finished game ID or Chess.com game URL. Lichess and Chess.com are supported here today.`
- Boundary detail: `finish it with a loss, and return with the game ID or Chess.com game URL. Lichess and Chess.com are supported here today.`

## Parity verdict

The canonical host and active deployment host served the same representative public bundle successfully in one proof window across `/`, `/challenges`, `/challenges/win-as-white`, and `/challenges/lose-as-black`, with shared visible Chess.com-supported wording on each surface. This is a clean dual-host public-bundle parity pass.

## Verification

Verified live on 2026-04-11 by fetching all eight exact URLs in one Python run and confirming each returned success plus the quoted shared wording during the same proof window.
