# Chess.com Post-Parity Dual-Host Authenticated Challenge-State-Triad Smoke

Date: 2026-04-12
Checked by: Sam
Browser context: signed-in Google Chrome session on the Mac mini
Proof window (UTC): 2026-04-12 04:42:47 to 2026-04-12 04:43:05

## Exact signed-in URLs checked

### `/challenges/finish-any-game`

- Canonical host: https://cc-andreas-nordenadlers-projects.vercel.app/challenges/finish-any-game
- Active deployment host: https://cc-taupe-kappa.vercel.app/challenges/finish-any-game

### `/challenges/finish-as-white`

- Canonical host: https://cc-andreas-nordenadlers-projects.vercel.app/challenges/finish-as-white
- Active deployment host: https://cc-taupe-kappa.vercel.app/challenges/finish-as-white

### `/challenges/lose-as-black`

- Canonical host: https://cc-andreas-nordenadlers-projects.vercel.app/challenges/lose-as-black
- Active deployment host: https://cc-taupe-kappa.vercel.app/challenges/lose-as-black

## Same-run authenticated challenge-state-triad evidence

All six signed-in checks completed during the same Chrome proof window in one signed-in browser context.

Shared visible evidence captured on both signed-in `/challenges/finish-any-game` surfaces during that run:

- detail chrome: `Home`, `Challenges`, `Account`, `Signed in`, `CHALLENGE DETAIL`, and `Finish Any Game`
- completed-surface copy: `Complete and submit any finished game where your public Lichess or Chess.com account appears.`, `Play any game and submit the finished Lichess game ID or Chess.com game URL. This proves the loop end-to-end.`, and `For this challenge, Chess.com pasted game URLs now work too.`
- shared current-state evidence: `Saved Lichess username: and72nor`, `Saved Chess.com username: not set yet`, `Restart this challenge`, `LATEST ATTEMPT`, `Pending review`, `No attempt submitted yet`, `No latest attempt yet`, `Challenge state: Unable`, and `No attempt history yet for this challenge.`

Shared visible evidence captured on both signed-in `/challenges/finish-as-white` surfaces during that run:

- detail chrome: `Home`, `Challenges`, `Account`, `Signed in`, `CHALLENGE DETAIL`, and `Finish as White`
- untouched side-aware copy: `Complete and submit one finished game where you played as White.`, `Start a real game as White, finish it, and return with the game ID or Chess.com game URL. Lichess and Chess.com are supported here today.`, and `For this challenge, automated verification currently uses the Lichess path.`
- shared untouched-state evidence: `Saved Lichess username: and72nor`, `Saved Chess.com username: not set yet`, `Start this challenge`, `LATEST ATTEMPT`, `Pending review`, `No attempt submitted yet`, `No latest attempt yet`, `This challenge is not active yet.`, and `No attempt history yet for this challenge.`

Shared visible evidence captured on both signed-in `/challenges/lose-as-black` surfaces during that run:

- detail chrome: `Home`, `Challenges`, `Account`, `Signed in`, `CHALLENGE DETAIL`, and `Lose as Black`
- boundary loss-specific copy: `Finish and submit one lost game where you played as Black.`, `Play a real game as Black, finish it with a loss, and return with the game ID or Chess.com game URL. Lichess and Chess.com are supported here today.`, and `For this challenge, automated verification currently uses the Lichess path.`
- shared boundary-state evidence: `Saved Lichess username: and72nor`, `Saved Chess.com username: not set yet`, `Start this challenge`, `LATEST ATTEMPT`, `Pending review`, `No attempt submitted yet`, `No latest attempt yet`, `This challenge is not active yet.`, and `No attempt history yet for this challenge.`

## Dual-host authenticated challenge-state-triad parity verdict

Pass. During the same signed-in Chrome proof window, both the canonical host and the active deployment host rendered matching authenticated challenge-detail surfaces for `/challenges/finish-any-game`, `/challenges/finish-as-white`, and `/challenges/lose-as-black`. Both hosts showed the same completed-surface wording and current-state evidence on `finish-any-game`, the same untouched side-aware state on `finish-as-white`, and the same loss-specific boundary state on `lose-as-black`. That supports a same-run dual-host authenticated challenge-state-triad parity verdict.

## Verification note

Verified locally on 2026-04-12 by checking all six live signed-in URLs in Google Chrome during one proof window and by confirming this artifact exists with `test -f docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_CHALLENGE_STATE_TRIAD_SMOKE_2026-04-12.md`.
