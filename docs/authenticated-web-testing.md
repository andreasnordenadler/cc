# Authenticated web-flow testing

`pnpm test:web:authenticated` is the merge-gating, credential-free authenticated flow suite. It uses a fresh in-memory fixture for every test and exercises the shared outcome contracts for authenticated Home, Account, Community Solo actions, Multiplayer invite/join, creator flows, proof outcomes, reset confirmation, and logout. The fixture has no Clerk client, network transport, environment credentials, or persistence callback, so it cannot read or mutate production accounts or data.

The full `pnpm test` command also includes route-handler integration tests with injected authentication and in-memory persistence. Public Playwright smoke tests remain separate (`pnpm test:browser:public`) and do not require authentication.

## Credential-gated residual gap

There is no Clerk testing token, dedicated Clerk test instance, or disposable test-user credential configured in this repository or CI. Therefore CI does **not** automate the provider-owned browser boundary: Clerk sign-in/sign-out UI, session-cookie issuance/refresh, or a real browser navigation from Clerk back into an authenticated SQC page. Covering that final boundary requires a non-production Clerk instance plus Clerk's official testing-token setup and a disposable test user supplied through protected CI secrets. It must never target the production Clerk instance or production user metadata.
