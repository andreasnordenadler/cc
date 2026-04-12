# Chess.com Post-Parity Dual-Host Authenticated Triad-Plus-List Smoke

Date: 2026-04-12
Checked by: Sam
Browser context: signed-in Google Chrome session on the Mac mini
Proof window (UTC): 2026-04-12 05:05:16 to 2026-04-12 05:06:45

## Exact signed-in URLs checked

### `/account`

- Canonical host: https://cc-andreas-nordenadlers-projects.vercel.app/account
- Active deployment host: https://cc-taupe-kappa.vercel.app/account

### `/challenges`

- Canonical host: https://cc-andreas-nordenadlers-projects.vercel.app/challenges
- Active deployment host: https://cc-taupe-kappa.vercel.app/challenges

### `/challenges/finish-any-game`

- Canonical host: https://cc-andreas-nordenadlers-projects.vercel.app/challenges/finish-any-game
- Active deployment host: https://cc-taupe-kappa.vercel.app/challenges/finish-any-game

### `/challenges/finish-as-white`

- Canonical host: https://cc-andreas-nordenadlers-projects.vercel.app/challenges/finish-as-white
- Active deployment host: https://cc-taupe-kappa.vercel.app/challenges/finish-as-white

### `/challenges/lose-as-black`

- Canonical host: https://cc-andreas-nordenadlers-projects.vercel.app/challenges/lose-as-black
- Active deployment host: https://cc-taupe-kappa.vercel.app/challenges/lose-as-black

## Same-run authenticated triad-plus-list evidence

All ten signed-in checks completed during the same Chrome proof window in one signed-in browser context.

Shared visible evidence captured on both signed-in `/account` surfaces during that run:

- account chrome: `Home`, `Challenges`, `Account`, `Signed in`, and `ACCOUNT`
- shared signed-in identity state: `Lichess: and72nor`, `Chess.com: not set yet`, `Active challenge`, `Continue: Finish Any Game`, and `Challenge is active since Apr 10, 04:40 PM.`
- shared recent-submission evidence: `Recent submissions`, `Finish Any Game 1775839236009`, `No completed games found after this challenge was accepted.`, `Finish Any Game 1775839227091`, and `Verified: finished as black.`

Shared visible evidence captured on both signed-in `/challenges` surfaces during that run:

- list chrome: `Home`, `Challenges`, `Account`, `Signed in`, and `CHALLENGES`
- shared signed-in list state: `COMPLETED`, `1`, `80 pts earned across finished challenges.`, `CURRENT`, `Finish Any Game`, `NEXT`, and `Finish As White`
- shared active-run evidence: `Current challenge`, `ACTIVE`, `FINISH`, `EITHER`, `Continue challenge`, and `Challenge is active since Apr 10, 04:40 PM.`
- shared catalog evidence: both signed-in `/challenges` surfaces exposed the same eleven shipped challenge routes during the proof window: `/challenges/draw-any-game`, `/challenges/draw-as-black`, `/challenges/draw-as-white`, `/challenges/finish-any-game`, `/challenges/finish-as-black`, `/challenges/finish-as-white`, `/challenges/lose-any-game`, `/challenges/lose-as-black`, `/challenges/lose-as-white`, `/challenges/win-as-black`, and `/challenges/win-as-white`

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

## Dual-host authenticated triad-plus-list parity verdict

Pass. During the same signed-in Chrome proof window, both the canonical host and the active deployment host rendered matching authenticated `/account`, `/challenges`, `/challenges/finish-any-game`, `/challenges/finish-as-white`, and `/challenges/lose-as-black` surfaces. Both signed-in `/challenges` pages exposed the same full eleven-route catalog during that run, and both hosts matched on signed-in account context, active finished-game state, untouched side-aware state, and boundary loss state. That supports a same-run dual-host authenticated triad-plus-list parity verdict.

## Verification note

Verified locally on 2026-04-12 by checking all ten live signed-in URLs in Google Chrome during one proof window, confirming both signed-in `/challenges` surfaces exposed the same eleven shipped challenge routes, and confirming this artifact exists with `test -f docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_TRIAD_PLUS_LIST_SMOKE_2026-04-12.md`.
