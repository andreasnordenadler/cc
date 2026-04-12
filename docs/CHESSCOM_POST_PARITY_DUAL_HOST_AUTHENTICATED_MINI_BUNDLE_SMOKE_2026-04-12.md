# Chess.com Post-Parity Dual-Host Authenticated Mini-Bundle Smoke

Date: 2026-04-12
Checked by: Sam
Browser context: signed-in Google Chrome session on the Mac mini
Proof window (UTC): 2026-04-12 02:42:22 to 2026-04-12 02:42:54

## Exact signed-in URLs checked

### `/account`

- Canonical host: https://cc-andreas-nordenadlers-projects.vercel.app/account
- Active deployment host: https://cc-taupe-kappa.vercel.app/account

### `/challenges/finish-any-game`

- Canonical host: https://cc-andreas-nordenadlers-projects.vercel.app/challenges/finish-any-game
- Active deployment host: https://cc-taupe-kappa.vercel.app/challenges/finish-any-game

### `/challenges/lose-as-black`

- Canonical host: https://cc-andreas-nordenadlers-projects.vercel.app/challenges/lose-as-black
- Active deployment host: https://cc-taupe-kappa.vercel.app/challenges/lose-as-black

## Same-run authenticated mini-bundle evidence

All six signed-in checks completed during the same Chrome proof window.

Shared visible evidence captured on both hosts during that one run:

- page title: `Chess`
- signed-in nav context: `Home`, `Challenges`, `Account`, `Signed in`
- account surface: `ACCOUNT`, `Save your chess usernames`, `Lichess: and72nor`, `Chess.com: not set yet`, `Continue: Finish Any Game`
- account recent-submission evidence: `Finish Any Game 1775839236009`, `No completed games found after this challenge was accepted.`, and `Finish Any Game 1775839227091`, `Verified: finished as black.`
- representative challenge-detail surface: `CHALLENGE DETAIL`, `Finish Any Game`, `Play any game and submit the finished Lichess game ID or Chess.com game URL. This proves the loop end-to-end.`, `This challenge accepts a Lichess game ID/URL or a Chess.com game URL.`, and `For this challenge, Chess.com pasted game URLs now work too.`
- boundary challenge-detail surface: `CHALLENGE DETAIL`, `Lose as Black`, `Play a real game as Black, finish it with a loss, and return with the game ID or Chess.com game URL. Lichess and Chess.com are supported here today.`, and `For this challenge, automated verification currently uses the Lichess path.`
- shared challenge-state and submission evidence on both detail pages: `Saved Lichess username: and72nor`, `Saved Chess.com username: not set yet`, `Finished Lichess game ID/URL or Chess.com game URL`, `Submit for review`, `LATEST ATTEMPT`, `Pending review`, and `No attempt history yet for this challenge.`

## Dual-host authenticated mini-bundle parity verdict

Pass. During the same signed-in Chrome proof window, both the canonical host and the active deployment host rendered matching authenticated surfaces for `/account`, `/challenges/finish-any-game`, and `/challenges/lose-as-black`, with the same account-state evidence, recent-submission evidence, representative-detail copy, boundary-detail copy, and shared submission/history state. That supports a same-run dual-host authenticated mini-bundle parity verdict.

## Verification note

Verified locally on 2026-04-12 by checking all six live signed-in URLs in Google Chrome during one proof window and by confirming this artifact exists with `test -f docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_MINI_BUNDLE_SMOKE_2026-04-12.md`.
