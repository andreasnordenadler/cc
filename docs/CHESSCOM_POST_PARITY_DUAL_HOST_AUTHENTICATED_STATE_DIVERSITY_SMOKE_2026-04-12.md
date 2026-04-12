# Chess.com Post-Parity Dual-Host Authenticated State-Diversity Smoke

Date: 2026-04-12
Checked by: Sam
Browser context: signed-in Google Chrome session on the Mac mini
Proof window (UTC): 2026-04-12 04:03:23 to 2026-04-12 04:03:43

## Exact signed-in URLs checked

### `/account`

- Canonical host: https://cc-andreas-nordenadlers-projects.vercel.app/account
- Active deployment host: https://cc-taupe-kappa.vercel.app/account

### `/challenges/finish-any-game`

- Canonical host: https://cc-andreas-nordenadlers-projects.vercel.app/challenges/finish-any-game
- Active deployment host: https://cc-taupe-kappa.vercel.app/challenges/finish-any-game

### `/challenges/finish-as-white`

- Canonical host: https://cc-andreas-nordenadlers-projects.vercel.app/challenges/finish-as-white
- Active deployment host: https://cc-taupe-kappa.vercel.app/challenges/finish-as-white

## Same-run authenticated state-diversity evidence

All six signed-in checks completed during the same Chrome proof window in one signed-in browser context.

Shared visible evidence captured on both signed-in `/account` surfaces during that one run:

- page title: `Chess`
- signed-in nav context: `Home`, `Challenges`, `Account`, `Signed in`
- account surface: `ACCOUNT`, `Save your chess usernames`, `Lichess: and72nor`, `Chess.com: not set yet`, and `Continue: Finish Any Game`
- recent-submission context: `Finish Any Game 1775839236009`, `No completed games found after this challenge was accepted.`, `Finish Any Game 1775839227091`, and `Verified: finished as black.`

Shared visible evidence captured on both signed-in `/challenges/finish-any-game` surfaces during that same run:

- detail chrome: `CHALLENGE DETAIL`, `Finish Any Game`, `Home`, `Challenges`, `Account`, and `Signed in`
- current challenge-state evidence: `Saved Lichess username: and72nor`, `Saved Chess.com username: not set yet`, `This challenge accepts a Lichess game ID/URL or a Chess.com game URL.`, `LATEST ATTEMPT`, `Pending review`, `No attempt submitted yet`, and `No attempt history yet for this challenge.`
- shared Chess.com-enabled copy: `Play any game and submit the finished Lichess game ID or Chess.com game URL. This proves the loop end-to-end.`, `Opening hint: This is the fastest loop sanity check with your saved identity, and it now supports both Lichess and Chess.com.`, and `For this challenge, Chess.com pasted game URLs now work too.`

Shared visible evidence captured on both signed-in `/challenges/finish-as-white` surfaces during that same run:

- untouched challenge-state evidence: `Finish as White`, `Saved Lichess username: and72nor`, `Saved Chess.com username: not set yet`, `Start this challenge`, `LATEST ATTEMPT`, `Pending review`, `No attempt submitted yet`, `This challenge is not active yet.`, and `No attempt history yet for this challenge.`
- side-aware follow-up copy: `Start a real game as White, finish it, and return with the game ID or Chess.com game URL. Lichess and Chess.com are supported here today.`, `Opening hint: This is the smallest step up from any finished game, keeping the focus on side awareness instead of winning, and it now supports both Lichess and Chess.com.`, and `For this challenge, automated verification currently uses the Lichess path.`

## Dual-host authenticated state-diversity parity verdict

Pass. During the same signed-in Chrome proof window, both the canonical host and the active deployment host rendered matching authenticated surfaces for `/account`, `/challenges/finish-any-game`, and `/challenges/finish-as-white`. Both hosts showed the same signed-in account context and recent submission evidence, the same current `finish-any-game` detail state, and the same untouched `finish-as-white` detail state. That supports a same-run dual-host authenticated state-diversity parity verdict.

## Verification note

Verified locally on 2026-04-12 by checking all six live signed-in URLs in Google Chrome during one proof window and by confirming this artifact exists with `test -f docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_STATE_DIVERSITY_SMOKE_2026-04-12.md`.
