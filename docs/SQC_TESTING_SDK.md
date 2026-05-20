# SQC Testing SDK

Internal developer SDK for repeatable Side Quest Chess smoke/API checks.

It is intentionally dev-facing only: it does not add website UI and it does not bypass auth. Authenticated calls require a caller-supplied test session cookie.

## Quick smoke

```bash
pnpm sdk:smoke
```

Defaults to production:

```bash
SQC_BASE_URL=https://sidequestchess.com pnpm sdk:smoke
```

Run against local dev:

```bash
SQC_BASE_URL=http://localhost:3000 pnpm sdk:smoke
```

## Authenticated checks

Authenticated account/quest actions require a Clerk browser session cookie copied from a test account session:

```bash
SQC_TEST_COOKIE='__session=...' pnpm sdk:smoke
```

The SDK never stores the cookie. Keep test cookies out of git and logs.

## Programmatic usage

```js
import { SideQuestChessTestClient } from './testing-sdk/index.mjs';

const sqc = new SideQuestChessTestClient({
  baseUrl: 'https://sidequestchess.com',
  authCookie: process.env.SQC_TEST_COOKIE,
});

await sqc.checkMobileBootstrapContract();
await sqc.checkCompletedQuestSeal();
await sqc.smokePublicPages();

// Optional authenticated flow:
await sqc.startQuest('finish-any-game');
await sqc.checkActiveQuest();
const account = await sqc.getAccount();
console.log(account.data.activeQuest);
```

## Included helpers

- `getBootstrap()` — fetches `/api/mobile/bootstrap`.
- `checkMobileBootstrapContract()` — verifies core mobile catalog contract shape.
- `smokePublicPages(paths?)` — checks key public pages return successful HTML.
- `checkCompletedQuestSeal()` — regression check for the completed quest red seal asset; pass `{ expectAccountReference: true }` with an authenticated completed-quest test session when you also want to assert account-page rendering.
- `getAccount()` — authenticated `/api/mobile/account` fetch.
- `startQuest(challengeId)` — authenticated mobile quest start.
- `checkActiveQuest()` — authenticated latest-game verifier trigger.
- `submitQuestProof(challengeId, gameUrlOrId)` — authenticated manual proof submission.
- `deactivateQuest(challengeId)` — authenticated active quest deactivation.
- `resetQuest(challengeId)` — authenticated completed quest reset for repeat testing.

## Design notes

- Uses Node 22 global `fetch`; no extra dependency.
- Defaults to `https://sidequestchess.com`.
- Timeouts default to 15 seconds (`SQC_TEST_TIMEOUT_MS`).
- The red-seal regression currently expects `/stamps/quest-complete-premium-red-wax-sqc-v15.png`, the same live red seal used on completed quest surfaces.
