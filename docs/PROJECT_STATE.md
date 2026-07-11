# Project state

This file is the concise entry point for the repository's current technical shape. Dated implementation and release records elsewhere in `docs/` remain historical evidence, not the source of truth for routine development commands.

## Applications

- The repository is a pnpm workspace (`pnpm-workspace.yaml`).
- The root package is the Next.js web application (Next 16, React 19, TypeScript).
- `apps/mobile` is the Expo/React Native application and has its own package scripts.
- `pnpm-lock.yaml` is the dependency lockfile and must remain synchronized with package manifests.

## Automated baseline

GitHub Actions runs the following checks for pull requests and pushes to `main`:

1. `pnpm install --frozen-lockfile`
2. `pnpm lint`
3. `pnpm --dir apps/mobile typecheck`
4. `pnpm build`

There is currently no general-purpose automated test script in either package manifest, so CI does not claim to run a test suite. The repository does contain targeted QA, smoke, release-gate, and deployment scripts; these are intentionally excluded from baseline CI because they may require services, credentials, browsers, devices, or release context.

## Operational boundaries

- Pull requests should pass the baseline checks before merge.
- Production deployment is not part of CI.
- Never put secrets in tracked files, workflow YAML, command output, or documentation.
- See [OPERATIONS.md](./OPERATIONS.md) for verified local commands and release safety boundaries.
