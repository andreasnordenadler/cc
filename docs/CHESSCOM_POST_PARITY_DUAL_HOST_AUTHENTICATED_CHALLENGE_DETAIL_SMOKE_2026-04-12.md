# Chess.com Post-Parity Dual-Host Authenticated Challenge Detail Smoke

Date: 2026-04-12
Checked by: Sam
Browser context: signed-in Google Chrome session on the Mac mini
Proof window (UTC): 2026-04-12 01:21:53 to 2026-04-12 01:21:58

## Exact signed-in representative-detail URLs checked

- Canonical host: https://cc-andreas-nordenadlers-projects.vercel.app/challenges/finish-any-game
- Active deployment host: https://cc-taupe-kappa.vercel.app/challenges/finish-any-game

## Authenticated representative-detail surface evidence

Both URLs loaded the same signed-in representative challenge-detail surface.

Shared visible evidence captured on both hosts during the proof window:

- page title: `Chess`
- signed-in nav context: `Home`, `Challenges`, `Account`, `Signed in`
- route context: `← Back to challenge list`
- section header: `CHALLENGE DETAIL`
- challenge title: `Finish Any Game`
- representative Chess.com-supported copy: `Play any game and submit the finished Lichess game ID or Chess.com game URL. This proves the loop end-to-end.`
- saved identity evidence: `Saved Lichess username: and72nor` and `Saved Chess.com username: not set yet`
- submission control wording: `Finished Lichess game ID/URL or Chess.com game URL` and `Submit for review`
- latest-attempt state: `LATEST ATTEMPT`, `Pending review`, `No attempt submitted yet`
- representative support copy: `For this challenge, Chess.com pasted game URLs now work too.`
- history state: `Attempt history` and `No attempt history yet for this challenge.`

## Dual-host authenticated representative-detail parity verdict

Pass. During the same signed-in Chrome proof window, both the canonical host and the active deployment host rendered the same authenticated `/challenges/finish-any-game` representative-detail surface with matching navigation, challenge copy, saved-identity state, submission controls, and latest-attempt/history evidence. That supports a dual-host authenticated representative-detail parity verdict.

## Verification note

Verified locally on 2026-04-12 by checking both live signed-in `/challenges/finish-any-game` URLs in Google Chrome and by confirming this artifact exists with `test -f docs/CHESSCOM_POST_PARITY_DUAL_HOST_AUTHENTICATED_CHALLENGE_DETAIL_SMOKE_2026-04-12.md`.
