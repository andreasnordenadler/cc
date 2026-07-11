# Operations

Run commands from the repository root unless a command says otherwise.

## Toolchain

Baseline CI uses Node.js 22 and pnpm 10.29.1. The committed `pnpm-lock.yaml` is authoritative for dependency resolution.

## Local setup

```sh
pnpm install --frozen-lockfile
```

Use a normal install only when intentionally changing dependencies; review and commit the corresponding lockfile change.

## Development

Start the web application:

```sh
pnpm dev
```

Start the mobile development server:

```sh
pnpm --dir apps/mobile start
```

Mobile environment variable names and non-secret examples are documented in `apps/mobile/.env.example`. Local `.env*` files are ignored and must not be committed.

## Required pull-request checks

Run the same commands as CI:

```sh
pnpm lint
pnpm --dir apps/mobile typecheck
pnpm build
```

Lint warnings are reported but do not fail unless ESLint reports an error. There is no general-purpose `test` script at present; do not represent targeted QA scripts as a complete automated test suite.

## Release and production safety

Production deployment is a deliberate local operation, not a CI step. The root manifest defines guarded release/deployment scripts, including `quest:release-gate`, `deploy:prod:guard`, and `deploy:prod`. Do not run deployment commands during routine validation or from pull-request CI. Production execution requires explicit authorization, the correct account/environment, and a successful guard run.

Release, QA, and device scripts can depend on external providers, local browsers, credentials, Java/Android tooling, or connected devices. Invoke them only for their documented purpose and never add their secrets to the repository.
