# Chess.com Post-Parity Dual-Host Authenticated Boundary Detail Smoke

Date: 2026-04-12
Checked by: Sam
Browser context: signed-in Google Chrome session on the Mac mini
Proof window (UTC): 2026-04-12 02:02:40 to 2026-04-12 02:02:47

## Exact signed-in boundary-detail URLs checked

- Canonical host: https://cc-andreas-nordenadlers-projects.vercel.app/challenges/lose-as-black
- Active deployment host: https://cc-taupe-kappa.vercel.app/challenges/lose-as-black

## Authenticated boundary-detail surface evidence

Both URLs loaded the same signed-in boundary challenge-detail surface.

Shared visible evidence captured on both hosts during the proof window:

- page title: `Chess`
- signed-in nav context: `Home`, `Challenges`, `Account`, `Signed in`
- route context: `← Back to challenge list`
- section header: `CHALLENGE DETAIL`
- challenge title: `Lose as Black`
- boundary Chess.com-supported copy: `Play a real game as Black, finish it with a loss, and return with the game ID or Chess.com game URL. Lichess and Chess.com are supported here today.`
- saved identity evidence: `Saved Lichess username: and72nor` and `Saved Chess.com username: not set yet`
- verification-state copy: `For this challenge, automated verification currently uses the Lichess path.`
- submission control wording: `Finished Lichess game ID/URL or Chess.com game URL` and `Submit for review`
- latest-attempt state: `LATEST ATTEMPT`, `Pending review`, `No attempt submitted yet`
- history state: `Attempt history` and `No attempt history yet for this challenge.`

## Dual-host authenticated boundary-detail parity verdict

Pass. During the same signed-in Chrome proof window, both the canonical host and the active deployment host rendered the same authenticated `/challenges/lose-as-black` boundary-detail surface with matching navigation, challenge copy, saved-identity state, verification-state copy, submission controls, and latest-attempt/history evidence. That supports a dual-host authenticated boundary-detail parity verdict.

## Verification note

Verified locally on 2026-04-12 by checking both live signed-in `/challenges/lose-as-black` URLs in Google Chrome and by confirming this artifact exists with `test -f docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_BOUNDARY_DETAIL_SMOKE_2026-04-12.md`.
