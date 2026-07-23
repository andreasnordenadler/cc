# Signed-out Home visual gate — 2026-07-23

## Reference and reconciliation

- Sole product reference: shipped Android v338 (`0.1.338`, versionCode `338`) on the Android 15 `sqc_verify_35` emulator at 1080×2400. The installed release remains the immutable v338 package; Android runtime dispatch is `MobileShell` → `TodayDashboard` signed-out Home in `apps/mobile/App.tsx`.
- Audit state: G03 in `docs/FULL_WEB_ANDROID_PARITY_MATRIX_2026-07-13.md` on open documentation PR #27 required signed-out Home top/bottom evidence. The complete signed-out Home fits in one Android frame, so the attempted bottom scroll produced the same reachable content and no additional state.
- Fresh selection reconciliation: `origin/main` is `4b383fe1a43614e8a83b38618b161445143aab1c`; open product PR #84 is this lane, PR #27 is documentation-only, and PR #2 is stale/conflicted. No competing mainline or open-PR correction overlaps this evidence slice.
- Exact web candidate: PR #84 head `b714d0d9e1bb876a1393141c01b73a56fa93cbf5`, immutable preview `https://cc-a8oszdgat-andreas-nordenadlers-projects.vercel.app`. GitHub deployment 5565821591 reports that exact SHA and a successful Preview state.
- Production is healthy at `https://sidequestchess.com`, but Vercel currently identifies a production deployment from earlier PR #84 head `6ed6faa804771a477b8b619b0169f49837fa147d`, not `origin/main`. This evidence slice does not promote or alter production.

## DONE

- Closed screenshot manifest item G03 for the signed-out Home.
- Captured a fresh online Android-v338 Home after cold launch and a successful pull refresh removed the offline fallback notice.
- Captured the exact preview at 390×844 and 1440×900.
- Compared the real rendered hierarchy fail-closed: title, Coat of Arms and glow, `Sign in to continue.`, exact introduction copy, two browse actions, and the primary `Choose sign-in method` action all match Android v338.
- Confirmed the prior signed-out navigation correction remains intact: Home has no web-only guest menu, while the three Android Home capabilities remain reachable.

## VERIFIED

- Android screenshot: `/tmp/sqc-v338-g03-home-top.png`, 1080×2400, SHA-256 `9d57a71218c2c0447892263ad214e4927eb405f188599b5329a3510d88529ac4`.
- Android attempted bottom-state screenshot: `/tmp/sqc-v338-g03-home-bottom.png`, SHA-256 `10e39fe9aff235798a554018ef2129aee1ba86a48cc234f6f99d939f019c9a11`; accessibility hierarchy confirms no additional signed-out Home content.
- Exact-preview mobile screenshot: `/tmp/sqc-web-g03-home-top.png`, 390×844, SHA-256 `59c8b9e5c5054bfdcc66f939a0558001dac5c1167675ca40851e4215fd64fb28`. Full-page and viewport captures are byte-identical because the page is exactly one viewport high.
- Exact-preview desktop screenshot: `/tmp/sqc-web-g03-home-desktop.png`, 1440×900, SHA-256 `c3c93d48089c9ec1176361d5fe1ce675da3a6c345190267ecfa5174eb65378cb`.
- Mobile and desktop probes: HTTP 200; exact title/copy/action order and route targets; zero guest menus; zero console errors; zero page errors; zero horizontal overflow; no clipped introduction or controls.
- Exact-preview public browser regression suite: 19/19 desktop/mobile tests pass.
- Fresh visual inspection found no clipping, overlap, broken assets, unreadable contrast, or false platform affordances. Differences are limited to target-platform chrome and small proportional spacing/typography changes; the hierarchy and complete signed-out Home viewport are materially matched.
- No product code changed. Repository status was clean before this evidence record.

## NEXT

- Continue with the highest-value still-open unauthenticated or safely testable parity state after fresh current-main/open-PR reconciliation. Authenticated screenshot states remain fail-closed until a safe disposable identity exists.

## NEEDS USER INPUT

- None for G03. PR #84 remains draft because cumulative authenticated matched-state gates and Terms legal-adoption decisions are outside this evidence slice.
