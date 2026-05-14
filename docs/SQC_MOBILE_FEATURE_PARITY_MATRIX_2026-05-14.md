# SQC Mobile Feature Parity Matrix — 2026-05-14

## Parity rule

Mobile parity means the app supports the same user capabilities and uses the same backend authority as the website. It does **not** mean identical layout. The website remains feature-frozen; parity work should make mobile catch up without adding new website product features.

## Current website capability map

| Website capability | Website route/source | Mobile status | Gap / next action |
|---|---|---:|---|
| Browse Quest Hub | `/challenges`, `/api/mobile/bootstrap` | Partial/native | Catalog exists; needs website-equivalent grouping/filtering/scheduled quest context. |
| Quest detail / rules / reward | `/challenges/[id]` | Mostly native | Mobile has brief/rules/reward; needs start/check/submit/reset actions. |
| Sign in with Google | Clerk web + Clerk Expo | Partial | Native SSO shell exists; needs device verification that bearer token works end-to-end. |
| Edit profile + chess usernames | `/profile`, server actions | Partial/native | Mobile username save endpoint added; display name/bio still website-only. |
| Start active quest | `startChallenge` | Missing | Add mobile API + native CTA. |
| Check latest game | `checkActiveChallenge` | Missing | Add mobile API + native CTA. |
| Submit specific game/link | `submitChallengeAttempt` | Missing | Add mobile API + native form. |
| Deactivate active quest | `deactivateActiveChallenge` | Missing | Add mobile API + native control. |
| Reset completed quest | `resetCompletedChallenge` | Missing | Add mobile API + native confirmation. |
| Result/proof receipt | `/result`, `/proof/[token]`, `/api/og/proof/[token]` | Partial | Mobile shows latest receipt; needs proof-image viewer and native share sheet parity. |
| Badges / coat shelf | `/badges`, `/account` | Partial/native | Coat shelf slice added; needs full badges collection parity. |
| Account dashboard | `/account` | Partial/native | Solo summary exists; multiplayer panels and next-step actions incomplete. |
| Path / suggested quest | `/path` | Missing | Add suggested-path native screen/action. |
| Random quest | `/random` | Missing | Add native random/surprise quest action. |
| Scoreboard | `/scoreboard` | Handoff only | Add mobile read-only scoreboard once website has real data. |
| Multiplayer Side Quests | `/groupquests/*`, `/api/groupquests` | Handoff only | Big parity gap: list/create/join/leaderboard/proof states need mobile-native plan. |
| Share kit / dare links | `/share-kit`, `/dare/[id]` | Handoff/share partial | Add native share templates + dare deep links. |
| Support / terms / rules / verifiers | `/support`, `/terms`, `/rules`, `/verifiers` | Handoff only | Add read-only mobile info screens or reliable web handoffs. |

## Priority parity sequence

1. **Solo quest loop parity**: start quest, check latest game, submit game link, reset/deactivate, result/share.
2. **Account/profile parity**: display name/bio plus chess usernames, signed-in state clarity, device auth validation.
3. **Reward/proof parity**: full badge shelf, proof viewer, native share sheet, proof deep links.
4. **Discovery parity**: Quest Hub grouping/filtering, path/suggested quest, random quest.
5. **Multiplayer parity**: public list, create, join, room status, leaderboard/proof states.
6. **Static/support parity**: rules, verifiers, support, terms, share kit.

## Immediate execution decision

The next code slice should complete **Solo quest loop parity step 1** by adding mobile start/check actions backed by the same website server action semantics where possible. This is the highest-impact gap because the app must let a user actually progress a quest, not only browse and edit usernames.
