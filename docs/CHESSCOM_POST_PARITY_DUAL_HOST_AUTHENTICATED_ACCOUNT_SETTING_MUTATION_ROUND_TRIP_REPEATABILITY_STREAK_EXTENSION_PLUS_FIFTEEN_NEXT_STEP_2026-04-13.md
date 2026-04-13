# Chess.com post-parity dual-host authenticated account-setting mutation round-trip repeatability streak extension plus fifteen next step

Date: 2026-04-13
Owner: Sam
Status: done

## What just finished

The current proof chain already includes a completed eighteen-run same-run dual-host authenticated `/account` Chess.com username-setting mutation round-trip repeatability streak extension smoke proof. That proof reused one signed-in browser context, one fresh narrow Chess.com username on both hosts, matching immediate post-submit retained-input state, and matching post-reload blank-input fallback state inside one shared proof window.

## Smallest next step

Run exactly one more fresh same-run signed-in dual-host `/account` Chess.com username-setting mutation round-trip repeatability recheck with one brand new narrow Chess.com username value on both hosts, and record it as the plus-fifteen extension smoke proof.

## Why this is still the tightest next confidence extension

- It extends the existing authenticated `/account` mutation plus round-trip plus repeatability-streak proof chain by only one additional run.
- It keeps the surface area fixed to the already-proven signed-in `/account` Chess.com username setting flow.
- It avoids introducing any broader scope, new route families, or backend assumptions.
- It converts the current eighteen-run streak into a nineteen-run streak with the smallest reviewable increment possible.

## Required scope

- Reuse the canonical host and active deployment host signed-in `/account` URLs.
- Use one brand new narrow Chess.com username value for both hosts during one shared proof window.
- Capture both immediate post-submit state and post-reload state on both hosts.
- End with a concise parity verdict for the nineteen-run streak extension check.

## Explicit deferrals

- No broader account-settings coverage.
- No backend fixes or product changes.
- No deployment work.
- No new challenge-detail sweeps.
- No verifier rewrites beyond the minimal artifact needed for the next smoke proof.
