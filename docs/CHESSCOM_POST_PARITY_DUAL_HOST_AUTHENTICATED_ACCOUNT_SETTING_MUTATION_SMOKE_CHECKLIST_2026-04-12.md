# Chess.com Post-Parity Dual-Host Authenticated Account-Setting Mutation Smoke Checklist, 2026-04-12

Date: 2026-04-12
Owner: Sam

## Exact signed-in URLs to reuse

- Canonical host account URL: `https://cc-andreas-nordenadlers-projects.vercel.app/account`
- Active deployment host account URL: `https://cc-taupe-kappa.vercel.app/account`

## Single narrow mutation to reuse on both hosts

Submit the Chess.com username field on `/account` with the same single test value on both hosts during the same run.

- Field: Chess.com username
- Shared mutation value: one fresh narrow test username string reused unchanged on both hosts
- Scope: only the Chess.com username setting on `/account`

## Required before-submit evidence

Capture on both hosts, while signed in:

- visible `/account` URL
- visible account surface proving authenticated state
- current Chess.com username field state before submit
- any nearby continue or recent-attempt context that still reflects the unresolved Chess.com username requirement

## Required submit evidence

Capture on both hosts:

- the exact submitted Chess.com username value
- confirmation that the same value is entered on both hosts
- one shared proof window covering both submissions in the same browser session

## Required after-submit evidence

Capture on both hosts immediately after submit:

- resulting `/account` URL
- resulting Chess.com username field or saved-value state
- any success, validation, or error message shown
- concise statement of whether both hosts converged to the same immediate post-submit state

## Required artifact conclusion

End the smoke artifact with:

- the shared proof-window timestamps
- the exact submitted value
- a concise authenticated account-setting mutation parity verdict for the two `/account` surfaces

## Explicit deferrals

This checklist intentionally defers:

- broader account-settings coverage beyond the Chess.com username field
- backend fixes or verifier rewrites
- deployment work
- any fresh challenge-detail mutation sweep
- any non-Chess.com account mutation

## Why this stays minimal

This is the narrowest executable follow-up after the existing authenticated `/account` plus `/challenges` plus eleven-route mutation proof chain because it touches one signed-in setting on one route family and asks only for before/after parity evidence.