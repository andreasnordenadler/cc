# Chess.com Post-Parity Dual-Host Authenticated Account-Setting Mutation Round-Trip Repeatability Streak Smoke Checklist, 2026-04-12

Date: 2026-04-12
Owner: Sam

## Goal

Capture the smallest proof-bearing checklist for one third fresh same-run signed-in dual-host `/account` Chess.com username mutation round-trip recheck, extending the observed behavior to a three-run streak if both hosts still match.

## Exact signed-in URLs

- Canonical host: `https://cc-andreas-nordenadlers-projects.vercel.app/account`
- Active deployment host: `https://cc-taupe-kappa.vercel.app/account`

## Fresh mutation requirement

- Use one brand new narrow Chess.com username value not used in the prior mutation, persistence, round-trip, or repeatability proofs.
- Reuse that exact same fresh value on both signed-in `/account` hosts during one shared proof window.

## Required before-submit evidence

Capture on both hosts before submission:

- exact signed-in `/account` URL
- visible authenticated account context including `Lichess: and72nor`
- visible `Chess.com: not set yet` copy
- current continue/recent-submission context
- blank Chess.com input value before submit

## Required immediate post-submit evidence

After submitting the same fresh value on both hosts, capture on both hosts:

- exact post-submit `/account` URL
- retained Chess.com input value matching the fresh submitted username
- visible `Chess.com: not set yet` copy if it remains unchanged
- whether any success banner, validation error, or host-specific divergence appears
- surrounding continue/recent-submission context still visible on the page

## Required post-reload evidence

Reload signed-in `/account` on both hosts during the same proof window, then capture on both hosts:

- exact post-reload `/account` URL
- whether the Chess.com input falls back to blank again
- whether `Chess.com: not set yet` still remains visible
- whether the same continue/recent-submission context remains visible
- whether the post-reload state matches across both hosts

## Shared proof-window requirements

- one signed-in Google Chrome session on the Mac mini
- one shared UTC start time and one shared UTC end time
- both hosts checked in the same run
- all before-submit, immediate post-submit, and post-reload captures stored in one dedicated artifact folder

## Target verdict

End the smoke proof by stating whether both hosts again matched on:

- the immediate post-submit state, and
- the post-reload fallback state

If both match, explicitly state that the result extends the observed `/account` mutation round-trip repeatability behavior to a three-run streak.

## Explicit deferrals

This checklist explicitly defers:

- broader account-setting coverage beyond Chess.com username
- backend fixes or persistence debugging
- deployment work
- challenge-detail sweeps
- any mutation families outside signed-in `/account`

## Why this stays minimal

It reuses the already-proven signed-in `/account` flow, adds only one fresh narrow username, and asks one precise next confidence question: does the same immediate-submit plus post-reload parity behavior hold for a third fresh dual-host run in a row?
