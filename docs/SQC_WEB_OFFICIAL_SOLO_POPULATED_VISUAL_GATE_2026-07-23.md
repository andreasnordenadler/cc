# Web Official Solo populated catalog visual gate — 2026-07-23

## Reference and reconciliation

- Sole reference: shipped Android v338 (`0.1.338`, versionCode `338`) on the Android 15 `sqc_verify_35` emulator at 1080×2400. Package identity was read from the installed APK immediately before capture.
- Runtime dispatcher: `ActiveScreen` sends `sideQuests` to the reachable `QuestBoardDashboard`; the signed-out `Browse Solo Side Quests` action opened that runtime surface. Dormant `SideQuestsScreen` was not used as evidence.
- Compared state: signed-out, online, populated Official Solo catalog at the initial scroll position. This closes only screenshot manifest item `S01` for the populated signed-out state; empty, loading/error, signed-in Active/Completed, and mutation states remain separate.
- Fresh reconciliation: `origin/main` is `4b383fe1a43614e8a83b38618b161445143aab1c`. Open PR #84 is this lane; PR #27 is the stale source-only audit; PR #2 is unrelated/stale. No competing open or newly merged Official Solo catalog correction exists.
- Exact preview: `https://cc-cjh0mmfb3-andreas-nordenadlers-projects.vercel.app`, GitHub deployment `5565287244`, source `dd1028d534670a33d0f5c4bba0fd312d989d8ac5`.

## DONE

- Re-audited the shipped Android runtime rather than relying on the July 13 source-only matrix.
- Confirmed the current web catalog already matches the reference’s 13-row canonical order, difficulty-first lifecycle ordering, coat/glow rows, per-row like affordances, Official/Community switch, close action, and populated count.
- No product-code change was justified: the ranked ordering and row-action gaps from the original audit were already fixed on this branch. This bounded slice closes stale visual evidence instead of introducing a token redesign.

## VERIFIED

- Android v338 navigation was exercised from signed-out Home through the real `Browse Solo Side Quests` action.
- Android capture: `/tmp/sqc-g05-android-solo.png`, 1080×2400, SHA-256 `381ca0eda83599f802c1f6cfd2db9602764c6a6c6e79e869c59072a12c23b85e`.
- Exact-preview mobile capture: `/tmp/sqc-s01-preview-mobile.png`, 390×844 CSS viewport, SHA-256 `1d000351b31fbc61d4bb2c69af0626feefc3fd5de375ed6d7f9b15fe6fb26f6c`.
- Exact-preview desktop capture: `/tmp/sqc-s01-preview-desktop.png`, 1440×900 CSS viewport, SHA-256 `ef0ed7e3abaa17a57b28ddb9fd692c9705869f1fdb261517441f19e33d893974`.
- Fresh browser matrix at both widths: HTTP 200; 13 rows in exact Android order; 13 like controls; real close link and catalog navigation; zero horizontal overflow; zero console or page errors.
- Measured mobile geometry: close control `44×44` at `(330,60)` and catalog switch `370×54` at `(10,244)`, both fully inside the 390px viewport.
- Fail-closed visual review found no clipped title/status, overlapping like control, white-mask blob, broken crest, unreadable row, or displaced close control. The web preserves the same compact catalog hierarchy while using browser-appropriate scrolling and navigation.

## NEXT

- Continue with the highest-ranked still-open equivalent-state visual gate after fresh main/open-PR reconciliation. Authenticated states remain fail-closed until a safe disposable identity is available.

## NEEDS USER INPUT

- None for this slice. PR #84 remains draft because its cumulative authenticated matched-state and Terms legal-adoption blockers are not resolved by this public catalog proof.
