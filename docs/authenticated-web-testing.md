# Authenticated web-flow testing

`pnpm test:web:authenticated` runs `tests/authenticated-web-flows.test.ts` directly. It is a useful local/diagnostic filter; the CI job does not run it separately because the same file remains part of the merge-gating `pnpm test` suite.

The suite calls production dependency-injected handlers with real `Request` bodies and disposable in-memory adapters. Production route exports continue to supply Clerk authentication, Clerk metadata persistence, and Next.js revalidation. Covered production seams are:

- `handleCommunityLikeRequest`, used by `POST /api/community-likes`: JSON parsing, auth-derived user ID, target validation, exact like metadata, response contract, revalidation paths, no write on failure, and sanitized persistence failure.
- `handleGroupQuestCreateRequest`, used by `POST /api/groupquests`: JSON parsing, auth-derived host identity, official quest selection, schedule normalization, exact host participant/group-quest metadata, no write for malformed input, and sanitized persistence failure.
- `handleGroupQuestJoinRequest`, used by `POST /api/groupquests/[id]/join`: exact route-ID lookup, private invite validation, spoofed identity rejection, participant identity derived from authenticated metadata, exact joined record, no write on rejection, and sanitized persistence failure.
- `handleCustomQuestCreateRequest`, used by `POST /api/mobile/custom-quests`: JSON parsing, authenticated creator identity, production rule validation/normalization, exact custom-quest persistence input, no write on auth/validation failure, and sanitized persistence failure.
- `buildActiveMultiplayerHomeRows`, used by the production Home page: hosted/joined view-model rows and links.

The tests never instantiate Clerk or production persistence clients. Their adapters exist only in the test process.

## Explicit residual gaps

There is no Clerk testing token, dedicated non-production Clerk instance, or disposable test-user credential configured in this repository or CI. Therefore CI does **not** automate Clerk's provider-owned browser boundary: sign-in/sign-out UI (including the production `SignOutButton`), session-cookie issuance/refresh, or redirect-back navigation into an authenticated page. Account rendering is also not claimed by this suite. Active Solo pick/check/reset server actions remain covered by their existing unit/integration tests rather than this focused authenticated-handler file; extracting the large action module was not broadened into this PR.

Closing the browser gap requires a dedicated non-production Clerk instance, Clerk's supported testing-token setup, and a disposable test user supplied through protected CI secrets. It must never target production Clerk or production user metadata.
