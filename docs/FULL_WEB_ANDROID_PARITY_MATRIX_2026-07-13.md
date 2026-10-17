# Full Web ↔ Android v338 Parity Matrix — 2026-07-13

## Audit contract

- **Authoritative product reference:** Android v338, implemented by `apps/mobile/App.tsx` and its mobile API client.
- **Comparison target:** the Next.js application under `src/app`, principally the shared web surface in `src/components/mobile-app-web-shell.tsx`.
- **Evidence cutoff:** commit `4301456d` (`origin/main`) on 2026-07-13, branch `audit/full-web-app-parity`.
- **Scope:** every reachable Android screen, full-screen modal, overlay, material state, user action, and recurring visual primitive; every Next.js page route and redirect/alias.
- **Method:** source inspection only. No Android-v338 emulator captures or same-account web captures were produced during this audit. Existing screenshots are **not** treated as proof here because they were not re-opened and paired state-for-state against v338.
- **Consequent visual verdict:** visual rows are source-backed hypotheses. Anything requiring rendered geometry, font metrics, browser/native controls, safe areas, scroll position, animation, or exact pixels is marked **UNVERIFIED** until the screenshot manifest near the end is captured.

## Status vocabulary

| Label | Meaning |
| --- | --- |
| **REAL** | Wired to current account/catalog/API data and a real mutation or navigation. |
| **STATIC** | Real rendered information, but the depicted control/state is read-only or presentation-only. |
| **FAKE** | A control or value looks live but is hard-coded, inert, or materially misleading. |
| **MISSING** | No web equivalent for a reference state/action/surface. |
| **DIFFERENT** | Both exist, but contract, behavior, information architecture, or visual primitive differs. |
| **UNVERIFIED** | Source suggests coverage, but runtime/screenshot proof is absent. |

A row may carry multiple labels, for example `REAL data / DIFFERENT actions / UNVERIFIED visual`.

---

# 1. Authoritative Android navigation and state model

## 1.1 Reachable shell

| Android surface/state | Android evidence | Data source | Controls/actions | Visual primitives | Web mapping | Verdict / gap |
| --- | --- | --- | --- | --- | --- | --- |
| App auth provider boundary | `App`, `ClerkMobileShell`, `MobileShell` (`App.tsx:1377-1511`) | Clerk native auth; signed-out fallback bridge | Google, Facebook, password sign-in/sign-up, email verification | Safe-area provider; native auth error alerts | Clerk `/sign-in`, `/sign-up`; `MobileAppWebShell`; `src/app/sign-in/...:1-37`, `sign-up/...:1-37` | **REAL / DIFFERENT.** Web uses hosted Clerk UI, not native provider/password panel; no same-state screenshot. |
| Global initial loading | `MobileShell` (`1518-1564`, `1722-1727`) | `fetchMobileBootstrap`; account fallback | Pull-to-refresh remains available | Spinner + “Loading the live quest board...” card | Server-rendered routes; no equivalent route-level loading UI found | **MISSING** explicit web loading surface. |
| Offline catalog fallback | `MobileShell` (`1528-1563`, `1729-1734`) | `OFFLINE_MOBILE_BOOTSTRAP` after bootstrap failure | Pull to retry | Offline banner over saved fallback board | Web server render/error handling; no saved fallback board/banner | **MISSING functional contradiction.** |
| Global refresh | `MobileShell` (`1577-1600`, `1712-1717`) | Bootstrap + account APIs; Home additionally executes proof check | Native pull-to-refresh | `RefreshControl`, gold tint | Home refresh icon posts `checkActiveChallenge` (`active-solo-actions.tsx:1-19`); other pages reload normally | **DIFFERENT.** No global pull refresh; Home behavior is real but narrower UI. |
| Android hardware back | `MobileShell` (`1621-1633`) | Local shell state | Back from any non-Home tab returns Home | Native platform behavior | Browser history and close links | **DIFFERENT**, platform-appropriate but must be UX-tested. |
| Close non-Home screen | `FixedScreenCloseButton` (`1767-1773`, `1783-1790`) | Local navigation state | Close → Home | Fixed circular X over content | `MobileAppWebShell` close link (`234-238`) | **REAL / UNVERIFIED visual.** |
| Signed-in hamburger menu | `GlobalHamburgerMenu` (`1794-1845`) | Authenticated account + shell state | Home; Solo; Multiplayer; Trophy; My Custom; create Custom; create Multiplayer; Account; Support | Native modal overlay, icon rows, active state | `<details>` menu + same product routes, plus Privacy (`mobile-app-web-shell.tsx:123-134`, `191-210`) | **REAL / DIFFERENT.** Web adds Privacy; browser `<details>` behavior and modal geometry unverified. |
| Signed-out navigation | Android has no hamburger; guest Home buttons and five destination shell tabs are available by app flow | Auth state | Browse Solo/Multiplayer; choose sign-in | Centered guest coat and CTA panel | Guest menu adds Home, Solo, Multiplayer, Support, Privacy, Sign in (`264-282`) | **DIFFERENT.** Web exposes Support/Privacy more directly. |
| Primary tab definition | `TABS` (`1370-1375`); `ActiveScreen` (`6478-6537`) | Shell state | Home, Side Quests, Multiplayer, Trophy Cabinet, Account; `officialLeaderboards` is reachable programmatically | Image/vector icon definitions | Route-based shell with same five active-tab identities | **REAL IA mapping.** `BottomNav` exists at `6445-6477` but is not rendered by `MobileShell` at `1705-1778`; it is dormant in v338 and is not a parity requirement for current reachability. |
| Scroll hints | `ScrollHintOverlay`, `ScrollHintedScrollView` (`1849-1890`) and repeated pull hints | Local scroll metrics | Scroll only | Up/down edge hints | CSS page scrolling; selected “Pull down” copy exists on Home despite no browser pull handler | **FAKE/DIFFERENT on web:** Home says “Pull down to refresh” (`mobile-app-web-shell.tsx:366-369`, `427-430`) but browser page does not install a pull-to-refresh action. |
| Global background | `GradientBackdrop`, watermark (`1705-1711`, `6369-6399`) | Active challenge badge colors | None | Multi-layer linear gradients, active badge color glow, SQC watermark | CSS variables from `getMobileWebTheme` (`mobile-app-web-shell.tsx:168-189`) | **LIKELY DIFFERENT / UNVERIFIED** exact color stops, watermark, viewport, and safe area. |

## 1.2 Runtime screen dispatch (what v338 actually renders)

`ActiveScreen` (`apps/mobile/App.tsx:6478-6537`) is decisive:

| Tab | Reachable Android component | Web canonical route/component |
| --- | --- | --- |
| Home | `TodayDashboard` (`1929-2477`) | `/` → `MobileAppWebShell` → `SignedInHome` or `GuestHome` |
| Side Quests | `QuestBoardDashboard` (`4530-5770`) | `/side-quests`, `/community-side-quests`, `/custom-side-quests`, `/create-custom-side-quest`, `/challenges/[id]`, `/challenges/community/[id]` |
| Multiplayer Side Quests | `MultiplayerSideQuestsScreen` (`7187-8158`) | `/multiplayer`, `/multiplayer-side-quests`, `/groupquests/[id]`, `/create-multiplayer-side-quest` |
| Official Leaderboards | `OfficialMultiplayerLeaderboardsScreen` (`8159-8310`) | Folded into `/multiplayer`; aliases `/official-leaderboards`, `/leaderboards`, `/scoreboard` redirect there |
| Trophy Cabinet | `CoatBoardDashboard` (`5774-5893`) | `/trophy-cabinet` → `MobileTrophyCabinetScreen` |
| Account | `AccountTrackerDashboard` (`5909-6054`) | `/account`; partial duplicate editor at `/settings` |

### Dormant Android implementations (not current v338 route truth)

These functions are inventoried to prevent false claims, but are not dispatched by `ActiveScreen`: `HomeScreen` (`6238-6367`), `SideQuestsScreen` (`6539-7185`), `AccountShell` (`9282-9456`), and `CoatOfArmsScreen` (`9457-9552`). Their existence does **not** establish current Android behavior. Web code that resembles these dormant screens is not sufficient parity with the reachable components above.

---

# 2. Complete screen/state parity matrix

## 2.1 Home / Today

| Reference screen/state | Android source | Android data/actions | Android visual surface | Web route/component/data | Verdict and exact gap |
| --- | --- | --- | --- | --- | --- |
| Signed-out Home | `TodayDashboard:2147-2174` | Account absent; browse Solo/Multiplayer; Account sign-in | Centered title, glowing coat, centered panel, two secondary buttons + primary sign-in | `/`; `GuestHome:285-305`, Clerk auth | **REAL / close source match / UNVERIFIED visual.** |
| Signed-in identity header | `2176-2193` | Profile/avatar, Lichess/Chess.com; open Account | Inline identity + avatar dot | Shell header `213-225` | **REAL / UNVERIFIED visual.** |
| Missing chess account blocker | `2195-2200` | Navigate Account | Strong blocker panel | `SignedInHome:330-335` | **REAL / likely match / UNVERIFIED.** |
| Active Solo: none | `2234-2250` | Explore Solo | Generic coat/glow, empty hero, CTA | `SignedInHome:352-364` | **REAL / DIFFERENT microcopy/layout / UNVERIFIED.** |
| Active Solo: pending/no game | `2202-2233`; `ActiveQuestNoGameSummary:323-338` | Refresh executes check; open detail; explore | Badge/glow, active pill, mini starting board, goal/picked/latest/status | `/` from metadata; `ActiveSoloDetail:435-453`; refresh action | **REAL.** Web has board and refresh; exact pending copy/geometry unverified. |
| Active Solo: failed | `2202-2233`; `ActiveQuestFailureSummary:366-383`; diagnostic mini board | Check again; open detail | Failure board/FEN, highlighted move, danger summary | `/` maps failure diagnostic in `page.tsx:70-80` and `ActiveSoloDetail` | **REAL data / UNVERIFIED visual.** |
| Active Solo: passed/completed | `2208-2233`; mini proof board and completed seal | Explore next; open proof when synced | Completed red seal, result board, good status | `/` shows completed status; detail route shows result state | **PARTIAL.** Home web does not expose a direct “View victory proof” action; receipt route depends on trophy row. |
| Refresh busy/error/success | `1969-1975`, `2080-2100`, `2222-2227` | Real mobile quest action | Spinning refresh, inline success/error | `ActiveSoloActions` only exposes pending spinner; server-action redirect/error handling not inline | **DIFFERENT / MISSING inline error and success states.** |
| Current Solo full-screen detail | `CurrentSideQuestDetailModal:3147-3329` | Check, like, view proof, switch; enlarge coat; menu | Full-screen gradient modal; proof steps; conditions; board; proof/failure panels; coat lightbox | `/challenges/[id]` (`page.tsx:100-240`) | **PARTIAL.** Read surface close; web action buttons at lines 154-155 link to `/account` instead of checking/starting. Like count at 125-128 is read-only. No coat lightbox. |
| Completion celebration | `CompletionCelebrationOverlay:3351-3400` | Auto-opens after newly completed Solo/Multiplayer proof; vibrates | Full-screen translucent glow, particles, coat, red seal | No web completion overlay found | **MISSING high-visibility success state.** |
| Active Multiplayer: empty | `2295-2323` | Open Multiplayer | Multiplayer seal hero + empty row | `SignedInHome:371-395` | **REAL / UNVERIFIED visual.** |
| Active Multiplayer: populated | `2295-2323` | Open first/detail; expand >5 | Hosted/joined badges, rows, show-all | Home web receives `buildActiveMultiplayerHomeRows`; displays all supplied rows | **REAL / DIFFERENT pagination.** Web server helper/bounds must be verified; no explicit show-all interaction. |
| Home opened Multiplayer detail | `JoinedMultiplayerQuestModal:2479-3104` | Full joined/public/owner/finished action set | See Multiplayer detail section below | `/groupquests/[id]` | **MAJOR PARTIAL.** Public summary only on web. |
| Trophy preview: empty | `2388-2441` | Explore Solo / open cabinet | Trophy hero, empty row | `SignedInHome:397-425` | **REAL / UNVERIFIED.** |
| Trophy preview: populated and >5 | `1997-2001`, `2400-2433` | Open proof/trophy; expand/collapse | Mixed Solo coats and Multiplayer podium seals | Home uses max 5 from `getMobileWebTrophyRows` | **PARTIAL.** No show-all inline state, but route exists. |
| Completed Solo proof modal from Home | `2448-2467`; `CompletedQuestProofCard:8973-9111` | Share, open/copy link, details, reset | Victory receipt, coat/glow/seal, board/details | `/proof/[token]` and trophy links | **PARTIAL.** Public receipt exists; account-owned control equivalence and reset entry are not co-located. |

## 2.2 Solo Official catalog and detail

| Reference screen/state | Android evidence | Data/actions | Visuals | Web mapping | Verdict / gap |
| --- | --- | --- | --- | --- | --- |
| Official/Community tab deck | `QuestBoardDashboard:5072-5123` | Toggle local tabs | Emblem, two colored tabs, center swap icon | Separate `/side-quests` and `/community-side-quests`; tab links at `mobile-app-web-shell.tsx:509-515`, `800-808` | **REAL / DIFFERENT navigation state; UNVERIFIED visual.** |
| Official populated catalog | `5123-5168` | Open available/active/completed; like/unlike | Difficulty/status pills, coat/glow, red completed overlay, inline like button | `/side-quests`; `MobileSoloSideQuestsScreen:478-539` | **PARTIAL.** Data/status is real. Web catalog “like” is display-only because `AppRow` wraps the whole row in a link and `MobileRowLikeSummary` is a non-interactive span (`1402-1459`). |
| Official empty | Structurally possible when bootstrap has zero challenges; no dedicated copy in mapped branch | None | Empty section | CHALLENGES is static server catalog and expected populated | **UNVERIFIED / no explicit web empty state.** |
| Official sorting | Android difficulty → active/available/completed → reward/title (`4580-4605`) | Implicit ordering | Rows | Web active → completion → difficulty → reward/title (`489-500`) | **DIFFERENT:** Android sorts difficulty before active/completion rank, so active Hard may appear after available Easy; web always puts active first. |
| Available official detail | `SelectedQuestDetailCard:8414-8616` and detail modal `5703-5715` | Start; sign-in prompt; share context; view conditions | Coat/card, difficulty, conditions, proof workflow | `/challenges/[id]` | **FUNCTIONAL CONTRADICTION.** Signed-in web “Start this Side Quest” links to `/account` (`challenges/[id]:207-209`) rather than invoking `startChallenge`; Android calls real `runMobileQuestAction("start")`. |
| Active official detail | `CurrentSideQuestDetailModal:3147-3329` | Real check, like, proof, switch, deactivate/reset via related surfaces | Full-screen modal and state-specific boards | `/challenges/[id]` | **FUNCTIONAL CONTRADICTION.** Web’s visible “Check my latest game” links to Account (`154-155`); only Home refresh actually checks. |
| Completed official detail/proof | `CompletedQuestProofCard:8973-9111` | Details alert, share/open/copy proof, reset | Victory scroll, verified seal, receipt metadata | `/proof/[token]`, `/trophy-cabinet`; `ProofImage` | **PARTIAL / DIFFERENT.** Public receipt is real; no evidence of a single authenticated web screen containing the Android reset/share/detail set. |
| Proof pending | `ActiveQuestNoGameSummary`, current detail | Check latest | Starting board + next step | `/challenges/[id]` | **STATIC/PARTIAL.** State shown, action redirected elsewhere. |
| Proof failure diagnostic | `FailureDiagnosticBoard:384-453`; current detail lines `3272-3276` | Re-check | Exact failure FEN/move/reason | Web mini board maps failure FEN/UCI (`challenges/[id]:81-87`, `160-174`) | **REAL data / PARTIAL detail copy / UNVERIFIED pixels.** |
| Proof success and victory board | `VictoryProofBoard:454+`; `3271`, `3276` | View receipt | Final board, accepted proof | Web board + public proof | **PARTIAL / UNVERIFIED.** |
| Like signed-out/error/busy | Android alerts and busy state (`4946-4962`) | Real mutation | thumb icon/count, selected tone | Official web count only | **MISSING official Solo like action on catalog/detail.** |

## 2.3 Community Solo and My Custom Side Quests

| Reference screen/state | Android evidence | Data/actions | Visuals | Web mapping | Verdict / gap |
| --- | --- | --- | --- | --- | --- |
| Community Discover intro | `QuestBoardDashboard:5116-5121`, community branch `5169-5310` | Switch Discover/My Library | Community intro panel | `/community-side-quests`; `MobileCommunitySideQuestsScreen:786-830` | **REAL / DIFFERENT copy.** Web explicitly tells users to use website for “full tavern-wall browse”, contradicting full app parity positioning. |
| Community search/filter/sort | State `4615-4620`; filtering `4654-4674` | Search; All/Popular/New/Completed; Popular/Liked/Newest/A-Z; creator shelf; load more 10 | Search shell, chips, compact sort, result counts | `CommunitySoloCatalog:31-60` | **PARTIAL.** Web only All/Completed and Newest/Name; **MISSING Popular, New, Liked, A-Z label, creator shelf/filter**, and uses page size 12 not 10. |
| Community empty | Community branch and no-result logic | Clear/change filters | Dedicated empty panel | Web no-results panel `catalog-clients.tsx:55-58` | **REAL / copy differs / UNVERIFIED.** |
| Community populated cards | `AppRow` + likes/stats/source | Open, like | Crest/status/source/like | Web `CatalogRow` omits images and likes (`catalog-clients.tsx:18-29`) | **DIFFERENT visual/information hierarchy.** |
| Community detail, signed out | `CustomSideQuestDetailModal:8617-8971` | Sign in; share; creator shelf | Full-screen custom crest, rules, visibility, stats, creator | `/challenges/community/[id]`; `MobileCommunitySideQuestDetailScreen:832-917` | **PARTIAL.** Core info exists. |
| Community detail, signed in non-owner | Same | Start, check if active, like/unlike, share, report, creator shelf, use in Multiplayer | State-specific action cards | Web has pick, like/report, share, creator; no “Use in Multiplayer” preselection | **PARTIAL; MISSING use-in-Multiplayer.** |
| Community report | `openCommunityReport` (`4916-4926`) → `HelpSupportModal` | Pre-filled account support message | Support full-screen modal | Inline report textarea posts `/api/support` (`community-solo-social-actions.tsx:32-49`) | **REAL / DIFFERENT UX.** |
| My Library tabs/filters | `communityView="mine"`, `customLibraryFilter` (`4621`, `4675-4684`) | All/Published/Drafts/Public/Archived; search; recent order | Same deck, custom crest rows | `/custom-side-quests`; `CustomSoloCatalog:63-80` | **REAL and close.** Web adds Name sort; runtime visuals unverified. |
| My Library empty/populated | community branch `5170+` | Create/open | Empty create card or rows | `MobileCustomSideQuestsScreen:919-962` | **REAL / UNVERIFIED.** |
| Custom detail owner | `CustomSideQuestDetailModal:8617-8971` | Edit, duplicate, publish, public/private, archive, delete, start, check/submit/deactivate, use Multiplayer | Full-screen status/visibility/rules/stats/proof | Web library rows link to `/create-custom-side-quest` for all custom entries (`custom-side-quests/page.tsx:45-57`) | **MISSING/CONTRADICTORY.** There is no per-custom-quest owner detail route/state; row navigation loses identity and cannot edit/manage the selected quest. |
| Custom detail active proof | `8868-8902` | Check latest, submit exact game/link, deactivate, view result | Proof action card with busy/success/error | No equivalent selected-custom detail route | **MISSING.** |
| Custom detail completed | `statusLabel`, View result | Open result | Completed metadata | Trophy/public proof may show receipt | **PARTIAL but no custom management context.** |

## 2.4 Custom creation/editing

| Reference state/action | Android evidence | Web mapping | Verdict / contradiction |
| --- | --- | --- | --- |
| Builder open/create/edit | `QuestBoardDashboard:4611-4709`, modal `5388-5701`; menu intents `5015-5042` | `/create-custom-side-quest` → `MobileCustomCreateForm` | **PARTIAL create / MISSING edit.** |
| Unsaved close/discard | `4764-4801` | Browser navigation only; no dirty-state confirmation found | **MISSING.** |
| Templates | `CUSTOM_QUEST_TEMPLATES`; apply at `4752-4762` | Four simplified templates (`mobile-custom-create-form.tsx:6-11`) | **DIFFERENT template set/semantics.** |
| Name and Coat preview | Android name + generated crest preview | Web name; no live coat preview | **MISSING visual preview.** |
| Rule logic | All conditions / any one (`4630`, builder UI) | Not exposed | **MISSING.** |
| Up to six conditions | Add/edit/duplicate/delete (`4823-4865`), capped 6 | Single supported template payload | **MISSING major capability.** |
| Condition types | Piece state/captured/on square/move sequence/opening sequence/game result (builder `6995-7135` in dormant duplicate; reachable builder mirrors this in `5388-5701`) | Template selector only | **MISSING major capability.** |
| Piece/owner/identity/quantity | Android piece cards, exact starting piece identity, owner, counts | Not exposed | **MISSING.** |
| Timing/move number | By/at/after/end timing and numeric move | Not exposed | **MISSING.** |
| Square/move/opening inputs | Validated exact inputs | Not exposed | **MISSING.** |
| Negation | True vs must-not-happen | Not exposed | **MISSING.** |
| Validation errors | Native validation alerts (`4823-4845`) | Payload validation error paragraph | **REAL but much narrower.** |
| Draft/published | Save draft or publish | Draft/Ready select | **REAL.** |
| Private/public | Android reachable builder supports private/public; drafts private | Web private/public buttons | **REAL.** |
| Signed-out local drafts | Android stores up to six in component state and explains sign-in (`4881-4893`) | Web refuses create with “Sign in to create” | **FUNCTIONAL CONTRADICTION.** |
| Persisted create | `saveMobileCustomSideQuest` | POST `/api/mobile/custom-quests` | **REAL.** |
| Edit existing rule/name | `openCustomEditor(quest)` and save by id | No selected-id edit path | **MISSING.** |
| Owner lifecycle/manage | Publish/private/public/archive/delete/duplicate | No selected owner detail | **MISSING.** |

## 2.5 Multiplayer catalog, create, detail, proof, and results

| Reference screen/state | Android evidence | Data/actions/visual | Web mapping | Verdict / gap |
| --- | --- | --- | --- | --- |
| Official/Community tabs | `MultiplayerSideQuestsScreen:7560-7596` | Local switch; emblem + swap tabs | `/multiplayer` defaults official; `/multiplayer-side-quests?tab=community` | **REAL / route-based difference / UNVERIFIED visual.** |
| Official open list populated | `7697-7714` | Real official rows; join/open/like | `/multiplayer`; `OfficialMultiplayerPanel:1013-1052` | **PARTIAL.** Web like display is non-interactive. |
| Official open list empty | `7710-7712` | Empty copy | Web `1046-1050` | **REAL / copy differs.** |
| Latest finished official set | `7716-7729`, `OfficialResultCard:3893-3933` | Open final result; podium seals | Web `1054-1069`, `1099-1124` | **REAL summary / detail route limitations below.** |
| Earlier official week archive | `7211`; modal `7638-7695`; list `7731-7753` | Select week; full-screen results | Web earlier rows link to generated href; aliases remain `/multiplayer` | **PARTIAL / UNVERIFIED route destination and detail content.** |
| Community signed-out browse | `7758+`, filters omit private/mine | Public rows inspectable | Web Community panel and catalog | **REAL.** |
| Active mine empty/populated | `7762-7783` | Hosted/joined rows, incremental +4 | Web `CommunityMultiplayerCatalog:93-96` | **REAL / DIFFERENT pagination (web shows all).** |
| Finished mine empty/populated | `7785-7800` | Recent result rows, +3 | Web same broad state | **REAL / DIFFERENT pagination.** |
| Community discovery search/filter/sort | State `7216-7219`; UI `7802-7857` | Search; Open/All/Joined/Hosted/Finished; Closing/Liked/Newest/Players; host shelf; +4 | `CommunityMultiplayerCatalog:83-108` | **PARTIAL. MISSING Liked sort, Players sort, host shelf; web adds Name sort.** |
| Create fast action | `7860-7867` | Open full modal | `/create-multiplayer-side-quest` | **REAL.** |
| Join private code | `7869-7882`; `joinByInviteKey` | Lookup + immediate join; busy/error/success | `GroupQuestInviteKeyJoin` | **REAL.** Web redirect target for signed-out uses legacy `/groupquests?...`, which then redirects to `/multiplayer` and may lose invite intent; requires runtime proof. |
| Create: name/intro/access/provider/dates/duration | `7885-7967` | Real form; native option cards/date controls | `MobileMultiplayerCreateForm:37-47` | **REAL / DIFFERENT controls.** Web uses raw select/datetime-local; Android uses cards/native pickers. |
| Create advanced rules | Time, rated, color | Web details/selects | **REAL but allowed option sets may differ; test exact payload.** |
| Create quest picker | `7970-8098` | Up to 4; selected deck; clear; Browse/Selected; Official/Community source; search; paged list | Web single combined list, max 4, search | **PARTIAL. MISSING source tabs, selected-only view, clear-all, pagination, source badges/community catalog inclusion proof.** Web `/create-multiplayer-side-quest` passes only `CHALLENGES` (`page.tsx:5, 8-43`), so **Community/custom quests are absent**. |
| Create validation/loading/error/success | `createGroupQuest:7356+`, footer `8100-8109` | Inline errors, disabled/loading, opens result | Web inline error/loading + redirect | **REAL / success visual differs.** |
| Public detail, not joined | `JoinedMultiplayerQuestModal` mode public | Join, share/copy, like, host shelf, report, quest rules, leaderboard, timing | `/groupquests/[id]`; `MobileMultiplayerDetailScreen:1275-1368` | **PARTIAL.** Join is real; **MISSING share/copy, like action, report, host shelf action, leaderboard**, and detail always labels status `OPEN` (`1292`) regardless of lifecycle. |
| Joined active detail | Same, mode joined; proof mode | Check latest, pull refresh, leave; completed/verified tiles; per-quest rules; leaderboard | Same route | **MISSING core joined command center.** Web join state only links back to `joinState.href`; no refresh/proof/leave/leaderboard UI. APIs exist but are orphaned from this component. |
| Owner active detail/edit | `2911-3020` | Edit name/intro/access/provider/window/duration/quest set; save; invite code; remove player | Same route | **MISSING owner UI.** PATCH/remove APIs exist, but no rendered owner controls here. |
| Private owner invite | `2916-2945` | View/copy code and link | No owner detail UI | **MISSING.** |
| Finished joined result | `2713-2755`, `3035-3038` | Final rank/seal/reward, final leaderboard, share/copy final | Web detail hardcodes OPEN | **FUNCTIONAL/VISUAL CONTRADICTION.** Finished receipt cannot be represented faithfully. |
| Finished public result | Same public mode | Frozen winner/leaderboard; no join | Web join-state helper may suppress join, but hero still says OPEN and no final board | **CONTRADICTORY/PARTIAL.** |
| Owner finished archive | `2911-2928` | Locked controls; invite code; share/review | No owner archive UI | **MISSING.** |
| Nested per-quest rule detail | `3050-3101` | Open each included quest; what counts + Multiplayer proof rules | Web plain condition rows (`1340-1354`) | **MISSING nested detail.** |
| Leaderboard rows | `MultiplayerLeaderboardRow:3107-3145` | Rank seal, provider, progress bar, note | No leaderboard on detail | **MISSING.** |
| Official Leaderboards screen | `OfficialMultiplayerLeaderboardsScreen:8159-8310` | Select official quest/result; current + weekly/archive contexts | Redirected/folded into `/multiplayer` | **PARTIAL IA; MISSING dedicated state/detail equivalence.** |

## 2.6 Trophy Cabinet / badges / leaderboards

| Reference state | Android evidence | Web mapping | Verdict / gap |
| --- | --- | --- | --- |
| Signed-out cabinet | `CoatBoardDashboard:5774-5893` handles absent account | `/trophy-cabinet`, empty summary and locked official grid | **PARTIAL / screenshot required.** |
| Empty signed-in cabinet | Same; empty official/community sections | `MobileTrophyCabinetScreen:693-784` | **REAL.** |
| Official Multiplayer trophies | Android prioritizes official trophies, seal status; tap shows contextual alert | Web rows with links/status seals | **REAL list / DIFFERENT detail action.** |
| Community Multiplayer trophies | Separate less-prominent section (`5818-5870`) | Web `multiplayerRows` groups all source=`multiplayer` under “Official Multiplayer trophies” (`706`, `730-741`) | **FUNCTIONAL LABEL CONTRADICTION.** Community Multiplayer rewards can be mislabeled Official. |
| Solo/custom coats | Android mixed unlocked list; completed proof opens | Web solo rows + official collection grid | **REAL data / DIFFERENT grouping.** |
| Locked official coat previews | Android `CoatOfArmsScreen` is dormant, but reachable `CoatBoardDashboard` includes cabinet data; exact locked treatment needs capture | Web locked preview grid | **UNVERIFIED against reachable Android cabinet.** |
| Badge meaning/heraldry | `BadgeMeaningCard:9521-9551` is in dormant `CoatOfArmsScreen`, not current dispatch | No matching web meaning cards in `MobileTrophyCabinetScreen` | **Not a current v338 requirement unless another route invokes it; do not claim gap from dormant code.** |
| Podium count on Account | Android computes actual `multiplayerTrophies.length` (`6138-6157`) | Web hard-codes Podiums `0`, custom tries/wins `0`, multiplayer trophies `0` (`account/page.tsx:162-172`) | **FAKE / critical user-visible contradiction.** |

## 2.7 Account, connect/profile/settings, auth, support, legal

| Reference state/surface | Android evidence | Web mapping | Verdict / gap |
| --- | --- | --- | --- |
| Account signed out | `AccountTrackerDashboard:5917-5939` | `/account` signed-out `241-251` | **PARTIAL.** Web omits direct Google/Facebook/password choices on Account and routes to Clerk. |
| Google/Facebook auth | `5926-5933`, bridge `1400-1426` | Clerk `/sign-in` | **REAL provider auth / DIFFERENT UI.** |
| Password sign-in/create/verification | `PasswordAuthPanel:9778-9891` | Clerk components | **REAL underlying auth / DIFFERENT state presentation.** |
| Auth error/incomplete states | Native alerts `1415-1422`; password inline state | Hosted Clerk errors | **UNVERIFIED same semantic coverage.** |
| Account identity/readiness | `5981-6007` | `/account:110-136` | **REAL / close / UNVERIFIED visual.** |
| Your Side Quests | `AccountSoloSideQuestSection:6056-6136` | `/account:138-160` | **PARTIAL.** Web Multiplayer row does not show actual hosted/joined count/title; custom preview rows absent. |
| Progress/stats | `6138-6159` | `/account:162-173` | **FAKE web values** for podiums, custom tries/wins, trophies. Completed/proof counts real. |
| Chess strength | `ChessStrengthCard:9553-9599` | `/account:175-185` | **REAL.** Error/updated-at detail differs. |
| Trophy preview | `AccountTrophyList:6162-6199` | `/account:187-209` | **REAL list; labels/detail differ.** |
| Profile/display/bio/chess usernames | `ChessUsernameEditor:9661-9776`; API update | `/account` and `/settings`, server action `saveRunnerProfile` | **REAL.** Web duplicates settings surface; browser control visuals differ. |
| Missing username focus chips | Android chips scroll/focus correct provider (`5944-5949`) | Hash links to inputs | **REAL equivalent intent / runtime focus unverified.** |
| Log out | `5951-5959`, `6049-6051` | `AccountLogoutButton` | **REAL.** |
| Delete account collapsed/confirm/busy/success/error | `5914-5916`, `5961-5976`, `6015-6047` | `DeleteAccountControl` | **REAL API surface; same-state screenshots and exact confirmation semantics required.** |
| Settings | Android has no separate primary settings screen; Account editor is canonical | `/settings` duplicates editor | **DIFFERENT IA, not missing.** |
| Connect/Profile aliases | Android Account owns both | `/connect`, `/profile`, `/my-account` map to Account | **REAL alias coverage.** |
| Support modal signed out | `HelpSupportModal:3651-3807` | `/support`; `MobileSupportScreen:602-691` | **REAL / route vs modal difference.** |
| Support quick answers/topics | `3723-3751` | Web same five topics | **REAL, copy close.** |
| Diagnostics collapsed/expanded/copy | `3728-3743`, `3800-3802` | Web `<details>` has generic guidance; `MobileSupportComposer:80-88, 119, 125-132` copies URL/user-agent diagnostics | **REAL copy action / DIFFERENT packet.** Web omits Android candidate version, package/versionCode, API base, chess usernames, active Solo, and active Multiplayer context. |
| Support thread empty/populated/admin/user | `3657-3658`, `3772-3781` | `MobileSupportComposer` receives real support messages | **REAL / screenshots needed.** |
| Support validation/busy/success/error | `3665-3690`, `3783-3799` | POST `/api/support` composer | **REAL / exact errors unverified.** |
| Legal links | Android opens web `/privacy`, `/support`, `/terms` | Web routes; `/terms` redirects back to `/support` | **PARTIAL.** “Terms of Use” has no standalone terms content; the link loops to Support. |
| Privacy | External browser from Android | `/privacy` full current policy | **REAL web-only legal surface.** |
| Account support/report entry | Android modal from menu and Account | Web menu/Account route | **REAL.** |

---

# 3. Action parity ledger

This table prioritizes whether a visible action actually mutates or navigates correctly, independent of appearance.

| Action | Android | Web | Classification |
| --- | --- | --- | --- |
| Browse official Solo | Real | Real | **REAL** |
| Open available/active/completed official Solo | Real state-specific modal | Real route, state-aware | **REAL / different presentation** |
| Start official Solo | Real `runMobileQuestAction(start)` | Visible detail CTA links `/account` | **FAKE/CONTRADICTORY on web** |
| Check active Solo | Real from Home/detail/pull | Real only from Home refresh icon; detail CTA links `/account` | **PARTIAL / contradictory detail** |
| Submit exact Solo game/link | Real selected detail supports submit | No equivalent visible official detail action | **MISSING** |
| Deactivate active Solo | Real | Real `DeactivateQuestControl` | **REAL** |
| Reset completed Solo | Real completed proof card | Server action exists; no proven co-located receipt control | **PARTIAL** |
| Like official Solo | Real catalog/detail mutation | Count-only display | **MISSING action / STATIC visual** |
| Like Community Solo | Real | Real | **REAL** |
| Report Community Solo | Real through support modal | Real inline support API | **REAL / different UX** |
| Pick Community Solo | Real | Real `CommunitySoloPickControl` | **REAL** |
| Share Community Solo | Native share | Link to canonical page; no Web Share/copy | **PARTIAL** |
| Creator shelf | Real filtered catalog | Creator browse path exists on detail | **REAL, filter behavior requires proof** |
| Build multi-condition custom quest | Real | Not represented | **MISSING** |
| Save signed-out local custom draft | Real local component state | Refused | **CONTRADICTORY** |
| Create signed-in custom | Real | Real simplified API form | **REAL but feature-subset** |
| Edit/duplicate/archive/delete custom | Real | No selected owner detail | **MISSING** |
| Start/check/submit/deactivate custom | Real | No selected custom detail | **MISSING** |
| Use custom/community quest in Multiplayer create | Real preselection/catalog | Web create receives official `CHALLENGES` only | **MISSING** |
| Browse official Multiplayer | Real | Real | **REAL** |
| Browse community Multiplayer | Real | Real | **REAL** |
| Join public Multiplayer | Real | Real `GroupQuestDirectJoin` | **REAL** |
| Join private invite code | Real | Real | **REAL; signed-out redirect intent unverified** |
| Create Multiplayer | Real | Real | **REAL / subset picker** |
| Like Community/Official Multiplayer | Real | Count-only display | **MISSING action** |
| Report Community Multiplayer | Real | No detail report UI | **MISSING** |
| More by Multiplayer host | Real | Host text only | **MISSING action** |
| Share/copy invite | Real native share + clipboard | No actual detail share/copy controls | **MISSING** |
| Check/refresh joined Multiplayer proof | Real | API exists but no rendered detail control | **MISSING** |
| Leave Multiplayer | Real | API exists but no rendered detail control | **MISSING** |
| Edit owned Multiplayer | Real | APIs exist; route redirects edit alias to create | **MISSING / misleading alias** |
| Remove participant | Real owner action | API exists; no rendered owner action | **MISSING** |
| View leaderboard/progress | Real | Missing from detail | **MISSING** |
| View/share frozen final receipt | Real | Detail says OPEN and omits final receipt | **CONTRADICTORY** |
| Profile/chess usernames | Real | Real | **REAL** |
| Log out/delete account | Real | Real | **REAL** |
| Send support message/thread | Real | Real | **REAL** |
| Copy diagnostics | Real candidate/account packet | Real URL/user-agent packet | **REAL action / DIFFERENT and materially thinner data** |

---

# 4. Visual-surface parity inventory

No row below is screenshot-proven in this audit.

| Primitive | Android source | Web implementation | Source-level assessment |
| --- | --- | --- | --- |
| Safe area/status bar | `SafeAreaView`, explicit status bar (`1705-1708`) | CSS viewport/layout | **UNVERIFIED; likely different around browser chrome/notches.** |
| Dynamic gradient background | `GradientBackdrop:6369-6399` | CSS variables/backdrop (`168-189`) | **Concept matched; exact stops/opacity unverified.** |
| Watermark | `1709-1711` | CSS backdrop; no explicit matching watermark image in shell JSX | **Potentially MISSING/DIFFERENT.** |
| Coat/glow layering | Repeated native `Image` layers | `MobileAssetMark`, Next Image | **Concept matched; size/tint/blur unverified.** |
| Completion red seal overlay | Native row/hero overlays | Web row status images in some receipt/trophy states | **Partial; completed catalog overlay requires capture.** |
| Multiplayer gold/silver/bronze seals | Native assets | Same mobile-source assets | **Asset matched; geometry unverified.** |
| Cards | Native `View` style families (`freshPanel`, `multiplayerNativeCard`, etc.) | CSS `sqc-native-card`, panels | **Concept matched; radius, border, shadow, spacing unverified.** |
| Typography | React Native text styles | Browser CSS/fonts | **UNVERIFIED.** Must compare family, weights, line-height, wrapping. |
| App rows | `AppRow:3819-3891` | `AppRow:1402-1444` and simpler `CatalogRow` | **DIFFERENT.** Catalog client rows omit native image/glow/like hierarchy. |
| Status pills/tones | Android explicit green/gold/orange/danger/absurd | CSS normalized status classes | **UNVERIFIED; semantic mappings differ.** |
| Native close button | Circular X fixed/top bar | CSS close link | **Concept matched / geometry unverified.** |
| Hamburger | Native button + full overlay modal | `<details>` panel | **Behavior and visuals DIFFERENT/UNVERIFIED.** |
| Refresh icon/spinner | Material icon with rotation and native pull control | SVG spinner on Home | **Asset/animation close by source; placement differs.** |
| Chess boards | Native 8×8 view with piece glyphs and highlights | CSS 8×8 `MiniChessBoard` | **Data mapped; exact square geometry/piece font unverified.** |
| Search/filter/sort controls | Native cards/chips/custom controls | Browser input/button/select | **DIFFERENT; raw select/datetime controls are especially divergent.** |
| Date/time controls | Native platform picker and quick chips | `datetime-local` | **DIFFERENT platform chrome.** |
| Full-screen modals | Native slide/fade modal | Separate routes | **DIFFERENT transition/history/scroll restoration.** |
| Celebration | Native vibration, particles, modal | None | **MISSING.** |
| Scroll hints/pull hints | Native functional pull + edge hints | Static pull copy | **FAKE/DIFFERENT.** |
| Bottom navigation | Dormant in current Android shell | None signed-in | **No current reachable parity requirement; verify v338 binary before changing.** |

---

# 5. Complete Next.js route inventory

Every current `src/app/**/page.tsx` is classified below.

## 5.1 Canonical rendered product routes

| Route | Component / source | Android mapping | Data | Status |
| --- | --- | --- | --- | --- |
| `/` | `src/app/page.tsx`; `MobileAppWebShell` Home | `TodayDashboard` | Clerk metadata, trophies, related group quests | **REAL / partial action parity** |
| `/side-quests` | `MobileSoloSideQuestsScreen` | Official Solo tab | Static `CHALLENGES` + Clerk state + likes | **REAL / likes static** |
| `/community-side-quests` | `MobileCommunitySideQuestsScreen` | Community Discover | Clerk-backed public quests | **REAL / filter subset** |
| `/custom-side-quests` | `MobileCustomSideQuestsScreen` | My Library | Clerk custom metadata | **REAL list / missing selected detail** |
| `/create-custom-side-quest` | `MobileCreateCustomScreen` | Custom builder modal | POST mobile custom API | **REAL subset** |
| `/challenges/[id]` | official detail | Selected/current/completed official detail | Static challenge + Clerk attempt/progress/likes | **REAL read / contradictory start/check** |
| `/challenges/community/[id]` | community detail | Custom community detail modal | Clerk public quest + likes | **REAL partial** |
| `/multiplayer` | official Multiplayer default | Official catalog | Clerk/groupquest previews | **REAL** |
| `/multiplayer-side-quests` | official/community by query | catalog tab deck | Same | **REAL** |
| `/groupquests/[id]` | `MobileMultiplayerDetailScreen` | Joined/public/owner/final modal | Groupquest preview/detail | **REAL public subset / major missing states** |
| `/create-multiplayer-side-quest` | `MobileCreateMultiplayerScreen` | create modal | Official CHALLENGES + POST API | **REAL subset; missing custom/community choices** |
| `/trophy-cabinet` | `MobileTrophyCabinetScreen` | `CoatBoardDashboard` | Clerk trophies/progress | **REAL / labeling bug** |
| `/account` | custom Account page | `AccountTrackerDashboard` | Clerk metadata, ratings, trophies | **REAL with fake stats** |
| `/settings` | profile editor | Account editor subset | Clerk metadata/server action | **REAL duplicate IA** |
| `/support` | `MobileSupportScreen` | HelpSupport modal | Clerk support thread + API composer | **REAL / diagnostics subset** |
| `/help-support` | re-exports Support | HelpSupport modal | Same | **REAL alias rendered** |
| `/privacy` | standalone policy | Android external privacy browser | Static legal policy | **REAL web legal surface** |
| `/proof/[token]` | public proof receipt | Completed proof/public share | Signed token decode | **REAL public receipt** |
| `/sign-in/[[...sign-in]]` | Clerk `SignIn` | native auth panels | Clerk | **REAL / different UI** |
| `/sign-up/[[...sign-up]]` | Clerk `SignUp` | native create/verify | Clerk | **REAL / different UI** |

## 5.2 Redirects and aliases

| Route(s) | Destination | Assessment |
| --- | --- | --- |
| `/challenges`, `/solo`, `/solo-side-quests`, `/random`, `/path`, `/share-kit` | `/side-quests` (directly or re-export) | **REAL aliases**, but random/path/share-kit no longer preserve their old intent. |
| `/challenges/community`, `/community` | `/community-side-quests` | **REAL aliases.** |
| `/custom`, `/account/custom-side-quests` | `/custom-side-quests` | **REAL aliases.** |
| `/groupquests`, `/groupquests/public`, `/groupquests/gq_demo_no_castle_01` | `/multiplayer` | **REAL legacy aliases.** |
| `/groupquests/create` | `/create-multiplayer-side-quest` | **REAL alias.** |
| `/groupquests/[id]/edit` | `/create-multiplayer-side-quest` | **MISLEADING:** loses ID and does not edit the selected quest. |
| `/leaderboards`, `/official-leaderboards`, `/scoreboard` | `/multiplayer` | **PARTIAL alias:** catalog/archive summary only, not dedicated Android leaderboard screen. |
| `/badges`, `/coat-of-arms` | `/trophy-cabinet` | **REAL aliases.** |
| `/connect`, `/profile`, `/admin/analytics`, `/my-account`, `/result` | `/account` or Account re-export | **REAL aliases**, but result intent is lost. |
| `/help`, `/rules`, `/terms`, `/verifiers`, `/beta` | `/support` | **PARTIAL/MISLEADING:** Terms has no independent content; verifier/rules intent is flattened. |
| `/brand-test` | `/` | Legacy alias. |
| `/dare/[id]` | `/challenges/[id]` | **REAL alias.** |

## 5.3 Web-only/non-Android product surfaces

- `/privacy` is intentionally browser legal content opened externally by Android.
- `/admin/analytics` does not expose admin analytics; it redirects to Account.
- Public proof and OG routes are share destinations rather than Android top-level screens.
- Global `not-found.tsx` has no direct Android equivalent; it is appropriate web route handling.

---

# 6. Ranked gaps

## P0 — user-visible functional contradictions

1. **Official Solo start/check CTAs do not perform their named action.** `/challenges/[id]` sends signed-in users to `/account` for both Start and Check (`lines 154-155`, `207-209`), while Android executes the mutation in place.
2. **Joined/hosted/finished Multiplayer detail is not implemented on web.** The web route only provides public summary/join/rules. It lacks refresh proof, leave, leaderboard, participant progress, owner edit/remove, invite controls, and final receipts.
3. **Finished Multiplayer detail is falsely rendered as `OPEN`.** `MobileMultiplayerDetailScreen:1292` hard-codes OPEN, contradicting Android’s frozen final result/reward/leaderboard states.
4. **Account stats contain fake zeros.** Web hard-codes Podiums, custom tries/wins, and multiplayer trophies to zero (`account/page.tsx:168-171`) while Android reads real account values.
5. **Custom owner lifecycle and proof command center is absent.** Library rows all route to generic create; edit, duplicate, archive, delete, active check/submit/deactivate, completed result, and use-in-Multiplayer are unreachable.
6. **Web custom builder is a small template subset, not Android’s rule builder.** Multi-condition logic, six condition slots, piece identity/owner/count, timing, square/sequences/result/negation, edit/duplicate/delete conditions, and live crest preview are absent.
7. **Signed-out custom draft behavior contradicts Android.** Android saves a local draft; web refuses creation.
8. **Multiplayer creation cannot choose Community or custom Side Quests.** Web passes only official `CHALLENGES`; Android merges official, owned custom, and community quests.
9. **Official and Multiplayer likes look interactive/current but are display-only on web.** Counts are rendered inside linked rows with no mutation.
10. **Home tells users to pull down to refresh without implementing page-controlled pull refresh.** This is a misleading control instruction.

## P1 — missing states/actions and data semantics

11. Official Solo exact-game submission is missing from the visible web detail.
12. Community Multiplayer report, host shelf, share/copy invite, and like actions are missing.
13. Owner private invite code display/copy and participant removal are missing.
14. Multiplayer nested per-quest rule detail and progress bars are missing.
15. Completion celebration/vibration/coat unlock overlay is missing.
16. Community Solo filters/sorts omit Popular, New, Liked, and creator shelf behavior.
17. Community Multiplayer filters/sorts omit Liked, Players, and host shelf behavior.
18. Multiplayer create picker omits selected-only mode, clear-all, source tabs, source badges, and paging.
19. Web Trophy Cabinet can label all Multiplayer rows “Official Multiplayer trophies,” including community rewards.
20. Support diagnostics can copy URL/user-agent details, but lacks Android’s candidate/build/package/API/account/chess/active-quest packet.
21. `/terms` does not contain Terms of Use; it redirects to Support.
22. Offline saved catalog/fallback/retry state is missing.
23. Global and route mutation success/error states are less complete than Android, especially Solo refresh.

## P2 — visual and interaction differences (all require captures)

24. Full-screen native modals became routes, changing transitions, back/close behavior, and scroll restoration.
25. Hamburger uses browser `<details>` rather than a modal overlay.
26. Native option cards/date pickers became browser selects and `datetime-local` controls.
27. Client catalog rows omit coat/glow/like/source richness.
28. Dynamic gradients, watermark, safe-area padding, card geometry, typography, status tones, and board microgeometry are not screenshot-proven.
29. Android and web catalog ordering differ because active/completed ranking is applied in a different sort precedence.
30. Account, support, legal, and auth are split into more routes on web than Android’s consolidated modal/account model.

---

# 7. Exact screenshot evidence still required

Capture Android v338 and web at the **same 390×844 CSS-pixel viewport equivalent**, same account and fixtures, with Android status/navigation chrome documented separately. For each ID capture full page plus action/result follow-up where named. Do not mark parity from source alone.

## Global/auth

- `G01` Android initial loading card ↔ web cold-route/loading state.
- `G02` Android offline fallback banner + saved board ↔ web network-failure result.
- `G03` signed-out Home, top and bottom of content.
- `G04` signed-in shell identity/header and hamburger closed/open.
- `G05` each non-Home close button placement: Solo, Multiplayer, Trophy, Account.
- `G06` Android Google/Facebook/password auth selector ↔ web Clerk sign-in.
- `G07` password sign-up verification required, wrong code, success.
- `G08` auth incomplete/error alert ↔ web error state.

## Home / Solo proof

- `H01` signed-in Home, no chess username, no active Solo, no active Multiplayer, no trophy.
- `H02` signed-in Home, connected username, active Solo pending/no game.
- `H03` active Solo check busy spinner and success message.
- `H04` active Solo check transport/server error.
- `H05` active Solo failed proof with diagnostic FEN/highlight.
- `H06` active Solo passed/completed board and red seal.
- `H07` Home with 1 and >5 active Multiplayer rows, including hosted and joined.
- `H08` Home with mixed Solo and Multiplayer trophies and >5 expansion.
- `H09` current Solo detail pending, failure, passed (three pairs).
- `H10` enlarged Coat of Arms lightbox (Android) and explicit web absence.
- `H11` completion celebration for Solo and for Multiplayer-triggered completion.
- `H12` completed proof receipt with proof details alert, share sheet, copy success, reset confirm/success/error.

## Solo catalogs/custom/community

- `S01` Official catalog populated with Easy/Hard, Active, Completed, likes, and long wrapping title.
- `S02` Official catalog ordering fixture that exposes Android/web precedence difference.
- `S03` available official detail signed out, signed in, active, completed.
- `S04` Official like: signed out alert; signed in idle/busy/liked/error.
- `C01` Community Discover empty, populated, no-results.
- `C02` Community search plus every Android filter/sort and creator shelf.
- `C03` Community detail signed out, signed-in non-owner, owner, active, completed.
- `C04` Community like/report busy/success/error.
- `C05` My Library empty and populated with Draft/Published/Public/Archived/Active/Completed.
- `C06` owner custom detail with every manage action.
- `B01` blank custom builder.
- `B02` template applied.
- `B03` six-condition builder showing all condition types and All/Any logic.
- `B04` piece identity/count/owner and square/timing/move inputs.
- `B05` validation alert, unsaved discard alert, save draft success, public publish success, failure.
- `B06` signed-out local draft save and reopened local library (Android) ↔ web refusal.
- `B07` edit existing custom and state transitions public/private/archive/delete.

## Multiplayer

- `M01` Official tab empty/populated, signed out/signed in.
- `M02` latest official finished set and earlier-week archive modal/route.
- `M03` Community signed-out browse empty/populated/no-results.
- `M04` signed-in Active mine empty/populated >4 and Finished mine empty/populated >3.
- `M05` each Community filter/sort and host shelf.
- `M06` private invite blank/invalid/missing username/joining/success.
- `M07` create blank, validation error, busy, success.
- `M08` create access modes, providers, native/web date controls, duration chips, advanced options.
- `M09` create picker official/community, search, selected-only, four selected, fifth rejected, clear, pagination.
- `M10` public official not-joined detail.
- `M11` public community not-joined detail with like/report/more-by-host/share.
- `M12` joined active detail collapsed and proof-expanded, leaderboard empty/populated.
- `M13` hosted active detail with private code, owner settings, player removal confirmation.
- `M14` joined finished rank 1, rank 2/3, and non-podium final receipt.
- `M15` public finished winner/frozen leaderboard.
- `M16` owner finished archive locked state.
- `M17` nested included-Side-Quest rule detail.
- `M18` refresh proof busy/success/error and leave success/error.

## Trophy/account/support/legal

- `T01` Trophy Cabinet signed out, signed-in empty, Solo-only, official podium, community podium, mixed rewards.
- `T02` locked/unlocked official coat grid and long-title wrapping.
- `A01` Account signed out.
- `A02` Account signed in, no usernames/no activity.
- `A03` Account fully populated with real custom stats and Multiplayer podiums; verify web zero contradiction.
- `A04` ratings populated/error/empty.
- `A05` profile editor save busy/success/error.
- `A06` delete collapsed, confirm text wrong/right, busy, error, success.
- `A07` logout.
- `P01` Support signed out and signed in.
- `P02` diagnostics collapsed/expanded/copy alert.
- `P03` support thread empty, user message, admin reply.
- `P04` support message too short, busy, success, server error.
- `L01` Privacy page opened from Android external browser and direct web.
- `L02` Terms of Use action showing Android/web destination; verify current web redirect contradiction.

---

# 8. Verification and implementation handoff

Before any “complete parity” claim:

1. Fix P0 functional contradictions before cosmetic work.
2. Build deterministic fixtures for signed-out; signed-in empty; active pending/failure/success; completed; joined; hosted; private; finished; owner/non-owner; custom lifecycle; trophy mix; support reply.
3. Exercise every visible mutation against the real route/API, not only source-regex tests.
4. Capture every screenshot ID above on Android v338 and local web from this branch.
5. Compare functional and visual parity separately.
6. Keep `UNVERIFIED` on any state that cannot be reproduced; never infer screenshot parity from shared assets or CSS names.

## Audit conclusion

The web now mirrors the broad Android information architecture and many read surfaces, but it is **not functionally complete** against v338. The largest deficits are the web Multiplayer command center/final receipts, the custom rule-builder and owner lifecycle, misleading official Solo action CTAs, fake Account stats, and missing mutation controls hidden behind read-only like/share-looking surfaces. Visual similarity remains unproven until the exact screenshot manifest is captured.
