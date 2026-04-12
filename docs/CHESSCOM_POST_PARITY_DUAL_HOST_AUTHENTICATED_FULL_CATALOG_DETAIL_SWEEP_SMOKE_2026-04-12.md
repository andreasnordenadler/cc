# Chess.com Post-Parity Dual-Host Authenticated Full-Catalog Detail-Sweep Smoke

Date: 2026-04-12
Checked by: Sam
Browser context: signed-in Google Chrome session on the Mac mini
Proof window (UTC): 2026-04-12 03:22:35 to 2026-04-12 03:24:06

## Exact signed-in URLs checked

### `/account`

- Canonical host: https://cc-andreas-nordenadlers-projects.vercel.app/account
- Active deployment host: https://cc-taupe-kappa.vercel.app/account

### `/challenges`

- Canonical host: https://cc-andreas-nordenadlers-projects.vercel.app/challenges
- Active deployment host: https://cc-taupe-kappa.vercel.app/challenges

### All shipped `/challenges/[id]` routes

#### `/challenges/finish-any-game`

- Canonical host: https://cc-andreas-nordenadlers-projects.vercel.app/challenges/finish-any-game
- Active deployment host: https://cc-taupe-kappa.vercel.app/challenges/finish-any-game

#### `/challenges/finish-as-white`

- Canonical host: https://cc-andreas-nordenadlers-projects.vercel.app/challenges/finish-as-white
- Active deployment host: https://cc-taupe-kappa.vercel.app/challenges/finish-as-white

#### `/challenges/finish-as-black`

- Canonical host: https://cc-andreas-nordenadlers-projects.vercel.app/challenges/finish-as-black
- Active deployment host: https://cc-taupe-kappa.vercel.app/challenges/finish-as-black

#### `/challenges/win-as-white`

- Canonical host: https://cc-andreas-nordenadlers-projects.vercel.app/challenges/win-as-white
- Active deployment host: https://cc-taupe-kappa.vercel.app/challenges/win-as-white

#### `/challenges/win-as-black`

- Canonical host: https://cc-andreas-nordenadlers-projects.vercel.app/challenges/win-as-black
- Active deployment host: https://cc-taupe-kappa.vercel.app/challenges/win-as-black

#### `/challenges/draw-any-game`

- Canonical host: https://cc-andreas-nordenadlers-projects.vercel.app/challenges/draw-any-game
- Active deployment host: https://cc-taupe-kappa.vercel.app/challenges/draw-any-game

#### `/challenges/draw-as-white`

- Canonical host: https://cc-andreas-nordenadlers-projects.vercel.app/challenges/draw-as-white
- Active deployment host: https://cc-taupe-kappa.vercel.app/challenges/draw-as-white

#### `/challenges/draw-as-black`

- Canonical host: https://cc-andreas-nordenadlers-projects.vercel.app/challenges/draw-as-black
- Active deployment host: https://cc-taupe-kappa.vercel.app/challenges/draw-as-black

#### `/challenges/lose-any-game`

- Canonical host: https://cc-andreas-nordenadlers-projects.vercel.app/challenges/lose-any-game
- Active deployment host: https://cc-taupe-kappa.vercel.app/challenges/lose-any-game

#### `/challenges/lose-as-white`

- Canonical host: https://cc-andreas-nordenadlers-projects.vercel.app/challenges/lose-as-white
- Active deployment host: https://cc-taupe-kappa.vercel.app/challenges/lose-as-white

#### `/challenges/lose-as-black`

- Canonical host: https://cc-andreas-nordenadlers-projects.vercel.app/challenges/lose-as-black
- Active deployment host: https://cc-taupe-kappa.vercel.app/challenges/lose-as-black

## Same-run authenticated full-catalog evidence

All twenty-six signed-in checks completed during the same Chrome proof window in one signed-in browser context.

Shared visible evidence captured on both `/account` surfaces during that one run:

- page title: `Chess`
- signed-in nav context: `Home`, `Challenges`, `Account`, `Signed in`
- account surface: `ACCOUNT`, `Save your chess usernames`, `Lichess: and72nor`, `Chess.com: not set yet`, and `Continue: Finish Any Game`
- account recent-submission evidence: `Finish Any Game 1775839236009`, `No completed games found after this challenge was accepted.`, and `Finish Any Game 1775839227091`, `Verified: finished as black.`

Shared visible evidence captured on both signed-in `/challenges` surfaces during that same run:

- list surface: `CHALLENGES`, `Pick a real game challenge`, and `Start with one simple run, then come back with a Lichess game ID or Chess.com game URL.`
- progress and routing evidence: `COMPLETED`, `1`, `80 pts earned across finished challenges.`, `CURRENT`, `Finish Any Game`, `NEXT`, `Finish As White`, and `Continue challenge`
- full eleven-route catalog evidence on both hosts during that same run: `Finish Any Game`, `Finish as White`, `Finish as Black`, `Win as White`, `Win as Black`, `Draw Any Game`, `Draw as White`, `Draw as Black`, `Lose Any Game`, `Lose as White`, and `Lose as Black`

Shared visible evidence captured across all twenty-two signed-in detail pages during that same run:

- shared detail chrome: `CHALLENGE DETAIL`, `Home`, `Challenges`, `Account`, and `Signed in`
- shared identity and submission state: `Saved Lichess username: and72nor`, `Saved Chess.com username: not set yet`, `Finished Lichess game ID/URL or Chess.com game URL`, `Submit for review`, `LATEST ATTEMPT`, and `Pending review`
- shared history state across the current full-catalog sweep: `No attempt history yet for this challenge.` on the currently unplayed catalog items
- representative Chess.com-enabled detail evidence on both hosts for `/challenges/finish-any-game`: `Finish Any Game`, `Play any game and submit the finished Lichess game ID or Chess.com game URL. This proves the loop end-to-end.`, `This challenge accepts a Lichess game ID/URL or a Chess.com game URL.`, and `For this challenge, Chess.com pasted game URLs now work too.`
- side-aware finish evidence on both hosts for `/challenges/finish-as-white` and `/challenges/finish-as-black`: `Finish as White`, `Finish as Black`, and `Lichess and Chess.com are supported here today.`
- win-pair evidence on both hosts for `/challenges/win-as-white` and `/challenges/win-as-black`: `Win as White`, `Win as Black`, and `Lichess and Chess.com are supported here today.`
- draw-catalog evidence on both hosts for `/challenges/draw-any-game`, `/challenges/draw-as-white`, and `/challenges/draw-as-black`: `Draw Any Game`, `Draw as White`, `Draw as Black`, and `Lichess and Chess.com are supported here today.`
- loss-catalog evidence on both hosts for `/challenges/lose-any-game`, `/challenges/lose-as-white`, and `/challenges/lose-as-black`: `Lose Any Game`, `Lose as White`, `Lose as Black`, and `Lichess and Chess.com are supported here today.`

## Dual-host authenticated full-catalog parity verdict

Pass. During the same signed-in Chrome proof window, both the canonical host and the active deployment host rendered matching authenticated surfaces for `/account`, `/challenges`, and all eleven shipped `/challenges/[id]` routes. Both signed-in `/challenges` pages exposed the same full eleven-route catalog during that same run, and all twenty-two signed-in detail pages showed the same challenge-specific titles, the same saved-identity state, the same submission controls, and the same current attempt/history state. That supports a same-run dual-host authenticated full-catalog detail-sweep parity verdict.

## Verification note

Verified locally on 2026-04-12 by checking all twenty-six live signed-in URLs in Google Chrome during one proof window and by confirming this artifact exists with `test -f docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_FULL_CATALOG_DETAIL_SWEEP_SMOKE_2026-04-12.md`.
