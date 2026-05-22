# Errors

Command failures and integration errors.

---
## [ERR-20260426-001] route_smoke_missing_path

**Logged**: 2026-04-26T08:48:00Z
**Priority**: medium
**Status**: pending
**Area**: tests

### Summary
Route smoke command failed because this exec environment did not resolve common shell tools from PATH.

### Error
```
zsh:1: command not found: curl
grep/head also unavailable by bare name
```

### Context
- Attempted local CC smoke with `curl`, `grep`, and `head` from `pnpm`-oriented shell environment.
- Use absolute `/usr/bin/curl`, `/usr/bin/grep`, `/usr/bin/head` for repeatable smoke checks here.

### Suggested Fix
Prefer absolute paths for core macOS CLI tools in cron/autonomous smoke commands.

### Metadata
- Reproducible: unknown
- Related Files: package.json

---
## [ERR-20260426-002] route_smoke_signed_out_visibility

**Logged**: 2026-04-26T08:52:00Z
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
Route smoke expected `Check latest games` on the challenge detail route, but the phrase only rendered for signed-in active users.

### Error
```
/challenges/queen-never-heard-of-her 200 needle='Check latest games' found=False
```

### Context
- Phase 3 route smoke should verify signed-out route content too.
- Added signed-out helper copy that previews the Check latest games affordance after starting a dare.

### Suggested Fix
For signed-in-gated features, include signed-out explanatory copy so local route smoke can verify the user-visible concept without an authenticated browser session.

### Metadata
- Reproducible: yes
- Related Files: src/app/challenges/[id]/page.tsx

---

## 2026-04-26 - PATH-minimal route smoke command failed

- Context: CC autonomous burst route smoke after build.
- Symptom: shell reported `curl`, `cat`, and `head` as not found, likely because the exec PATH was unexpectedly minimal for that command.
- Recovery: use absolute system paths such as `/usr/bin/curl`, `/bin/cat`, `/usr/bin/head` for smoke scripts when PATH looks suspicious.
## [ERR-20260426-003] route_smoke_curl_missing_again

**Logged**: 2026-04-26T12:48:00Z
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
Bare `curl` was still unavailable during a CC route-smoke command in the autonomous burst shell.

### Error
```
zsh:3: command not found: curl
```

### Recovery
Re-ran the route smoke with Python `urllib.request`, confirming `/result`, `/account`, and `/challenges/queen-never-heard-of-her` returned 200.

### Suggested Fix
Keep using Python or absolute system tool paths for cron/autonomous smoke checks in this environment.

### Metadata
- Reproducible: yes
- Related Files: docs/BLUNDERCHECK_V1_DYNAMIC_RESULT_PROOF_CARD_2026-04-26.md

---

## [ERR-20260426-001] smoke_command_path_missing

**Logged**: 2026-04-26T16:59:00+02:00
**Priority**: low
**Status**: pending
**Area**: tests

### Summary
Route smoke command failed because the shell environment did not resolve `curl`, `grep`, or `head` on PATH.

### Details
During CC Phase 8 local smoke verification, a zsh command using bare `curl`, `grep`, and `head` returned `command not found`. Retried successfully with absolute system paths (`/usr/bin/curl`, `/usr/bin/grep`, `/usr/bin/head`).

### Suggested Action
For autonomous smoke scripts in this environment, prefer absolute paths for core macOS utilities when a command unexpectedly cannot find them.

---

## [ERR-20260426-001] vercel-domain-add-argument-shape

**Logged**: 2026-04-26T17:46:00+02:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
Tried `npx vercel domains add <domain> <project>` but Vercel CLI 50 expects only the domain argument when run inside a linked project.

### Details
The command failed with: `vercel domains add <domain> expects one argument`. Retried from the linked `cc` project directory with `npx vercel domains add <domain> --scope andreas-nordenadlers-projects`, which succeeded.

### Suggested Action
For linked Vercel projects, add domains from the project cwd with one domain argument plus scope; do not include the project name.

---

## [ERR-20260426-002] zsh-path-command-lookup-during-smoke

**Logged**: 2026-04-26T17:46:00+02:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
A smoke-check shell reported `command not found: curl`, `grep`, and `head` unexpectedly.

### Details
The same checks succeeded when using absolute system binary paths (`/usr/bin/curl`, `/usr/bin/grep`, `/usr/bin/head`).

### Suggested Action
If a zsh smoke script unexpectedly cannot find common binaries, retry with absolute binary paths before treating the service check as failed.

---

## [ERR-20260426-001] shell_path_curl_missing_after_build

**Logged**: 2026-04-26T20:44:00+02:00
**Priority**: low
**Status**: pending
**Area**: infra

### Summary
A combined CC verification command passed `pnpm lint` and `pnpm build`, then failed during smoke checks because `curl` was not found in that shell context.

### Details
Earlier DNS/HTTP probes worked with `curl`, but the post-build smoke block exited with `zsh:8: command not found: curl`. Retried route smoke with `/usr/bin/curl` instead of relying on PATH.

### Suggested Action
Use `/usr/bin/curl` in recurring autonomous smoke scripts when PATH may be mutated by package-manager commands or shell context.

### Metadata
- Source: error
- Related Files: ROADMAP.md
- Tags: verification, shell, curl

---

## [ERR-20260426-001] Incorrect pnpm start argument forwarding

**Logged**: 2026-04-26T21:05:00+02:00
**Priority**: low

Tried `pnpm start -- -p 3117` for a Next.js smoke server. In this project/script shape, Next interpreted `-p` as a project directory and failed.

**Fix next time**: use `pnpm exec next start -p <port>` for ad-hoc Next production smoke checks.


## [ERR-20260426-003] head-curl-missing-in-zsh-smoke

**Logged**: 2026-04-26T22:48:00+02:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
A CC domain smoke command failed because zsh could not resolve `curl` and `head` from PATH.

### Details
The unpinned Side Quest Chess domain smoke used bare `curl`, `head`, `grep`, and `awk`; zsh reported `command not found` for `curl` and `head`. Retried the same verification successfully with `/usr/bin/curl`, `/usr/bin/head`, `/usr/bin/grep`, and `/usr/bin/awk`.

### Suggested Action
Use absolute `/usr/bin/*` paths for recurring OpenClaw smoke scripts in this environment when reliability matters.

---

## [ERR-20260427-001] cc_burst_smoke_commands

**Logged**: 2026-04-27T00:58:00+02:00
**Priority**: low
**Status**: pending
**Area**: tests

### Summary
Two smoke-check helper commands failed during the SQC friend-dare burst before verification was completed another way.

### Error
- Unquoted Next.js dynamic route path in zsh (`src/app/dare/[id]`) expanded as a glob and failed with `no matches found`.
- `curl` was unavailable in this runtime, so route smoke had to use Node `fetch` instead.
- `vercel logs --since 10m` is not supported by the installed Vercel CLI syntax.

### Context
The app changes built and deployed successfully. Production smoke was completed with Node `fetch`, and a bounded Vercel log sample was scanned without 5xx/error matches.

### Suggested Fix
Quote dynamic route paths in shell commands, prefer Node `fetch` for HTTP smoke in this workspace, and avoid `vercel logs --since` unless the CLI version confirms support.

### Metadata
- Reproducible: yes
- Related Files: src/app/dare/[id]/page.tsx

---

## [ERR-20260427-001] local_smoke_tooling

**Logged**: 2026-04-27T01:57:00+02:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
Local route smoke command assumed `curl` existed, but this macOS/OpenClaw environment returned `zsh: command not found: curl`.

### Details
During the SQC dare-link metadata burst, the first local smoke command used `curl -fsS` and failed because `curl` is unavailable in this shell. Re-ran the same verification with `python3 urllib`, which succeeded.

### Suggested Action
Prefer `python3 urllib` for HTTP smoke checks in this workspace unless `curl` availability has been explicitly confirmed.

### Metadata
- Source: error
- Related Files: docs/SQC_DARE_LINK_SOCIAL_METADATA_LIVE_DEPLOY_2026-04-27.md
- Tags: tooling, smoke-check

---

## [ERR-20260427-002] vercel_logs_flag_combination

**Logged**: 2026-04-27T01:58:00+02:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
`vercel logs <deployment-url> --since 30m` failed because deployment URL mode implies follow mode, and `--follow` does not support filtering.

### Details
The initial Vercel 500 scan used a deployment URL with `--since`, producing: `The --follow flag does not support filtering. Remove: --since`. Re-ran as `vercel logs <deployment-url> --no-follow --since 30m --status-code 500 --json`, which returned 0 lines.

### Suggested Action
When filtering Vercel logs for a specific deployment URL, include `--no-follow`.

### Metadata
- Source: error
- Related Files: docs/SQC_DARE_LINK_SOCIAL_METADATA_LIVE_DEPLOY_2026-04-27.md
- Tags: vercel, logs, deployment-verification

---

## [ERR-20260427-001] next_dynamic_og_route_static_params

**Logged**: 2026-04-27T00:45:00Z
**Priority**: medium
**Status**: resolved
**Area**: frontend

### Summary
Next.js build rejected a dynamic `opengraph-image.tsx` route that exported both `runtime = "edge"` and `generateStaticParams`.

### Error
```text
Page "/dare/[id]/opengraph-image" cannot use both `export const runtime = 'edge'` and export `generateStaticParams`.
```

### Context
- Command attempted: `pnpm lint && pnpm build`
- Change attempted: dynamic challenge-specific OG image metadata route for SQC dare links.

### Suggested Fix
Use a dynamic API route such as `/api/og/dare/[id]` with `ImageResponse`, then point page metadata `openGraph.images` and `twitter.images` at that endpoint.

### Metadata
- Reproducible: yes
- Related Files: `src/app/api/og/dare/[id]/route.tsx`, `src/app/dare/[id]/page.tsx`, `src/app/challenges/[id]/page.tsx`

### Resolution
- **Resolved**: 2026-04-27T00:45:00Z
- **Notes**: Replaced the metadata route with `/api/og/dare/[id]`; `pnpm lint` and `pnpm build` then passed.

---

## [ERR-20260427-002] vercel_logs_status_code_filter

**Logged**: 2026-04-27T00:45:00Z
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
`vercel logs --status-code 5xx` is not accepted by Vercel CLI 50.20.0; the filter requires explicit integer status codes.

### Error
```text
Validation error: statusCode must contain only comma-separated integers at "statusCode" (400)
```

### Context
- Command attempted: `vercel logs <deployment-url> --no-follow --since 30m --status-code 5xx --json`
- Goal: scan recent deployment logs for 5xx errors after production deploy.

### Suggested Fix
Loop explicit codes (`500 501 502 503 504`) or use another supported log filter.

### Metadata
- Reproducible: yes
- Related Files: deploy/proof workflow

### Resolution
- **Resolved**: 2026-04-27T00:45:00Z
- **Notes**: Re-ran the scan for explicit status codes `500`, `501`, `502`, `503`, and `504`; no matching entries returned.

---

## [ERR-20260427-001] zsh_command_portability

**Logged**: 2026-04-27T01:45:22Z
**Priority**: low
**Status**: pending
**Area**: tests

### Summary
Two smoke/log helper commands failed because they assumed shell names/tools that were not portable in this zsh environment.

### Details
- `curl`/`grep` were not found through the default PATH during a local smoke script; rerunning with `/usr/bin/curl` and `/usr/bin/grep` succeeded.
- A production smoke script used `status` as a variable name, but `status` is readonly/special in zsh; rerunning with `http_status` succeeded.
- `vercel logs <deployment> --since ...` implied follow mode and rejected filtering; using `vercel logs --environment production --since 10m --status-code ... --no-branch --no-follow` succeeded.

### Suggested Action
For recurring OpenClaw zsh smoke snippets, prefer absolute paths for basic BSD tools when PATH is suspicious, avoid `status` as a variable name, and add `--no-follow` when filtering Vercel logs.

---

## [ERR-20260427-001] local_smoke_curl_missing_and_vercel_logs_flag

**Logged**: 2026-04-27T04:47:00+02:00
**Priority**: low
**Status**: pending
**Area**: infra

### Summary
During CC production verification, `curl` was unavailable in the shell and `vercel logs <deployment> --since 10m` failed because deployment-log streaming does not support filtering unless `--no-follow` is used.

### Error
```text
zsh:3: command not found: curl
Error: The --follow flag does not support filtering. Remove: --since
```

### Context
- Attempted local/production route smoke with `curl`.
- Attempted Vercel deployment log scan with a positional deployment URL and `--since`, which implicitly enabled follow mode.

### Suggested Fix
Use Python `urllib.request` for HTTP smoke checks in this environment, or confirm curl exists before using it. For Vercel deployment log scans with filters, include `--no-follow`, e.g. `vercel logs <deployment-url> --no-follow --since 10m --status-code 500`.

### Metadata
- Reproducible: yes
- Related Files: docs/SQC_DAILY_DARE_SOCIAL_PREVIEW_LIVE_DEPLOY_2026-04-27.md

---

## [ERR-20260427-VERCEL-LOGS-FOLLOW-SINCE] Vercel logs flag mismatch

**Logged**: 2026-04-27T05:47:00+02:00
**Priority**: low

During the SQC random-dare deploy verification, `vercel logs <deployment-url> --since 10m` failed because deployment URLs imply `--follow`, and Vercel CLI does not allow filtering with follow mode. Use `--no-follow` with deployment URLs when filtering historical logs, e.g. `vercel logs <deployment-url> --no-follow --since 10m --status-code 500`.

## [ERR-20260427-001] Local smoke command used unavailable `curl` shim

**Logged**: 2026-04-27T06:47:00+02:00
**Priority**: low

During SQC proof-log smoke verification, a zsh command using bare `curl` failed with `command not found` even though `/usr/bin/curl` was available. Retried successfully with `/usr/bin/curl`.

**Do differently**: For scripted smoke loops on this Mac, prefer `/usr/bin/curl` when a previous command has shown PATH/shim weirdness.

## [ERR-20260427-001] local_smoke_path_resolution

**Logged**: 2026-04-27T09:47:00+02:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
Local smoke command failed because `curl` and `python3` were not found via the shell PATH in this cron exec context.

### Details
During the SQC scoreboard burst, `pnpm lint` and `pnpm build` passed, but the first route-smoke command used bare `curl` and `python3`, which zsh could not resolve. Retried with `/usr/bin/curl` and `/usr/bin/python3`.

### Suggested Action
Use absolute paths for common macOS tools in autonomous cron smoke scripts when PATH may be minimal.

### Metadata
- Source: error
- Related Files: src/app/scoreboard/page.tsx
- Tags: smoke, path, cron

---

## [ERR-20260427-002] vercel_logs_since_unsupported

**Logged**: 2026-04-27T09:52:00+02:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
`vercel logs <deployment> --since 15m` failed because this Vercel CLI treats logs as follow-mode and does not support filtering with `--since`.

### Details
The scoreboard deploy succeeded and live route smoke passed, but the first recent-error scan command failed with: `The --follow flag does not support filtering. Remove: --since`.

### Suggested Action
For this CC repo/CLI version, use a bounded `timeout` around unfiltered `vercel logs <deployment>` or another supported Vercel API/log command instead of `--since`.

### Metadata
- Source: error
- Related Files: docs/SQC_SCOREBOARD_LIVE_DEPLOY_2026-04-27.md
- Tags: vercel, logs, cli

---

## [ERR-20260427-001] image_generation_and_shell_path_smoke

**Logged**: 2026-04-27T10:59:00+02:00
**Priority**: low
**Status**: pending
**Area**: infra

### Summary
During SQC badge generation, two image-generation attempts aborted and a local smoke command failed because bare `wc`/`grep` were unavailable in this shell path.

### Details
Retried the aborted badge generations successfully. Reran the local smoke with `/usr/bin/wc`, `/usr/bin/tr`, and `/usr/bin/grep`, which passed.

### Suggested Action
For future OpenClaw cron smoke scripts in this environment, prefer absolute `/usr/bin/*` paths for basic Unix tools when command resolution looks narrow; retry transient image-generation aborts once with a shorter prompt.

### Metadata
- Source: error
- Related Files: docs/SQC_ILLUSTRATED_BADGE_SET_LIVE_DEPLOY_2026-04-27.md
- Tags: openclaw, image-generation, smoke-test

---

## [ERR-20260427-001] shell_path_and_vercel_logs_filters

**Logged**: 2026-04-27T11:56:00+02:00
**Priority**: low
**Status**: pending
**Area**: infra

### Summary
A local smoke command failed because bare `curl`/`grep` were unavailable in this shell PATH, and an initial Vercel log scan mixed deployment-URL implicit follow mode with `--since`.

### Details
During the SQC proof-log receipt sharing deploy, the first smoke command returned `command not found` for `curl` and `grep`. Retrying with `/usr/bin/curl` and `/usr/bin/grep` succeeded. Separately, `vercel logs <deployment-url> --since 30m` failed because Vercel CLI treats a deployment URL as implicit `--follow`, which does not support filtering. Project-scope `vercel logs --environment production --since 30m --status-code 500 --no-branch --limit 20` succeeded.

### Suggested Action
For recurring smoke scripts in this environment, use absolute paths for core macOS tools when PATH looks constrained. For filtered Vercel log scans, prefer project-scope logs or add `--no-follow` when querying a specific deployment historically.

### Metadata
- Source: error
- Related Files: docs/SQC_PROOF_LOG_RECEIPT_SHARING_LIVE_DEPLOY_2026-04-27.md
- Tags: smoke, vercel, path

## [ERR-20260427-001] local_smoke_shell_tooling

**Logged**: 2026-04-27T12:55:00+02:00
**Priority**: low
**Status**: pending
**Area**: tests

### Summary
`curl` and GNU `timeout` were not available in this zsh environment during CC production/local smoke checks.

### Details
A local smoke command using `curl` failed with `command not found: curl`; a later bounded Vercel logs command using `timeout` also failed. Node 22 global `fetch` and Vercel CLI `--no-follow` worked as replacements.

### Suggested Action
For recurring OpenClaw smoke checks on this Mac, prefer small Node `fetch` scripts over shelling to `curl`, and use Vercel CLI `--no-follow` instead of wrapping `vercel logs` with `timeout`.

### Metadata
- Source: error
- Related Files: src/app/rules/page.tsx
- Tags: smoke-checks, shell-tooling, vercel

---

## [ERR-20260427-001] local_smoke_curl_missing

**Logged**: 2026-04-27T13:43:00+02:00
**Priority**: low
**Status**: pending
**Area**: tests

### Summary
Local smoke command assumed `curl`, but this environment's shell path did not provide it.

### Error
```text
zsh:4: command not found: curl
```

### Context
- Attempted route smoke for the Side Quest Chess `/share-kit` burst.
- Switched to Python `urllib.request` for local HTTP smoke checks.

### Suggested Fix
Prefer Python/Node HTTP smoke helpers in this repo when `curl` availability is uncertain.

### Metadata
- Reproducible: yes
- Related Files: none

---

## [ERR-20260427-002] vercel_logs_since_flag_misuse

**Logged**: 2026-04-27T13:47:00+02:00
**Priority**: low
**Status**: pending
**Area**: infra

### Summary
Tried to scan Vercel logs with `--since 30m`, but this CLI version treated filtering as incompatible with follow mode.

### Error
```text
Error: The --follow flag does not support filtering. Remove: --since
```

### Context
- Attempted post-deploy error scan for Side Quest Chess share-kit deployment.
- Route smoke had already passed.

### Suggested Fix
Check `vercel logs --help` before assuming flags; use the CLI-supported recent log syntax or bounded timeout without unsupported filters.

### Metadata
- Reproducible: unknown
- Related Files: none

---

## [ERR-20260427-003] git_push_remote_ref_advanced

**Logged**: 2026-04-27T13:52:00+02:00
**Priority**: medium
**Status**: pending
**Area**: git

### Summary
`git push` for the SQC share-kit commit was rejected because remote `main` advanced after the local base commit.

### Error
```text
cannot lock ref 'refs/heads/main': is at 777bf2ec... but expected d615b7a...
```

### Context
- Local share-kit commit was created on an older main while another burst/session had pushed newer commits.
- Plan: rebase with autostash to preserve unrelated local dirty files, then push again.

### Suggested Fix
Before committing autonomous bursts in busy repos, fetch first or use a rebase/autostash push path when remote advances.

### Metadata
- Reproducible: yes in concurrent work
- Related Files: git history

---

## [ERR-20260427-001] local_smoke_next_start_cli_args

**Logged**: 2026-04-27T14:49:00+02:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
Local production smoke initially failed because `pnpm start -- --port 3123` passed `--port` as a project directory to Next.js.

### Details
For this Next.js app, `next start` should be run directly as `pnpm exec next start -p <port>` for ad-hoc local production smoke checks. The retry succeeded and route smoke passed.

### Suggested Action
Use `pnpm exec next start -p 3123` for future bounded CC production-mode local smokes.

### Metadata
- Source: error
- Related Files: package.json
- Tags: nextjs, smoke-test, cli

---

## [ERR-20260427-CC-SMOKE-CLI]

**Logged**: 2026-04-27T16:47:00+02:00
**Context**: CC / Side Quest Chess verifier-status badge deploy verification.
**What happened**: Two smoke/log commands used wrong assumptions: `pnpm start -- --port 3047` made Next treat `--port` as a project directory, and `vercel logs --since 30m` failed because this CLI version treats logs as follow-mode and does not support that filter.
**Impact**: No product impact; verification was rerun successfully with `pnpm exec next start -p 3047` and bounded `timeout 20s vercel logs ...`.
**Do differently**: For local Next production smoke in this repo, use `pnpm exec next start -p <port>`. For Vercel log scans, wrap `vercel logs <deployment>` in `timeout` instead of relying on `--since`.

## [ERR-20260427-002] vercel_deploy_ready_after_cli_error

**Logged**: 2026-04-27T17:44:30+02:00
**Priority**: medium
**Status**: pending
**Area**: infra

### Summary
`vercel --prod --yes` returned exit code 1 with `Deployment not found`, but `vercel inspect` showed the deployment continued building and became Ready/aliased shortly after.

### Details
The CC deploy URL was `https://cc-j5ij7v9lr-andreas-nordenadlers-projects.vercel.app`. The CLI command exited before the deployment reached Ready, while a follow-up inspect confirmed status Ready and aliases for `sidequestchess.com`.

### Suggested Action
When Vercel CLI returns this transient error after printing a production URL, inspect that URL before retrying or declaring failure.

### Metadata
- Source: error
- Tags: vercel, deploy, transient

---

## [ERR-20260427-003] vercel_logs_since_flag_unsupported

**Logged**: 2026-04-27T17:49:00+02:00
**Priority**: low
**Status**: pending
**Area**: infra

### Summary
`vercel logs https://sidequestchess.com --since 30m` failed because this Vercel CLI treats logs as follow-mode and does not support filtering.

### Details
The command returned: `The --follow flag does not support filtering. Remove: --since`.

### Suggested Action
For bounded deploy scans in this environment, use a short `timeout` around unfiltered `vercel logs` or inspect deployment logs instead of passing `--since`.

### Metadata
- Source: error
- Tags: vercel, logs

---

## [ERR-20260427-001] no-castle-test-assertion-wording

**Logged**: 2026-04-27T16:44:00Z
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
A new No Castle Club fixture test failed because the assertion expected `castled` while the product summary used `castle`.

### Error
```
assert.match(..., /castled/) failed for: "The king took the sensible kingside castle. Club membership denied."
```

### Context
- Command attempted: `node --experimental-strip-types --test tests/queen-never-heard-of-her-fixtures.mjs tests/no-castle-club-fixtures.mjs && pnpm lint && pnpm build`
- The implementation behavior was fine; the test regex was too narrow for the intended copy.

### Suggested Fix
Use resilient assertions for product-copy tests when exact tense is not the contract.

### Metadata
- Reproducible: yes
- Related Files: tests/no-castle-club-fixtures.mjs

---

## [ERR-20260427-002] smoke-command-path-resolution

**Logged**: 2026-04-27T16:47:00Z
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
A production smoke command failed because `curl` and `python3` were not found in the shell PATH for that exec invocation.

### Error
```
zsh:4: command not found: curl
zsh:4: command not found: python3
```

### Context
- Command attempted: route smoke loop for `https://sidequestchess.com` after Vercel deployment.
- Retried with absolute tool paths.

### Suggested Fix
Use `/usr/bin/curl` and `/usr/bin/python3` in smoke scripts when PATH resolution is suspicious.

### Metadata
- Reproducible: unknown
- Related Files: docs/SQC_NO_CASTLE_LICHESS_VERIFIER_LIVE_DEPLOY_2026-04-27.md

---

## [ERR-20260427-003] vercel-logs-follow-filter-conflict

**Logged**: 2026-04-27T16:46:00Z
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
`vercel logs <deployment-url> --since 30m` failed because deployment URL arguments imply follow mode, which cannot be combined with filtering.

### Error
```
Error: The --follow flag does not support filtering. Remove: --since
```

### Context
- Command attempted after production deploy for bounded error-log scan.
- Correct pattern is `vercel logs --environment production --level error --since 30m --no-branch --limit N` for filtered historical logs.

### Suggested Fix
Avoid positional deployment URL when using filtered Vercel log scans.

### Metadata
- Reproducible: yes
- Related Files: docs/SQC_NO_CASTLE_LICHESS_VERIFIER_LIVE_DEPLOY_2026-04-27.md

---

## [ERR-20260427-004] git-status-outside-repo-path

**Logged**: 2026-04-27T16:48:00Z
**Priority**: low
**Status**: resolved
**Area**: git

### Summary
`git status` failed when asked to include a workspace memory file outside the `cc` repository.

### Error
```
fatal: /Users/sam/.openclaw/workspace/memory/2026-04-27.md: is outside repository at /Users/sam/.openclaw/workspace/cc
```

### Context
- Command attempted to verify changed project files and a workspace memory file in one repo-scoped status call.

### Suggested Fix
Check repository files and workspace-level memory files separately.

### Metadata
- Reproducible: yes
- Related Files: memory/2026-04-27.md

---

## [ERR-20260427-001] vercel_logs_since_with_deployment_arg

**Logged**: 2026-04-27T21:40:00+02:00
**Priority**: low
**Status**: pending
**Area**: infra

### Summary
`vercel logs sidequestchess.com --since 30m` failed because deployment/URL log streaming implies `--follow`, and this CLI version does not allow filtering with follow.

### Suggested Action
For bounded production error scans, use project-scoped non-follow filters instead: `vercel logs --environment production --since 30m --status-code 500 --no-follow --limit 20`.

---

## [ERR-20260428-001] pawn_storm_fixture_move_count

**Logged**: 2026-04-28T01:40:00+02:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
Initial Pawn Storm Maniac normalizer test expected a pass, but the UCI fixture had fewer than the 20 moves required by the verifier.

### Details
The verifier correctly rejected the fixture as too short. The test fixture was extended past 20 moves while preserving six distinct player pawn starts before move 15.

### Suggested Action
When creating move-list verifier fixtures, count total plies against the minimum move threshold before asserting the challenge predicate.

---

## [ERR-20260428-002] shell_path_coreutils_missing

**Logged**: 2026-04-28T01:40:00+02:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
A local smoke command failed because the non-login zsh environment could not find common utilities (`curl`, `grep`, `tr`, `head`) by bare name.

### Details
The verification command used bare utility names in a compact loop and produced `command not found`. Retrying with absolute system paths is the safe local workaround for this environment.

### Suggested Action
Use absolute paths for core smoke-check utilities when PATH looks unreliable in cron/autonomous bursts.

---

## [ERR-20260428-003] vercel_logs_since_unsupported

**Logged**: 2026-04-28T01:40:00+02:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
`vercel logs <deployment> --since 30m` failed because this Vercel CLI treats logs as follow-mode and does not support that filter.

### Details
The CLI returned: `The --follow flag does not support filtering. Remove: --since`. Use the project/deployment dashboard or an unfiltered bounded timeout instead when scanning immediately after deploy.

### Suggested Action
Avoid `--since` with this Vercel CLI logs command in autonomous deploy proof scripts.

---

## [ERR-20260428-001] local_smoke_missing_path_tools

**Logged**: 2026-04-28T03:48:00+02:00
**Priority**: low
**Status**: pending
**Area**: tests

### Summary
Local smoke command failed because this shell could not resolve `curl` or `grep` from PATH.

### Details
During a CC autonomous burst, the route-smoke one-liner used bare `curl`/`grep`; zsh returned `command not found` for both.

### Suggested Action
For this Mac/OpenClaw environment, use absolute paths like `/usr/bin/curl` and `/usr/bin/grep`, or check `command -v` before route-smoke snippets.

### Metadata
- Source: error
- Related Files: ROADMAP.md
- Tags: smoke, shell-path, openclaw

---

## [ERR-20260428-002] vercel_logs_follow_since_conflict

**Logged**: 2026-04-28T03:51:00+02:00
**Priority**: low
**Status**: pending
**Area**: infra

### Summary
`vercel logs <deployment-url> --since 30m` failed because deployment URLs imply follow mode, which conflicts with filtering.

### Details
Vercel CLI 50.20.0 reported: `The --follow flag does not support filtering. Remove: --since`.

### Suggested Action
For bounded filtered scans, use linked-project filters without a deployment URL, or pass `--no-follow` when targeting a deployment.

### Metadata
- Source: error
- Tags: vercel, logs, deploy-verify

---

## [ERR-20260428-001] local smoke port collision

**Logged**: 2026-04-28T03:55:00Z
**Priority**: low

Local CC smoke attempted `pnpm start --port 3111`, but port 3111 was already in use by an unrelated server returning 404s, so the readiness loop failed.

**Resolution**: Retry one-off local smoke on a less likely high port and check the start log when readiness returns unexpected 404s.

## [ERR-20260428-002] Vercel logs implicit follow filtering

**Logged**: 2026-04-28T04:01:00Z
**Priority**: low

`vercel logs <deployment-url> --since 30m` failed because deployment-url mode implies `--follow`, and this CLI does not allow filtering while following.

**Resolution**: Use `vercel logs --environment production --since 30m --level error --no-branch` or add `--no-follow` when querying a specific deployment URL.

## [ERR-20260428-001] one-bishop-verifier-fixture

**Logged**: 2026-04-28T05:45:00Z
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
Initial One Bishop verifier UCI normalizer fixture failed because the crafted move sequence left the original b1 knight on the board.

### Resolution
Updated the fixture move sequence to remove both white knights and one bishop before asserting the final single-bishop state.

---

## [ERR-20260428-002] local-route-smoke-path

**Logged**: 2026-04-28T05:47:00Z
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
Local route smoke failed because the non-login shell did not have `curl`/`head` on PATH.

### Resolution
Use absolute system paths such as `/usr/bin/curl` and `/usr/bin/head` for smoke scripts in this environment.

---

## [ERR-20260428-003] vercel-logs-since-flag

**Logged**: 2026-04-28T05:52:00Z
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
`vercel logs <deployment> --since 30m` failed because the installed Vercel CLI treats logs as follow mode and does not support `--since` filtering there.

### Resolution
Use a bounded `timeout` around `vercel logs <deployment>` and grep the streamed output, or skip with an explicit blocker if logs are unavailable.

---

## [ERR-20260428-001] Smoke/log command assumptions in CC burst

**Logged**: 2026-04-28T08:46:00+02:00
**Priority**: low

During the SQC Blunder Gambit verifier deploy smoke, `curl` was unavailable in this environment and `vercel logs <deployment> --since 30m` failed because deployment arguments imply `--follow` unless `--no-follow` is provided. Use Python `urllib` for HTTP smoke when `curl` is missing, and use `vercel logs --environment production --level error --since 30m --no-branch` (or deployment URL with `--no-follow`) for bounded log scans.

## [ERR-20260428-001] vercel_logs_since_flag

**Logged**: 2026-04-28T09:48:00+02:00
**Priority**: low
**Status**: pending
**Area**: infra

### Summary
`vercel logs https://sidequestchess.com --since 10m` failed because the CLI treated logs as follow mode and does not support filtering with `--since`.

### Error
```text
Error: The --follow flag does not support filtering. Remove: --since
```

### Context
- Command attempted during Side Quest Chess production smoke/error-log scan.
- Vercel CLI version in local run: 50.20.0.

### Suggested Fix
For bounded post-deploy scans, use a supported logs invocation for this CLI version or rely on route smoke plus deployment build output when filtered logs are unavailable.

### Metadata
- Reproducible: yes
- Related Files: .learnings/ERRORS.md

---

## [ERR-20260428-001] vercel_logs_cli_flags

**Logged**: 2026-04-28T10:50:00+02:00
**Priority**: low
**Status**: pending
**Area**: infra

### Summary
Vercel CLI 50.20.0 rejected the log flags I initially tried during a post-deploy smoke check.

### Error
```text
vercel logs https://sidequestchess.com --prod --since 30m
Error: unknown or unexpected option: --prod

vercel logs https://cc-blg3xvowx-andreas-nordenadlers-projects.vercel.app --since 30m
Error: The --follow flag does not support filtering. Remove: --since
```

### Context
- Project: CC / Side Quest Chess
- Goal: bounded post-deploy production log scan after `vercel --prod --yes`.
- Working fallback: stream deployment logs briefly with `vercel logs <deployment-url>` and manually stop after a short watch window.

### Suggested Fix
For this installed Vercel CLI, avoid `--prod` and `--since` on `vercel logs`; use the concrete deployment URL and bounded streaming instead.

### Metadata
- Reproducible: yes
- Related Files: docs/SQC_ACCOUNT_QUEST_LAUNCHER_LIVE_DEPLOY_2026-04-28.md

---

## 2026-04-28 — Bishop Field Trip fixture expected the wrong black move number
- Context: while adding the SQC Bishop Field Trip verifier, the first fixture test run failed because the test expected Black queen's first move as player move 2.
- Cause: the UCI fixture had Black moves `e7e5`, `g8f6`, then `d8e7`, so the queen move was correctly player move 3.
- Fix: corrected the fixture assertion to expect move 3 and reran the targeted test.

## 2026-04-28 — Vercel logs command rejected `--since` filtering
- Context: after deploying SQC Bishop Field Trip, attempted `vercel logs <deployment-url> --since 30m` for a bounded production log scan.
- Cause: this installed Vercel CLI reports that logs run in follow mode and `--follow` does not support filtering, so `--since` is not accepted.
- Fix: use a bounded timeout around plain `vercel logs <deployment-url>` or another supported Vercel log command instead of `--since` on this host.

## 2026-04-28 — macOS host has no GNU `timeout`
- Context: tried to bound `vercel logs` with `timeout 20s` after the CLI rejected `--since`.
- Cause: this Darwin host does not provide GNU `timeout` by default.
- Fix: use a small Node child-process wrapper or OpenClaw process polling instead of assuming `timeout` exists.

## [ERR-20260428-001] Node strip-types alias import and Vercel logs flag mismatch

**Logged**: 2026-04-28T13:48:00+02:00
**Priority**: low
**Status**: resolved
**Area**: tests | deploy

### Summary
During the Chess.com latest-game adapter burst, two verification commands failed before being corrected.

### Details
- `node --experimental-strip-types --test tests/chesscom-no-castle-club-fixtures.mjs` could not resolve an `@/lib/...` import inside a directly imported TS module.
- Changing to a `.ts` relative import fixed Node but failed `next build` because `allowImportingTsExtensions` is not enabled.
- `vercel logs ... --since 30m` failed because this Vercel CLI treats logs as follow-mode and does not support filtering with `--since`.

### Resolution
- Removed the cross-module static import from `src/lib/chesscom.ts` and kept the scoped Chess.com No Castle evaluation self-contained so both Node strip-types tests and Next typecheck pass.
- Used a bounded plain `vercel logs <deployment-url>` stream instead of `--since` for deployment log watching.

### Suggested Action
For CC tests that directly import TS modules with `node --experimental-strip-types`, avoid `@/` aliases and `.ts` extension imports in production modules unless the project test runner changes to a resolver-aware runner.

### Metadata
- Source: error
- Related Files: src/lib/chesscom.ts, tests/chesscom-no-castle-club-fixtures.mjs
- Tags: node-strip-types, next-build, vercel-logs
## [ERR-20260428-001] macos_timeout_missing

**Logged**: 2026-04-28T14:45:00+02:00
**Priority**: low
**Status**: pending
**Area**: infra

### Summary
`timeout` is not installed in the macOS shell environment used for CC deployment log watches.

### Error
```text
zsh:1: command not found: timeout
```

### Context
- Attempted to bound `vercel logs` with `timeout 25s ...` during SQC production verification.
- Re-ran successfully using a background process with `sleep` and `kill`.

### Suggested Fix
Use a portable shell pattern for bounded log watches on macOS: start the streaming command in the background, `sleep N`, then `kill $pid` and inspect captured output.

### Metadata
- Reproducible: yes
- Related Files: docs/SQC_EARLY_KING_WALK_LICHESS_VERIFIER_LIVE_DEPLOY_2026-04-28.md

---

## [ERR-20260428-001] node-strip-types-import-alias

**Logged**: 2026-04-28T13:49:00Z
**Priority**: medium
**Status**: resolved
**Area**: tests

### Summary
`node --experimental-strip-types --test` cannot resolve Next.js `@/lib/*` path aliases inside source modules imported directly by tests.

### Details
Adding a runtime import from `src/lib/chesscom.ts` to `@/lib/knights-before-coffee` made direct Node fixture tests fail with `ERR_MODULE_NOT_FOUND`.

### Suggested Action
For source modules imported directly by Node strip-types tests, prefer relative runtime imports (or keep testable helpers dependency-free) unless a resolver/loader is added.

### Metadata
- Source: error
- Related Files: src/lib/chesscom.ts, tests/chesscom-knights-before-coffee-fixtures.mjs
- Tags: node-test, imports, nextjs-alias

---

## [ERR-20260428-002] macos-timeout-command-missing

**Logged**: 2026-04-28T14:00:00Z
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
GNU `timeout` is not available by default on this macOS host.

### Details
A bounded Vercel log-watch command using `timeout 20s ...` failed with `zsh:1: command not found: timeout`.

### Suggested Action
Use OpenClaw exec/process timeouts or a small Python subprocess wrapper instead of GNU `timeout` on this machine.

### Metadata
- Source: error
- Tags: macos, shell, vercel

---

## [ERR-20260428-001] chesscom_bishop_fixture_expectation

**Logged**: 2026-04-28T16:55:00+02:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
Initial Chess.com Bishop Field Trip fixture expected only one black bishop home from the observed `and72nor` PGN, but the SAN shade heuristic correctly detected both black original bishops before the queen/win check failed.

### Resolution
Updated the test expectation to `["c8", "f8"]` and verified the broader suite passed.

---

## [ERR-20260428-002] vercel_logs_timeout_since_flags

**Logged**: 2026-04-28T16:55:00+02:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
A bounded Vercel log command used unavailable macOS `timeout`, then retried with a deployment URL plus `--since`, which this Vercel CLI treats as implicit follow + unsupported filtering.

### Resolution
Used `vercel logs <deployment-url> --no-follow --level error --limit 20` for a non-streaming deployment error check.

---

## [ERR-20260428-001] vercel_logs_since_filter

**Logged**: 2026-04-28T17:46:00+02:00
**Priority**: low
**Status**: pending
**Area**: infra

### Summary
`vercel logs <deployment> --since 10m` failed because this CLI version treats filtered logs as incompatible with follow mode.

### Details
During SQC deployment verification, `vercel logs https://cc-bil366uw1-andreas-nordenadlers-projects.vercel.app --since 10m` returned: `The --follow flag does not support filtering. Remove: --since`.

### Suggested Action
For bounded SQC post-deploy scans, avoid `--since` with this Vercel CLI path; use a supported non-follow log invocation or rely on bounded live route smoke when logs filtering is unavailable.

### Metadata
- Source: error
- Related Files: none
- Tags: vercel,deploy-verify,cli

---

## [ERR-20260428-001] vercel_logs_timeout_command

**Logged**: 2026-04-28T18:47:00+02:00
**Priority**: low
**Status**: pending
**Area**: infra

### Summary
Used GNU `timeout` in zsh on macOS while scanning Vercel logs; this host does not have `timeout` installed.

### Details
The command `timeout 30s vercel logs ...` failed with `zsh:1: command not found: timeout`. OpenClaw `exec` already supports a `timeout` parameter, so wrapping with GNU timeout is unnecessary and less portable on Darwin.

### Suggested Action
Use the tool-level `timeout` parameter for bounded log scans, or use macOS-compatible shells without GNU-only utilities.

### Metadata
- Source: error
- Related Files: .learnings/ERRORS.md
- Tags: macos, vercel, shell-portability

---

## [ERR-20260428-002] vercel_logs_implicit_follow_with_since

**Logged**: 2026-04-28T18:48:00+02:00
**Priority**: low
**Status**: pending
**Area**: infra

### Summary
`vercel logs <url> --since ...` failed because Vercel CLI treats positional deployment URLs as implicit follow mode, and follow mode cannot be combined with filters.

### Details
For recent filtered scans, avoid passing the deployment/domain URL positionally. Use linked project filters such as `vercel logs --environment production --level error --since 10m --no-branch --limit 50`.

### Suggested Action
For bounded production error scans, prefer project-scoped filtered logs without a positional URL, or add `--no-follow` when querying a specific deployment historically.

### Metadata
- Source: error
- Related Files: .learnings/ERRORS.md
- Tags: vercel, logs, cli

---

## [ERR-20260428-001] lint-after-copy-edit

**Logged**: 2026-04-28T17:46:00Z
**Priority**: low
**Status**: resolved
**Area**: frontend

### Summary
A copy-only beta page edit missed a trailing comma and caused ESLint/TypeScript parsing to fail before build.

### Error
```
src/app/beta/page.tsx 23:4 error Parsing error: ',' expected
```

### Context
- Command attempted: `pnpm lint && pnpm build`
- Related file: `src/app/beta/page.tsx`
- Cause: direct string replacement changed an object property without preserving the comma delimiter.

### Suggested Fix
After manual string replacements inside TS/TSX object literals, inspect the nearby block before running full checks.

### Metadata
- Reproducible: yes
- Related Files: src/app/beta/page.tsx

### Resolution
- **Resolved**: 2026-04-28T17:46:00Z
- **Notes**: Restored the missing comma and re-ran verification.

---

## [ERR-20260428-002] curl-not-installed-during-smoke

**Logged**: 2026-04-28T17:49:00Z
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
A production smoke script assumed `curl` was available, but this host shell could not find it.

### Error
```
zsh:7: command not found: curl
```

### Context
- Command attempted: production smoke for `/verifiers`, `/beta`, and `/connect` after Vercel deploy.
- Environment: OpenClaw workspace on Sam’s Mac mini.

### Suggested Fix
Use Node 22 built-in `fetch` or Python urllib for deploy smoke checks instead of assuming curl exists.

### Metadata
- Reproducible: unknown
- Related Files: n/a

### Resolution
- **Resolved**: 2026-04-28T17:49:00Z
- **Notes**: Re-ran the smoke checks with a Node `fetch` script.

---

## [ERR-20260428-003] vercel-logs-follow-filter-conflict

**Logged**: 2026-04-28T17:51:00Z
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
`vercel logs <deployment-url> --since 10m` failed because deployment URL mode implies follow and the CLI rejects filters with follow.

### Error
```
Error: The --follow flag does not support filtering. Remove: --since
```

### Context
- Command attempted: bounded production log scan after SQC deploy.
- Vercel CLI: 50.20.0.

### Suggested Fix
Use `--no-follow` when filtering a specific deployment URL, e.g. `vercel logs <url> --no-follow --level error --since 10m`.

### Metadata
- Reproducible: yes
- Related Files: n/a

### Resolution
- **Resolved**: 2026-04-28T17:51:00Z
- **Notes**: Re-ran with `--no-follow` and level filtering.

---

## [ERR-20260428-001] node_strip_types_extensionless_import

**Logged**: 2026-04-28T21:48:00+02:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
A targeted Node strip-types test failed after adding a runtime extensionless relative import inside `src/lib/chesscom.ts`.

### Error
`ERR_MODULE_NOT_FOUND` for `./queen-never-heard-of-her` when running `pnpm exec node --experimental-strip-types --test tests/chesscom-queen-never-heard-of-her-fixtures.mjs`.

### Context
Node's strip-types test runner resolves runtime imports differently than the Next.js bundler. Avoid adding new runtime extensionless imports to modules directly loaded by these `.mjs` tests unless the test command handles specifier resolution.

### Suggested Fix
Keep shared verifier helpers local or test-compatible, or add a test-compatible import strategy deliberately.

### Metadata
- Reproducible: yes
- Related Files: src/lib/chesscom.ts, tests/chesscom-queen-never-heard-of-her-fixtures.mjs

---

## [ERR-20260428-002] vercel_logs_command_shape

**Logged**: 2026-04-28T21:50:00+02:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
Two initial Vercel log-watch attempts used unsupported/non-portable CLI assumptions.

### Error
`vercel logs --since 10m` returned `The --follow flag does not support filtering`; local shell also lacked GNU `timeout`.

### Context
Vercel CLI log streaming on this Mac should be bounded with a small Python `subprocess` timeout rather than GNU `timeout` or `--since` filtering.

### Suggested Fix
Use a Python timeout wrapper for bounded Vercel log checks on macOS.

### Metadata
- Reproducible: yes
- Related Files: deployment verification commands

---

## 2026-04-29 — Missing comma in beta copy edit
- Context: While updating SQC private-beta copy in an isolated worktree, `pnpm lint` failed with `Parsing error: ',' expected` in `src/app/beta/page.tsx`.
- Cause: Manual exact-text replacement removed the comma after a string property in the `betaChecklist` object.
- Fix: Restored the comma and reran checks.
- Prevention: For object-literal copy edits, inspect the edited hunk before running the full build.

## 2026-04-29 — Curl unavailable in SQC deploy smoke shell
- Context: After deploying SQC beta-copy polish, a smoke script using `curl` failed with `zsh: command not found: curl`.
- Fix: Used Python `urllib.request` for HTTP/status/content smoke checks instead.
- Prevention: In this environment, prefer Python HTTP smoke scripts when `curl` availability has not been confirmed.

## 2026-04-29 — Vercel logs CLI rejected `--since`
- Context: Tried to scan recent deployment logs with `vercel logs <deploy-url> --since 10m`.
- Result: Vercel CLI 50.20.0 returned `The --follow flag does not support filtering. Remove: --since`.
- Fix: Use a bounded `timeout` around plain `vercel logs <deploy-url>` for post-deploy watches, or use provider UI/API if time filtering is needed.

## [ERR-20260429-0942] Worktree deploy linked wrong Vercel project

**Logged**: 2026-04-29T09:58:00+02:00
**Priority**: medium

In an isolated CC worktree, `npx vercel --prod --yes` auto-created and deployed to a throwaway Vercel project (`autoburst-20260429-0942`) because `.vercel/project.json` was not the canonical `cc` project link. Corrected by copying `/Users/sam/.openclaw/workspace/cc/.vercel/project.json` into the worktree and redeploying; canonical deploy aliased to `https://sidequestchess.com`.

**Do differently**: before any CC worktree Vercel deploy, verify `.vercel/project.json` contains `"projectName":"cc"` / project `prj_z4w2lp0MV5hJEhc3m7PN2CuH3d5w`.

## [ERR-20260429-001] curl_missing_in_sqc_worktree

**Logged**: 2026-04-29T13:49:00Z
**Priority**: low
**Status**: pending
**Area**: infra

### Summary
Attempted SQC live smoke with `curl`, but this Mac shell reported `command not found: curl`.

### Suggested Action
Use Python urllib or another available HTTP client for smoke checks in this environment instead of assuming curl is installed.

---

## [ERR-20260429-002] sqc_worktree_missing_node_modules

**Logged**: 2026-04-29T13:55:00Z
**Priority**: low
**Status**: pending
**Area**: tests

### Summary
`pnpm lint && pnpm build` failed in a fresh SQC deployment worktree because `node_modules` was not installed, so `eslint` was unavailable.

### Suggested Action
Run `pnpm install --frozen-lockfile` in clean SQC worktrees before local verification, or reuse an already prepared worktree when safe.

---

## [ERR-20260429-001] clean_worktree_missing_node_modules

**Logged**: 2026-04-29T15:50:00Z
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
`pnpm lint` failed in a newly-created clean CC worktree because dependencies were not installed there.

### Error
```text
sh: eslint: command not found
WARN Local package.json exists, but node_modules missing, did you mean to install?
```

### Context
- Command attempted: `pnpm lint && pnpm build`
- Worktree: `.worktrees/beta-retake-guidance`

### Suggested Fix
Run `pnpm install --frozen-lockfile` in clean deployment worktrees before lint/build checks.

### Metadata
- Reproducible: yes
- Related Files: package.json, pnpm-lock.yaml

---

## [ERR-20260429-001] vercel_worktree_auto_link

**Logged**: 2026-04-29T19:42:00+02:00
**Priority**: medium
**Status**: resolved
**Area**: infra

### Summary
A Vercel production deploy from a clean CC worktree auto-linked a temporary project because `.vercel/project.json` was missing.

### Details
The intended target was the canonical `cc` Vercel project / `sidequestchess.com`. Running `vercel --prod --yes` before copying the canonical project link created/deployed `burst-20260429-1742` instead. The canonical deploy was corrected by copying `/Users/sam/.openclaw/workspace/cc/.vercel/project.json` into the worktree and rerunning `vercel --prod --yes`, which aliased `https://sidequestchess.com` correctly.

### Suggested Action
For every isolated CC worktree deploy, copy the canonical `.vercel/project.json` before the first Vercel command, matching the existing workspace TOOLS.md note.

### Metadata
- Source: error
- Related Files: /Users/sam/.openclaw/workspace/TOOLS.md, .vercel/project.json
- Tags: vercel, worktree, deployment

---

## [ERR-20260429-2042] pnpm_lint_missing_node_modules_in_clean_worktree

**Logged**: 2026-04-29T20:43:00+02:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
`pnpm lint` failed in a fresh CC isolated git worktree because `node_modules` was not installed there (`eslint: command not found`).

### Details
Clean worktrees under `cc/.worktrees/*` do not inherit the parent checkout's `node_modules`. Run `pnpm install --frozen-lockfile` before lint/build in a new worktree.

### Suggested Action
For future CC clean-worktree bursts, install dependencies first or verify `node_modules/.bin/eslint` exists before running checks.

### Metadata
- Source: error
- Related Files: package.json, pnpm-lock.yaml
- Tags: pnpm, worktree, lint

---

## [ERR-20260429-2047] vercel_logs_since_flag_unsupported

**Logged**: 2026-04-29T20:47:00+02:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
`vercel logs <deployment-url> --since 5m` failed because this Vercel CLI treats logs as follow-mode by default and does not support filtering with `--since`.

### Details
For quick post-deploy verification in this CC project, use direct route smoke checks as the smallest reliable proof, or inspect Vercel logs without unsupported filters.

### Suggested Action
Do not add `--since` to `vercel logs` in this CLI unless help output confirms support for non-follow filtered logs.

### Metadata
- Source: error
- Related Files: docs/SQC_PRIVATE_BETA_FIRST_WAVE_SCORECARD_LIVE_DEPLOY_2026-04-29.md
- Tags: vercel, logs, deploy-verify

---

## [ERR-20260429-2342] Worktree missing node_modules before lint

**Logged**: 2026-04-29T23:42:00+02:00
**Priority**: low

A fresh isolated git worktree for CC did not have `node_modules`, so `pnpm lint` failed with `eslint: command not found`. Run `pnpm install --frozen-lockfile` in clean worktrees before verification.

## [ERR-20260430-001] cc_worktree_verification_and_deploy_context

**Logged**: 2026-04-30T03:52:00+02:00
**Priority**: medium
**Status**: resolved
**Area**: infra

### Summary
Clean SQC deploy worktree initially had no `node_modules`, and first Vercel deploy auto-linked a throwaway project instead of canonical `cc`.

### Details
- `pnpm lint` failed with `eslint: command not found` because the isolated worktree had not run `pnpm install --frozen-lockfile`.
- `vercel --prod --yes` from the isolated worktree created/deployed project `autoburst-20260430-0342` because `.vercel/project.json` was absent.
- Corrected by installing dependencies, copying `/Users/sam/.openclaw/workspace/cc/.vercel/project.json`, and redeploying to canonical project `cc`.

### Suggested Action
For future SQC isolated worktree deploys, run `pnpm install --frozen-lockfile` before local gates and copy the canonical `.vercel/project.json` before any Vercel deploy.

### Metadata
- Source: error
- Related Files: `.vercel/project.json`, `src/app/result/page.tsx`
- Tags: vercel, worktree, cc, deployment

---

## [ERR-20260430-1448] vercel_logs_since_flag_incompatibility

**Logged**: 2026-04-30 14:48 Europe/Stockholm
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
`vercel logs <deployment-url> --since 30m` failed because this Vercel CLI mode treats logs as a follow stream and does not support `--since` filtering.

### Details
During the SQC challenge-detail proof-path deploy smoke, the deploy and route smoke passed, but the first bounded log scan command exited with: `The --follow flag does not support filtering. Remove: --since`.

### Suggested Action
For bounded Vercel deploy log checks, run `vercel logs <deployment-url>` under an external time-bound wrapper instead of adding `--since`.

### Metadata
- Source: error
- Related Files: docs/SQC_CHALLENGE_DETAIL_FIRST_PROOF_PATH_LIVE_DEPLOY_2026-04-30.md
- Tags: vercel, logs, deploy-smoke

---

## [ERR-20260430-1449] zsh_status_readonly_variable

**Logged**: 2026-04-30 14:49 Europe/Stockholm
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
A retry script assigned to `status` in zsh, which is a read-only shell variable.

### Details
The Vercel log-scan retry used `status=$?` under zsh and failed with `read-only variable: status`.

### Suggested Action
Use `rc` or run small shell control scripts under `bash -lc` when capturing command exit codes in this environment.

### Metadata
- Source: error
- Related Files: docs/SQC_CHALLENGE_DETAIL_FIRST_PROOF_PATH_LIVE_DEPLOY_2026-04-30.md
- Tags: zsh, shell, deploy-smoke

---

## [ERR-20260430-1450] macos_timeout_command_missing

**Logged**: 2026-04-30 14:50 Europe/Stockholm
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
`timeout` is not available by default on this macOS environment.

### Details
A bounded Vercel log-scan retry attempted `timeout 25s vercel logs ...` and failed with `bash: timeout: command not found`.

### Suggested Action
Use a small Node wrapper with `child_process.spawn` and `setTimeout(...kill...)` for bounded stream commands on this Mac.

### Metadata
- Source: error
- Related Files: docs/SQC_CHALLENGE_DETAIL_FIRST_PROOF_PATH_LIVE_DEPLOY_2026-04-30.md
- Tags: macos, shell, bounded-streams

---

## [ERR-20260430-1451] zsh_glob_bracket_path

**Logged**: 2026-04-30 14:51 Europe/Stockholm
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
`git add src/app/challenges/[id]/page.tsx ...` failed in zsh because the bracketed dynamic route segment was interpreted as a glob.

### Details
The first commit attempt failed with `zsh:1: no matches found: src/app/challenges/[id]/page.tsx`.

### Suggested Action
Quote Next.js dynamic route paths in shell commands, e.g. `git add 'src/app/challenges/[id]/page.tsx'`.

### Metadata
- Source: error
- Related Files: src/app/challenges/[id]/page.tsx
- Tags: zsh, nextjs, git

---

## [ERR-20260430-1648] cc_worktree_lint_without_node_modules

**Logged**: 2026-04-30T16:48:00+02:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
`pnpm lint` failed in a fresh isolated CC worktree because `node_modules` was not installed there.

### Details
The command returned `sh: eslint: command not found` with pnpm's missing-node_modules warning. Running `pnpm install --frozen-lockfile` in the worktree resolved it, after which `pnpm lint` and `pnpm build` passed.

### Suggested Action
For clean CC deploy worktrees, run `pnpm install --frozen-lockfile` before lint/build unless dependencies are already present in that worktree.

### Metadata
- Source: error
- Related Files: package.json, pnpm-lock.yaml
- Tags: cc, pnpm, worktree, lint

---

## [ERR-20260430-1651] cc_vercel_log_scan_cli_gotchas

**Logged**: 2026-04-30T16:51:00+02:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
Two bounded Vercel log-scan attempts had CLI/environment gotchas in the CC deploy worktree.

### Details
The local zsh environment did not have GNU `timeout`, and `vercel logs <deployment> --since 10m` failed because this Vercel CLI treats logs as follow-mode and does not support filtering with `--since`. Running `vercel logs <deployment>` with the exec-level timeout streamed from the fresh deployment and emitted no runtime error lines before the bounded timeout killed the stream.

### Suggested Action
For CC deploy proof, use OpenClaw exec/process timeout around plain `vercel logs <deployment>` instead of shell `timeout` or `--since` filtering.

### Metadata
- Source: error
- Related Files: docs/SQC_CHALLENGE_HUB_PROOF_LOOP_GUIDANCE_LIVE_DEPLOY_2026-04-30.md
- Tags: cc, vercel, logs, smoke

---

## [ERR-20260501-004] SQC smoke assertion drift

**Logged**: 2026-05-01T14:23:00+02:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
A live content smoke assertion expected the older phrase `win one eligible public game`, but the deployed copy says `Win a public game` / `win`. HTTP route smokes had passed; the failure was the assertion string, not the deployment.

### Resolution
Use content markers that match the final shipped copy exactly.

---

## [ERR-20260502-001] clean worktree missing dependencies before verification

**Logged**: 2026-05-02T02:52:00+02:00
**Context**: SQC beta simplification deploy worktree.
**Failure**: `pnpm lint && pnpm build` failed because the isolated git worktree had no `node_modules` (`eslint: command not found`).
**Fix**: Run `pnpm install --frozen-lockfile` in newly-created deploy worktrees before lint/build.

## [ERR-20260502-002] Vercel logs CLI does not accept --since in deployment follow mode

**Logged**: 2026-05-02T03:00:00+02:00
**Context**: SQC post-deploy smoke for `cc-hdwpy0ppc`.
**Failure**: `vercel logs <deployment> --since 10m` failed with `The --follow flag does not support filtering. Remove: --since`.
**Fix**: Use `--no-follow` for filtered historical Vercel log scans, e.g. `vercel logs --environment production --level error --since 10m --no-follow --no-branch --limit 20`.

## [ERR-20260503-001] Git/Vercel worktree deploy pitfalls during SQC burst

**Logged**: 2026-05-03T03:25:00+02:00
**Priority**: medium

During the SQC homepage trust-card burst, `git push` from the dirty main checkout was rejected as non-fast-forward. A follow-up `git pull --rebase --autostash` was blocked by an untracked file that would be overwritten. I switched to a clean worktree from `origin/main`, but initially deployed from it before copying the canonical `.vercel/project.json`, causing Vercel to auto-link/create a temporary `homepage-trust-push` project. I corrected by copying `/Users/sam/.openclaw/workspace/cc/.vercel/project.json` into the worktree and redeploying the canonical `cc` project.

**Do differently**: For SQC isolated worktrees, copy canonical `.vercel/project.json` before any Vercel command, and prefer pushing from a clean `origin/main` worktree when the main checkout has unrelated dirty/untracked files.

## [ERR-20260503-001] Missing node_modules in fresh SQC worktree

**Logged**: 2026-05-03T10:18:00+02:00
**Command**: `pnpm lint && pnpm build`
**Symptom**: `eslint: command not found` because the new Git worktree had no `node_modules` yet.
**Resolution**: Ran `pnpm install --frozen-lockfile` in the worktree, then reran verification.
**Prevention**: For fresh CC/SQC worktrees, install dependencies before lint/build.

## [ERR-20260503-002] vercel_logs_since_filter

**Logged**: 2026-05-03T13:00:00+02:00
**Priority**: low
**Status**: pending
**Area**: infra

### Summary
`vercel logs <deployment> --since 10m` failed because this installed Vercel CLI treats logs as follow-mode and does not support `--since` filtering.

### Error
```text
Error: The --follow flag does not support filtering. Remove: --since
```

### Context
- Command attempted after production deploy for SQC share-kit burst.
- The live smoke had already passed; this was an optional bounded log scan.

### Suggested Fix
Use unfiltered `vercel logs <deployment>` with a short timeout, or another supported Vercel log command syntax for this CLI version.

### Metadata
- Reproducible: yes
- Related Files: docs/SQC_SHARE_KIT_TEN_SECOND_FRIEND_DARE_LOCAL_PROOF_2026-05-03.md

---

## [ERR-20260503-003] macos_timeout_missing

**Logged**: 2026-05-03T13:01:00+02:00
**Priority**: low
**Status**: pending
**Area**: infra

### Summary
The GNU `timeout` command is not available in this macOS shell when trying to bound `vercel logs`.

### Error
```text
zsh:31: command not found: timeout
```

### Context
- Command attempted: `timeout 15 vercel logs <deployment>`
- Environment: Darwin/macOS workspace.

### Suggested Fix
Use Python `subprocess.run(..., timeout=N)` or OpenClaw exec `timeout` parameter instead of relying on GNU `timeout` on macOS.

### Metadata
- Reproducible: yes

---


## [ERR-20260503-004] git_add_absolute_file_outside_repo

**Logged**: 2026-05-03T13:08:00+02:00
**Priority**: low
**Status**: resolved
**Area**: git

### Summary
Tried to `git add` workspace memory from inside the CC worktree, but the memory file is outside the repository.

### Error
```text
fatal: /Users/sam/.openclaw/workspace/memory/2026-05-03.md: is outside repository
```

### Suggested Fix
Commit repo docs separately, and update workspace memory outside the project git operation.

---

## [ERR-20260503-1344] pnpm_lint_missing_node_modules

**Logged**: 2026-05-03T13:44:00+02:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
`pnpm lint` failed in a fresh CC worktree because `node_modules` was missing and `eslint` was not installed locally.

### Resolution
Run `pnpm install --frozen-lockfile` before lint/build in newly-created isolated CC worktrees.

---

## [ERR-20260503-1345] macos_timeout_missing

**Logged**: 2026-05-03T13:45:00+02:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
A bounded Vercel log command used GNU `timeout`, which is not available by default in this macOS/zsh environment.

### Resolution
Use tool-level timeouts/yield windows or native command flags instead of shell `timeout` on this host.

---

## [ERR-20260503-001] vercel_worktree_project_link

**Logged**: 2026-05-03T14:44:00+02:00
**Priority**: medium
**Status**: pending
**Area**: infra

### Summary
An isolated CC worktree deployed to a temporary Vercel project because `.vercel/` did not exist before copying the canonical `project.json`.

### Details
The script used `cp cc/.vercel/project.json WT/.vercel/project.json 2>/dev/null || true`; because `WT/.vercel/` was missing, the copy silently failed. `vercel --prod --yes` then auto-linked and created a new temporary project named after the worktree. The deploy was repeated successfully after `mkdir -p .vercel` and copying the canonical `cc` project link.

### Suggested Action
For CC isolated worktrees, always run `mkdir -p .vercel && cp /Users/sam/.openclaw/workspace/cc/.vercel/project.json .vercel/project.json && cat .vercel/project.json` before any Vercel deploy.

### Metadata
- Source: error
- Related Files: .vercel/project.json, TOOLS.md
- Tags: vercel, worktree, deploy

---

## [ERR-20260503-001] worktree-lint-without-node-modules

**Logged**: 2026-05-03T16:50:00+02:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
Fresh SQC deploy worktrees need `pnpm install --frozen-lockfile` before running lint/build.

### Error
`pnpm lint` failed with `sh: eslint: command not found` because node_modules were not installed in the new worktree.

### Context
- Command attempted first: `pnpm lint && pnpm build`
- Worktree: `cc/.worktrees/autoburst-20260503-1644`

### Suggested Fix
Run `pnpm install --frozen-lockfile` immediately after creating a clean CC worktree, then run lint/build.

### Metadata
- Reproducible: yes
- Related Files: package.json, pnpm-lock.yaml

---

## [ERR-20260503-001] git_push_non_fast_forward_and_vercel_logs_flag

**Logged**: 2026-05-03T19:54:00+02:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
SQC hotfix push from a clean worktree was rejected because `origin/main` advanced after the worktree was created; a Vercel logs command also failed because this CLI treats `--since` as filtering with follow.

### Details
Resolved by fetching/rebasing the single local commit onto current `origin/main`, rerunning `pnpm lint` and `pnpm build`, then pushing successfully. For logs, avoid `vercel logs <deployment> --since ...` in this installed CLI unless using a supported non-following mode.

### Suggested Action
For fast SQC visual hotfixes, fetch immediately before commit/push, and rebase if `origin/main` moves. Use deployment inspect/readiness and route smoke as the primary quick deploy gate when Vercel logs CLI behavior is incompatible.

### Metadata
- Source: command failure
- Related Files: src/app/challenges/page.tsx, src/app/globals.css
- Tags: git, vercel, sqc
---

## [ERR-20260503-001] cc_vercel_logs_and_smoke_assertions

**Logged**: 2026-05-03T21:52:00+02:00
**Priority**: low
**Status**: pending
**Area**: infra

### Summary
During SQC deploy verification, two non-product command checks needed correction: a signed-out smoke assertion expected signed-in copy, and `vercel logs --since` is not supported by the installed CLI.

### Details
The deployed `/challenges/knights-before-coffee` route correctly rendered signed-out `Connect to start`, but the first smoke expected signed-in `Start this bad idea`. The corrected smoke passed. Also, `vercel logs https://sidequestchess.com --since 15m` returned a CLI flag error; a bounded plain `vercel logs` watch emitted no output.

### Suggested Action
For public route smoke checks, assert signed-out copy unless explicitly testing authenticated state. For Vercel log watches in this environment, avoid `--since` with `vercel logs`; use a bounded plain watch or `vercel inspect` plus route smoke instead.

### Metadata
- Source: error
- Related Files: docs/SQC_DARE_DIRECT_ACCEPT_LIVE_DEPLOY_2026-05-03.md
- Tags: vercel, smoke, sqc

---

## [ERR-20260503-001] cc_worktree_verify_missing_node_modules_and_vercel_logs_flags

**Logged**: 2026-05-03T21:00:00Z
**Priority**: low
**Status**: pending
**Area**: infra

### Summary
A clean CC git worktree failed `pnpm lint` before dependencies were installed, and a manual `vercel logs` scan used unsupported/default-follow flags before switching to the project log scan script.

### Details
Fresh worktrees do not share `node_modules`; run `pnpm install --frozen-lockfile` before lint/build. For Vercel 500 checks, prefer `node /Users/sam/.openclaw/workspace/skills/deploy-verify/scripts/vercel-500-scan.mjs --project cc --since 30m` instead of ad-hoc `vercel logs` flags.

### Suggested Action
For future CC deploy proof bursts, bootstrap the worktree with `.vercel/project.json` plus `pnpm install --frozen-lockfile`, then use the existing deploy-verify log scan script for recent 500s.

### Metadata
- Source: error
- Related Files: .vercel/project.json, /Users/sam/.openclaw/workspace/skills/deploy-verify/scripts/vercel-500-scan.mjs
- Tags: cc, vercel, worktree, deploy-proof

---

## [ERR-20260504-001] vercel_logs_since_flag

**Logged**: 2026-05-04T01:00:00Z
**Priority**: low
**Status**: pending
**Area**: infra

### Summary
`vercel logs <deployment> --since 15m` failed because the installed Vercel CLI treats `--since` as unsupported filtering for that command path.

### Error
```text
Error: The --follow flag does not support filtering. Remove: --since
```

### Context
- Command attempted after SQC production deploy smoke: `vercel logs https://cc-nj5q94pjs-andreas-nordenadlers-projects.vercel.app --since 15m`
- The CLI emitted a filtering/follow conflict even though `--follow` was not explicitly passed.

### Suggested Fix
For bounded deploy checks, use an unfiltered short log stream with timeout or the Vercel API/list output if recent filtering is required.

### Metadata
- Reproducible: yes
- Related Files: docs/SQC_PROOF_LOG_RECEIPT_STATE_CLARITY_LIVE_DEPLOY_2026-05-04.md

---

## [ERR-20260504-001] Fresh isolated CC worktree missing node_modules before verification

**Logged**: 2026-05-04T06:49:00+02:00
**Project**: CC / Side Quest Chess
**Command**: `pnpm lint && pnpm build`
**Failure**: `eslint: command not found` because the newly-created isolated worktree had no `node_modules` yet.
**Resolution**: Ran `pnpm install --frozen-lockfile` first, then `pnpm lint` and `pnpm build` passed.
**Prevention**: For fresh CC/SQC worktrees, run/install dependencies before the first lint/build gate.

## [ERR-20260504-002] CC local next-start smoke missing Clerk publishable key

**Logged**: 2026-05-04T06:53:00+02:00
**Project**: CC / Side Quest Chess
**Command**: `pnpm exec next start -p 4294` followed by local curl smoke
**Failure**: Local server booted, but route requests failed because the isolated shell did not have Clerk `publishableKey` env configured.
**Resolution**: Treat local runtime smoke as blocked in this environment; use `pnpm build` plus Vercel production deploy/live smoke where env is configured.
**Prevention**: For SQC authenticated Next routes, prefer deploy/live smoke unless the worktree has Clerk env loaded.

## [ERR-20260504-003] Repeated Vercel logs CLI filter/timeout gotcha during SQC deploy proof

**Logged**: 2026-05-04T07:00:00+02:00
**Project**: CC / Side Quest Chess
**Commands**: `vercel logs <deployment> --since 20m` and `timeout 25 vercel logs ...`
**Failure**: Vercel CLI rejected `--since` because logs streaming does not support filtering; macOS shell also lacked GNU `timeout`.
**Resolution**: Used OpenClaw exec's own timeout around unfiltered `vercel logs <deployment>`; the stream emitted no runtime log lines before the bounded timeout.
**Prevention**: For Vercel post-deploy log watches on this Mac, do not use `--since` or shell `timeout`; rely on tool-level timeout for bounded streams.

## [ERR-20260504-001] worktree_pnpm_lint_missing_node_modules

**Logged**: 2026-05-04T07:52:00+02:00
**Priority**: low
**Status**: pending
**Area**: tests

### Summary
`pnpm lint` failed in a fresh SQC git worktree because dependencies were not installed there.

### Error
```text
sh: eslint: command not found
WARN Local package.json exists, but node_modules missing, did you mean to install?
```

### Context
- Command attempted: `pnpm lint && pnpm build`
- Worktree: `.worktrees/autoburst-first-run`
- Cause: clean worktree did not have its own `node_modules`.

### Suggested Fix
Run `pnpm install --frozen-lockfile` before lint/build in newly-created SQC worktrees.

### Metadata
- Reproducible: yes
- Related Files: package.json, pnpm-lock.yaml

---

## [ERR-20260504-0844] Worktree lint before dependency install

**Logged**: 2026-05-04T06:50:00Z
**Project**: CC / Side Quest Chess
**Command**: `pnpm lint && pnpm build`
**Error**: fresh detached worktree had no `node_modules`, so `eslint` was not found.
**Resolution**: ran `pnpm install --frozen-lockfile` first, then `pnpm lint` and `pnpm build` passed.
**Prevent**: for clean SQC worktrees, run `pnpm install --frozen-lockfile` before lint/build unless `node_modules` is already present.

## [ERR-20260504-001] pnpm_lint_missing_node_modules

**Logged**: 2026-05-04T10:50:00Z
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
`pnpm lint && pnpm build` failed in a fresh CC worktree because `node_modules` was not installed, so `eslint` was unavailable.

### Resolution
Run `pnpm install --frozen-lockfile` before verification in newly-created CC worktrees.

---

## [ERR-20260504-002] sqc_smoke_overasserted_signed_in_content_and_vercel_logs_since

**Logged**: 2026-05-04T10:56:00Z
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
Initial SQC smoke asserted signed-in-only `Active quest` copy from a signed-out `/challenges` request, and `vercel logs --since` is unsupported by the installed CLI.

### Resolution
Use signed-out-visible assertions for unauthenticated smoke checks and run a bounded unfiltered `vercel logs <deployment-url>` check instead.

---

## [ERR-20260504-003] macos_missing_timeout_command

**Logged**: 2026-05-04T10:57:00Z
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
A bounded Vercel log check tried to use GNU `timeout`, which is not available by default on this macOS host.

### Resolution
Use the OpenClaw exec timeout parameter instead of shell `timeout` on macOS.

---

## [ERR-20260504-001] pnpm lint before install in fresh worktree

**Logged**: 2026-05-04T13:52:00+02:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
`pnpm lint && pnpm build` failed in a fresh SQC detached worktree because `node_modules` was not installed and `eslint` was missing.

### Details
Fresh `/private/tmp/sqc-burst-20260504-1344` worktree had `package.json` and lockfile but no dependencies. The correct retry path is `pnpm install --frozen-lockfile` before local verification.

### Suggested Action
For SQC clean/deploy worktrees, run `pnpm install --frozen-lockfile` before lint/build unless dependency presence has already been verified.

### Metadata
- Source: error
- Related Files: package.json, pnpm-lock.yaml
- Tags: pnpm, worktree, verification

## [ERR-20260504-002] vercel logs --since unsupported by installed CLI mode

**Logged**: 2026-05-04T13:57:00+02:00
**Priority**: low
**Status**: pending
**Area**: infra

### Summary
SQC deploy smoke routes passed, but `vercel logs <deployment> --since 30m` failed because this Vercel CLI treats the command as follow-mode and says `--follow` does not support filtering.

### Details
The command emitted: `Error: The --follow flag does not support filtering. Remove: --since`. This made the combined smoke/log command exit non-zero even though HTTP route assertions were green.

### Suggested Action
For SQC deploy checks with the current Vercel CLI, use a supported logs invocation (for example bounded `vercel logs <deployment>` with timeout/no `--since`) or project log scripts instead of assuming `--since` works.

### Metadata
- Source: error
- Related Files: .vercel/project.json
- Tags: vercel, deploy-verify, logs

## [ERR-20260504-003] GNU timeout unavailable on macOS shell

**Logged**: 2026-05-04T13:58:00+02:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
A deploy log retry used `timeout`, but this macOS environment does not provide GNU `timeout` by default.

### Details
The shell emitted `zsh: command not found: timeout`. Use the OpenClaw exec tool's `timeout` parameter instead of shell-level `timeout` on this host.

### Suggested Action
Prefer tool-managed command timeouts for bounded commands in macOS worktrees.

### Metadata
- Source: error
- Tags: macos, shell, verification

## [ERR-20260504-001] `curl` unavailable on SQC smoke-check host

**Logged**: 2026-05-04T15:44:00+02:00
**Priority**: low

During SQC live deploy smoke verification, a shell smoke script failed because `curl` is not installed in this OpenClaw runtime (`zsh: command not found: curl`). Retried successfully with a Python `urllib.request` smoke script instead.

**Do differently**: prefer Python/Node HTTP checks in this workspace unless `curl` availability has been verified first.

## [ERR-20260504-001] pnpm_lint_missing_node_modules_in_clean_worktree

**Logged**: 2026-05-04T16:50:00+02:00
**Priority**: low
**Status**: handled
**Area**: tests

### Summary
`pnpm lint` failed in a freshly-created isolated CC worktree because `node_modules` was absent there.

### Details
The worktree checkout was clean from `origin/main`; dependencies were not installed in that worktree, so `eslint` was not available.

### Suggested Action
Run `pnpm install --frozen-lockfile` before lint/build in isolated CC worktrees.

### Metadata
- Source: error
- Related Files: package.json, pnpm-lock.yaml
- Tags: pnpm, worktree, lint

---

## [ERR-20260504-002] vercel_logs_since_filter_unsupported

**Logged**: 2026-05-04T16:52:00+02:00
**Priority**: low
**Status**: handled
**Area**: infra

### Summary
`vercel logs <deployment> --since 10m` failed because this Vercel CLI treats logs as follow-mode and does not support `--since` filtering there.

### Suggested Action
For bounded deploy watches, use a timeout-wrapped `vercel logs <deployment>` stream and scan captured output instead of adding `--since`.

### Metadata
- Source: error
- Tags: vercel, logs, deploy-smoke

---

## [ERR-20260504-003] macos_timeout_not_available

**Logged**: 2026-05-04T16:53:00+02:00
**Priority**: low
**Status**: handled
**Area**: infra

### Summary
`timeout` was not available in the macOS zsh environment while trying to bound a Vercel log watch.

### Suggested Action
Use the OpenClaw exec tool's `timeout` parameter for bounded long-running commands on this host instead of shelling out to GNU `timeout`.

### Metadata
- Source: error
- Tags: macos, shell, vercel

---

## [ERR-20260504-001] git push non-fast-forward

**Logged**: 2026-05-04T19:20:00+02:00
**Priority**: low
**Status**: resolved
**Area**: git

### Summary
Push from detached SQC worktree was rejected because origin/main advanced after the local commit.

### Resolution
Fetch/rebase or cherry-pick onto updated origin/main before pushing detached worktree commits.

---

## [ERR-20260504-001] isolated_worktree_missing_dependencies

**Logged**: 2026-05-04T20:52:00+02:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
`pnpm lint && pnpm build` failed in a fresh SQC git worktree because `node_modules` was not installed there.

### Resolution
Ran `pnpm install --frozen-lockfile`, then `pnpm lint` and `pnpm build` passed.

---

## [ERR-20260504-002] vercel_logs_prod_option

**Logged**: 2026-05-04T20:52:00+02:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
`vercel logs cc --prod --since 30m` failed because the installed Vercel CLI does not support `--prod` for logs.

### Resolution
Used `vercel logs --environment production --since 30m --status-code 500 --no-branch --limit 20`, which returned no logs.

---

## [ERR-20260504-003] vercel deploy daily limit

**Logged**: 2026-05-04T20:11:00+02:00
**Priority**: medium
**Status**: blocked
**Area**: deploy

### Summary
Vercel production deploy failed with free-tier daily deployment limit: `Resource is limited - try again in 24 hours (more than 100, code: api-deployments-free-per-day)`.

### Impact
Code is committed and pushed to `origin/main`, but this specific change could not be manually deployed immediately.

### Suggested Action
Avoid excessive manual production deploys during tight UI polish loops; batch small visual changes before deploying when possible.

---

## [ERR-20260505-001] Missing Pillow in clean SQC worktree

**Logged**: 2026-05-05T10:31:00+02:00
**Priority**: low

While preparing a transparent logo asset, `python3 -c 'from PIL import Image'` failed because Pillow was not installed in the rollback worktree environment. Used a temporary workspace-local Pillow install under `tmp/pillow` for asset generation, then removed it before commit. For future image processing in SQC, prefer checking image tooling first and keep temporary dependencies out of git.

## 2026-05-05 — Vercel CLI deployed stale CC checkout
- What happened: While updating Clerk live env vars for Side Quest Chess, I ran `vercel --prod` from a local checkout that was 17 commits behind `origin/main`, temporarily aliasing production to an old UI.
- Impact: `sidequestchess.com` briefly served the older quest-hub version while Clerk production keys were fixed.
- Fix: Reset local tracked files to `origin/main`, added `.vercelignore` to exclude local `.worktrees`/tmp clutter, redeployed production, and verified live markers + `pk_live`.
- Do differently: Before any Vercel CLI production deploy, always run `git fetch`, confirm `git status --short --branch` is not behind origin, and prefer deploying clean `origin/main` state. Never treat env-only deploy as safe without checking source revision.

## [ERR-20260505-001] pnpm lint scanned archived worktrees and was killed

**Logged**: 2026-05-05T10:31:00Z
**Priority**: medium

`pnpm lint` ran plain `eslint` from the SQC repo while many archived `.worktrees/**/.next/**` folders existed under the repo. ESLint traversed those generated chunks, emitted many Babel deopt warnings, and was eventually SIGKILLed. Fix: add repo-level global ignores for `.worktrees/**` and `tmp/**` in `eslint.config.mjs` before rerunning `pnpm lint`.

## [ERR-20260505-001] Vercel logs CLI --since incompatibility

**Logged**: 2026-05-05T13:45:00+02:00
**Priority**: low

`vercel logs https://sidequestchess.com --since 30m` failed because the installed Vercel CLI treats logs as follow-mode and does not support filtering with `--since`. For SQC deploy verification, use a supported bounded logs command/help-confirmed syntax or rely on live HTTP/content smokes when log filtering is unavailable.

## [ERR-20260505-001] vercel_logs_since_filter

**Logged**: 2026-05-05T16:31:00+02:00
**Priority**: low
**Status**: pending
**Area**: infra

### Summary
`vercel logs sidequestchess.com --since 30m` failed because this Vercel CLI version reports that `--follow` does not support filtering.

### Details
For SQC deploy smoke checks, the installed Vercel CLI streams logs by default and rejects `--since`. On macOS, GNU `timeout` is also unavailable by default.

### Suggested Action
Use a Python subprocess timeout wrapper around `vercel logs sidequestchess.com` for a short no-error stream check, or use another Vercel API/log drain path for filtered historical logs.

### Metadata
- Source: error
- Tags: vercel, deploy-smoke, macos

---

## [ERR-20260505-001] Vercel logs CLI no longer accepts --since filter

**Logged**: 2026-05-05T20:52:00+02:00
**Priority**: low

During SQC deploy verification, `vercel logs <deployment> --since 5m` failed with: `The --follow flag does not support filtering. Remove: --since`. Treat recent Vercel log scans as CLI-version-sensitive; use a currently supported logs command or Vercel dashboard/API path instead of assuming `--since` works.

## [ERR-20260506-001] image_generate_transparent_background

**Logged**: 2026-05-06T10:48:00+02:00
**Priority**: low
**Status**: pending
**Area**: assets

### Summary
OpenClaw image generation rejected transparent background for the active OpenAI image model.

### Details
`image_generate` returned HTTP 400: “Transparent background is not supported for this model.” Retried with opaque dark background and generated a usable SQC badge asset instead.

### Suggested Action
For badge generation, either use an explicitly transparent-capable provider/model when available or request dark-background artwork and integrate it as an opaque badge asset.

### Metadata
- Source: tool_error
- Related Files: public/badges/v6/proof-loop-test-badge.png
- Tags: image-generation, transparent-background, sqc

---

## [ERR-20260506-002] zsh_glob_dynamic_route_git_add

**Logged**: 2026-05-06T10:58:00+02:00
**Priority**: low
**Status**: pending
**Area**: tooling

### Summary
Unquoted Next.js dynamic route path broke `git add` under zsh.

### Details
`git add src/app/challenges/[id]/page.tsx ...` failed with `zsh: no matches found` because `[id]` was interpreted as a glob.

### Suggested Action
Quote dynamic route paths in shell commands, e.g. `git add 'src/app/challenges/[id]/page.tsx'`.

### Metadata
- Source: command_failure
- Related Files: src/app/challenges/[id]/page.tsx
- Tags: zsh, git, nextjs-dynamic-routes

---

## [ERR-20260506-003] sqc_clerk_public_metadata_limit_refresh_crash

**Logged**: 2026-05-06T11:03:00+02:00
**Priority**: high
**Status**: fixed
**Area**: backend

### Summary
SQC Refresh crashed after repeated proof checks because Clerk public metadata exceeded 8KB.

### Details
Production logs showed `form_param_exceeds_allowed_size`: `public_metadata` exceeded 8192 bytes. The latest-game checker appended full receipt summaries on every refresh.

### Suggested Action
Keep public metadata compact. Store only a bounded number of recent attempts and trim long receipt summaries before `updateUserMetadata`.

### Metadata
- Source: production_error
- Related Files: src/app/actions.ts
- Tags: clerk, metadata-limit, server-action, sqc

---

## [ERR-20260506-004] local_image_background_removal_missing_tools

**Logged**: 2026-05-06T11:14:00+02:00
**Priority**: low
**Status**: fixed
**Area**: assets

### Summary
Initial local background-removal attempts failed because Python lacked Pillow and Swift could not compile against the installed SDK/toolchain.

### Details
`python3` raised `ModuleNotFoundError: No module named 'PIL'`. A Swift/CoreGraphics script failed with SDK/compiler mismatch errors. A temporary workspace-local venv with Pillow succeeded and avoided adding a project dependency.

### Suggested Action
For one-off image processing, prefer a workspace-local temporary venv (`tmp/imgvenv`) rather than changing project dependencies. Consider installing/standardizing an image tool if this becomes frequent.

### Metadata
- Source: command_failure
- Related Files: public/badges/v6/proof-loop-test-badge.png
- Tags: image-processing, pillow, swift-toolchain

---

## [ERR-20260506-001] zsh_bracket_route_git_add

**Logged**: 2026-05-06T23:02:00+02:00
**Priority**: low
**Status**: resolved
**Area**: tooling

### Summary
A `git add` command failed because zsh expanded an unquoted Next.js dynamic route path containing `[token]`.

### Error
```text
zsh:1: no matches found: src/app/api/og/proof/[token]/route.tsx
```

### Context
- Attempted to add `src/app/api/og/proof/[token]/route.tsx` without quotes.
- Retried with the path quoted and the commit/deploy continued successfully.

### Suggested Fix
Always quote Next.js dynamic route paths with brackets when using zsh, e.g. `'src/app/api/og/proof/[token]/route.tsx'`.

### Metadata
- Reproducible: yes
- Related Files: src/app/api/og/proof/[token]/route.tsx

---

## [ERR-20260506-002] web_search_rate_limit_during_sqc_review

**Logged**: 2026-05-06T23:34:00+02:00
**Priority**: low
**Status**: pending
**Area**: research

### Summary
Parallel Brave web searches can hit the provider free-plan rate limit during research-heavy reviews.

### Error
```
Brave Search API error (429): rate limit exceeded for plan
```

### Context
- Occurred during SQC external product/market review while issuing multiple web_search calls in parallel.
- The review continued using the successful first search result and direct web_fetch calls to known competitor/market pages.

### Suggested Fix
For research tasks, avoid parallel web_search bursts against Brave. Use one search, then direct web_fetch on known/selected sources or space searches out.

### Metadata
- Reproducible: yes
- Related Files: docs/research/sqc-review-2026-05-06/SQC_EXTERNAL_PRODUCT_REVIEW_2026-05-06.md

---

## [ERR-20260506-003] playwright_browser_missing_for_one_off_screenshots

**Logged**: 2026-05-06T23:35:00+02:00
**Priority**: low
**Status**: resolved
**Area**: tooling

### Summary
One-off `npx playwright screenshot` failed because the Playwright browser binary was not installed in the local cache.

### Error
```
Executable doesn't exist at /Users/sam/Library/Caches/ms-playwright/.../headless_shell
Looks like Playwright Test or Playwright was just installed or updated.
```

### Context
- Occurred while capturing live SQC screenshots for a consultant-style product review.
- Resolved by running `npx -y playwright@1.56.1 install chromium`, then rerunning screenshot capture.

### Suggested Fix
For future screenshot-heavy reviews on this host, check/install the Playwright browser once before the first screenshot command.

### Metadata
- Reproducible: unknown
- Related Files: docs/research/sqc-review-2026-05-06/

---

## [ERR-20260507-001] Shell context/path mistakes during SQC proof-image work

**Logged**: 2026-05-07T10:44:30+02:00
**Priority**: low
**Status**: resolved
**Area**: workflow

### Summary
Initial git/file commands were run from the workspace root instead of the cc repo, and one zsh command tried to read a bracketed route path without quoting it.

### Details
`git status` failed outside the repo, and `sed src/app/api/og/proof/[token]/route.tsx` failed because zsh expanded the bracketed segment. Retried from `/Users/sam/.openclaw/workspace/cc` and used the read tool/quoted paths.

### Suggested Action
For Next.js dynamic route files, prefer the read tool or quote paths containing `[token]`. Run repo commands from the actual project root.

### Metadata
- Source: error
- Related Files: src/app/api/og/proof/[token]/route.tsx
- Tags: zsh, nextjs, dynamic-route, cwd

---

## [ERR-20260507-002] Sourcing env file clobbered PATH during production smoke

**Logged**: 2026-05-07T10:48:00+02:00
**Priority**: medium
**Status**: resolved
**Area**: workflow

### Summary
A shell smoke command sourced `.env.production.local`, after which `curl` and `file` were not found because PATH had been changed/cleared by environment loading.

### Details
Retried with a tiny Node parser for env files instead of shell-sourcing them, and used absolute `/usr/bin/curl` and `/usr/bin/file` paths for the smoke command.

### Suggested Action
Do not shell-source project env files in broad smoke scripts. Parse only the specific needed variables or run commands with a preserved PATH.

### Metadata
- Source: error
- Tags: env, path, smoke-test

---

## [ERR-20260507-003] SQC reset could reuse pre-activation latest game

**Logged**: 2026-05-07T11:25:00+02:00
**Priority**: high
**Status**: fixed
**Area**: backend

### Summary
After resetting a completed quest, reactivating the same quest could immediately complete again from the same latest game.

### Details
The reset removed saved completion state, but latest-game verification did not require `completedGameAt` to be after the current quest activation timestamp. The verifier could therefore award the reset quest using a game that had already completed before the new run started.

### Suggested Action
Latest-game and manual-submission verification for repeatable quests must compare proof `completedGameAt` against the active quest `startedAt`; passed checks before activation should become pending with clear copy.

### Metadata
- Source: user_feedback
- Related Files: src/app/actions.ts
- Tags: sqc, reset, verifier, activation-window

---

## [ERR-20260507-004] SQC proof times were not user-timezone aware

**Logged**: 2026-05-07T11:25:00+02:00
**Priority**: medium
**Status**: fixed
**Area**: frontend

### Summary
Proof date/time labels used server/default formatting and did not explicitly account for the user's local timezone.

### Details
The app rendered proof labels server-side with `Intl.DateTimeFormat("en", ...)`, which can hide timezone differences and in some places showed only dates. Added browser-local proof time rendering and passed the browser timezone into generated proof images via `tz` when sharing.

### Metadata
- Source: user_feedback
- Related Files: src/components/proof-time.tsx, src/components/share-proof-actions.tsx, src/app/api/og/proof/[token]/route.tsx
- Tags: sqc, timezone, proof-time

---

## [ERR-20260507-001] SQC scheduled Coming Soon type guard missed unscheduled drafts

**Date**: 2026-05-07
**Command**: `pnpm lint && pnpm build`
**Context**: Adding dated Coming Soon stamps.
**Failure**: TypeScript rejected `ScheduledChallenge[]` because hidden draft Coming Soon entries did not all have `releaseDate`; after making it optional, the filtered array was not narrowed for the card prop.
**Fix**: Keep `releaseDate` optional for draft inventory, filter unscheduled drafts out of the visible queue, and let the card format a safe fallback.

---

## [ERR-20260507-002] PIL unavailable for quick inbound image inspection

**Date**: 2026-05-07
**Command**: Python snippet importing `PIL.Image`
**Context**: Replacing SQC topbar logo from a Telegram image upload.
**Failure**: Local Python did not have Pillow installed (`ModuleNotFoundError: No module named 'PIL'`).
**Fix**: Used macOS `sips` for image metadata/conversion instead of adding a dependency.

---

## [ERR-20260507-003] Tried to git-add workspace memory from inside cc repo

**Date**: 2026-05-07
**Command**: `git add ROADMAP.md .learnings/LEARNINGS.md /Users/sam/.openclaw/workspace/memory/2026-05-07.md`
**Context**: Recording SQC launch candidate scope and daily memory in one shell step.
**Failure**: Git refused the absolute memory path because it is outside the `cc` repository.
**Fix**: Commit only repository files from `cc`; keep workspace memory as an uncommitted workspace note.

---

## [ERR-20260507-004] Account next-step helper allowed undefined active challenge

**Date**: 2026-05-07
**Command**: `pnpm lint && pnpm build`
**Context**: Launch Candidate 1 account next-step module.
**Failure**: TypeScript rejected `activeChallengeRecord` because `Array.find()` can return `undefined`, while the helper expected `Challenge | null`.
**Fix**: Coalesced the lookup with `?? null` before passing it into the next-step helper.

---

## [ERR-20260507-005] zsh globbed Next bracket routes during git add

**Date**: 2026-05-07
**Command**: `git add src/app/challenges/[id]/page.tsx ...`
**Context**: SQC Launch Candidate 1 commit.
**Failure**: zsh interpreted `[id]` as a glob pattern and aborted with `no matches found`.
**Fix**: Quote Next route paths containing brackets, e.g. `git add 'src/app/challenges/[id]/page.tsx'` and `git add 'src/app/sign-in/[[...sign-in]]/page.tsx'`.

---

## [ERR-20260507-006] Vercel logs URL implies follow and rejects --since filtering

**Date**: 2026-05-07
**Command**: `vercel logs sidequestchess.com --since 10m`
**Context**: SQC post-deploy production error scan.
**Failure**: Vercel CLI treated the URL argument as follow mode and returned `The --follow flag does not support filtering`.
**Fix**: For recent filtered project logs, omit the URL/deployment positional argument and use `vercel logs --environment production --level error --since 10m --limit 20 --no-follow`.

---

## [ERR-20260507-007] zsh globbed bracket route in grep path

**Date**: 2026-05-07
**Command**: `grep ... src/app/challenges/[id]/page.tsx ...`
**Context**: SQC quest-detail sharing cleanup verification.
**Failure**: zsh interpreted `[id]` as a glob and printed `no matches found` before the build checks.
**Fix**: Quote bracket route paths in all shell commands, not just `git add`: `grep ... 'src/app/challenges/[id]/page.tsx'`.

---

## [ERR-20260509-001] eas-build-noninteractive-forwarding

**Logged**: 2026-05-09T00:48:00+02:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
`pnpm --filter @sidequestchess/mobile build:android:alpha -- --non-interactive` failed because the package script forwards the extra flag to `eas build` after an unexpected `--` separator.

### Details
The mobile package script already invokes `pnpm dlx eas-cli build --platform android --profile android-alpha`; adding `-- --non-interactive` produced `Unexpected argument: --non-interactive`.

### Suggested Action
For this package script, run `pnpm --filter @sidequestchess/mobile build:android:alpha` directly, or update the script itself if non-interactive behavior becomes required.

### Metadata
- Source: error
- Related Files: apps/mobile/package.json
- Tags: eas, pnpm, expo

---

## [ERR-20260509-002] eas-build-auth-missing

**Logged**: 2026-05-09T00:50:00+02:00
**Priority**: medium
**Status**: blocked
**Area**: infra

### Summary
EAS Android alpha build could not start because the shell has no authenticated Expo account/token available.

### Details
The direct package script reached EAS CLI, but EAS returned: an Expo user account is required; log in with `eas login` or set `EXPO_TOKEN` for CI. No tokens were printed or stored.

### Suggested Action
Before retrying remote APK builds in a fresh OpenClaw shell, ensure Expo auth is available via the local EAS login session or a scoped CI token in the environment.

### Metadata
- Source: error
- Related Files: apps/mobile/package.json, eas.json
- Tags: eas, expo, android-build, auth

---

## [ERR-20260509-001] exec_workdir_omitted

**Logged**: 2026-05-09T00:50:00+02:00
**Priority**: low
**Status**: pending
**Area**: tooling

### Summary
Mobile polish edit script failed because the exec call omitted the `/Users/sam/.openclaw/workspace/cc` workdir and looked for `apps/mobile/App.tsx` from the global workspace.

### Suggested Action
For repo-local scripts in subagents, always set `workdir` explicitly to the assigned project path.

---

## [ERR-20260509-003] zsh_find_glob_nomatch

**Logged**: 2026-05-09T01:34:00+02:00
**Priority**: low
**Status**: resolved
**Area**: tooling

### Summary
A `find` command failed in zsh because the unquoted `app.config.*` pattern was expanded by the shell before `find` could evaluate it.

### Suggested Action
Quote wildcard name predicates in zsh commands, e.g. `-name 'app.config.*'`, especially when running repo discovery commands.

---

## [ERR-20260509-004] react_hooks_set_state_in_effect_mobile_lint

**Logged**: 2026-05-09T01:46:00+02:00
**Priority**: low
**Status**: resolved
**Area**: frontend

### Summary
`pnpm lint` failed on existing mobile `useEffect` bootstrapping because React's lint rule flagged direct setState-triggering calls inside effects.

### Suggested Action
Schedule async bootstraps from effects with a cleanup-friendly timer or refactor to an event/external subscription; re-run lint after touching mobile startup code.

---

## [ERR-20260509-001] expo_export_dlx_wrong_expo_version

**Logged**: 2026-05-09T01:45:00+02:00
**Priority**: medium
**Status**: pending
**Area**: mobile build

### Summary
`pnpm --dir apps/mobile dlx expo export --platform android --output-dir dist-android-pass5` installed Expo 55 outside the app and failed to resolve the local `App` entry.

### Details
For this Expo 54 mobile app, exporting via `pnpm dlx expo` can use a mismatched CLI/runtime cache path. Prefer the project-local Expo CLI: `pnpm --dir apps/mobile exec expo export --platform android --output-dir <dir>`.

### Metadata
- Source: error
- Related Files: apps/mobile/package.json, apps/mobile/App.tsx
- Tags: expo, mobile, export

---

## [ERR-20260509-005] sqc_deploy_guard_dirty_learnings

**Logged**: 2026-05-09T06:58:00+02:00
**Priority**: low
**Status**: resolved
**Area**: deploy

### Summary
`pnpm deploy:prod` was initially blocked because the production deploy guard found a tracked `.learnings/ERRORS.md` modification unrelated to the SQC code slice.

### Error
```
Production deploy blocked: tracked files are modified:
M .learnings/ERRORS.md
```

### Suggested Action
Before SQC production deploys, check for unrelated tracked workspace edits and temporarily stash or resolve them so the guarded deploy can verify a clean `main == origin/main` tree.

### Metadata
- Source: error
- Related Files: scripts/deploy-production-guard.mjs, .learnings/ERRORS.md
- Tags: vercel, deploy-guard, git-status

---
## [ERR-20260509-006] eas_cli_not_logged_in_pre10_mobile_apk

**Logged**: 2026-05-09T08:52:00+02:00
**Priority**: medium
**Status**: pending
**Area**: mobile build

### Summary
Pre-10:00 SQC mobile APK production via EAS was blocked because no Expo/EAS token was present and the CLI reported `Not logged in`.

### Suggested Action
For unattended Android alpha APK builds, provide Expo authentication via `EXPO_TOKEN`/`EAS_TOKEN` or a pre-authenticated EAS session before running `pnpm --dir apps/mobile dlx eas-cli build --platform android --profile android-alpha --non-interactive`. Do not log token values.

### Metadata
- Source: error
- Related Files: apps/mobile/eas.json, apps/mobile/package.json
- Tags: expo, eas, android-apk, auth

---

## [ERR-20260510-001] signed_in_browser_inspection

**Logged**: 2026-05-10T15:49:00+02:00
**Priority**: medium
**Status**: pending
**Area**: tooling

### Summary
Could not inspect SQC signed-in live UI via local automation because headless Playwright lacked installed browser binaries, screenshot capture failed without a usable display, and Chrome AppleScript JavaScript execution is disabled.

### Details
When Andreas asked to log in and inspect the signed-in Group Side Quests page, headless Playwright required missing browser install; using system Chrome worked only signed-out. Attempts to use the local Chrome profile hit GUI/scripting blockers (`screencapture` could not create image from display; Chrome AppleScript JS execution is disabled).

### Suggested Action
For future signed-in UI review, either enable an approved browser automation path with a persistent test account/session, or add a safe local preview mechanism that renders signed-in states without production auth cookies.

### Metadata
- Source: conversation
- Related Files: src/app/groupquests/page.tsx
- Tags: browser-automation, auth, sqc

---

## [ERR-20260510-002] image_generation_transparent_background

**Logged**: 2026-05-10T16:19:00+02:00
**Priority**: low
**Status**: resolved
**Area**: design

### Summary
Image generation with `background: transparent` failed for the active OpenAI image model.

### Details
The first Group Side Quests noble-knights graphic request failed because transparent background was not supported by the selected model. Retried successfully with an opaque dark vignette-friendly background.

### Suggested Action
For this model, request opaque/dark vignette backgrounds unless specifically using a model/provider that supports transparent PNG output.

### Metadata
- Source: tool_error
- Related Files: public/illustrations/group-side-quests-knight-competition.png
- Tags: image-generation, sqc, design

---

## [ERR-20260511-002] local background-removal dependency missing

**Logged**: 2026-05-11T16:00:00+02:00
**Priority**: low

Tried to use Python Pillow (`PIL`) for white-background removal but Pillow is not installed in the project/runtime Python. Recovered by compiling a small CoreGraphics C flood-fill tool to remove edge-connected white background from generated PNGs.

**Fix/Next time**: On this Mac runtime, prefer the existing CoreGraphics C helpers for simple PNG alpha/background processing unless Pillow is explicitly available.

## [ERR-20260511-003] missing directory before route file write

**Logged**: 2026-05-11T19:16:00+02:00
**Priority**: low

Attempted to write `src/app/groupquests/public/page.tsx` before creating the `public/` route directory, causing `no such file or directory`.

**Fix/Next time**: For new Next.js nested routes, create the route directory with `mkdir -p` before redirecting file content.

## [ERR-20260511-004] vercel logs since filter unsupported

**Logged**: 2026-05-11T19:35:00+02:00
**Priority**: low
**Status**: pending
**Area**: infra

### Summary
`vercel logs <deployment> --since 30m` failed because this installed Vercel CLI treats logs as follow-mode and rejects filtering with `--since`.

### Error
```
Error: The --follow flag does not support filtering. Remove: --since
```

### Context
- Attempted post-deploy production log scan for SQC.
- URL smoke checks had already passed.

### Suggested Fix
Use this Vercel CLI's supported log syntax (check `vercel logs --help`) or use a custom Vercel API scan script for recent 500s instead of `--since`.

### Metadata
- Reproducible: yes
- Related Files: scripts/deploy-production-guard.mjs

---

## [ERR-20260511-005] macOS shell lacks GNU timeout

**Logged**: 2026-05-11T19:36:00+02:00
**Priority**: low
**Status**: pending
**Area**: infra

### Summary
Tried to use `timeout` to bound a Vercel log command, but this macOS environment does not have GNU `timeout` installed.

### Error
```
zsh: command not found: timeout
```

### Suggested Fix
Use tool-level `timeout` on `exec`, Vercel `--no-follow`, or a small Python/perl wrapper instead of shell `timeout`.

### Metadata
- Reproducible: yes

---

## [ERR-20260511-006] brittle text replacement missed changed schedule block

**Logged**: 2026-05-11T21:55:00+02:00
**Priority**: low
**Status**: pending
**Area**: frontend

### Summary
A targeted Python replacement for adding the unsaved-exit warning failed because the exact schedule block text had changed.

### Error
```
insert point not found
```

### Suggested Fix
For fast UI iterations, inspect the current nearby source before using exact multiline replacements, or use smaller stable anchors.

### Metadata
- Reproducible: no
- Related Files: src/components/group-quest-draft-builder.tsx

---

## [ERR-20260512-001] next_start_argument_forwarding

**Logged**: 2026-05-12T09:07:00+02:00
**Priority**: low
**Status**: pending
**Area**: infra

### Summary
`pnpm start -- -p 3031` failed because the script forwarded `-p` as a project directory to `next start`.

### Details
Use `pnpm exec next start -p <port>` for local production smoke checks when the package `start` script is `next start`.

### Suggested Action
Prefer `pnpm exec next start -p 3031` in this repo.

---

## [ERR-20260512-002] git_add_outside_repository

**Logged**: 2026-05-12T09:16:00+02:00
**Priority**: low
**Status**: pending
**Area**: workflow

### Summary
Tried to `git add` the workspace memory file from inside the `cc` repository, which failed because the memory file is outside the repository.

### Details
Workspace memory lives at `/Users/sam/.openclaw/workspace/memory/` and should not be added to the project repo from `cc`.

### Suggested Action
Commit project docs from the project repo separately; update workspace memory as an uncommitted workspace note.

---

## [ERR-20260512-003] missing_pillow_for_image_asset_transform

**Logged**: 2026-05-12T10:00:00+02:00
**Priority**: low
**Status**: pending
**Area**: frontend

### Summary
Attempted to generate a silver SQC seal with Python PIL, but Pillow is not installed in the repo/runtime.

### Details
For quick SQC seal recolors, prefer CSS filters on an existing transparent seal asset unless an image-generation/editing pass is specifically needed.

### Suggested Action
Use existing stamp PNG plus `filter: grayscale(...) brightness(...) contrast(...)` for fast visual recolors.

---

## [ERR-20260512-004] swift_image_transparency_toolchain_mismatch

**Logged**: 2026-05-12T10:55:00+02:00
**Priority**: low
**Status**: pending
**Area**: frontend

### Summary
Attempted to use a Swift/CoreGraphics script to remove the white background from an uploaded SQC seal image, but the local Swift toolchain and macOS SDK versions are mismatched.

### Details
Swift failed building Foundation/CoreFoundation modules due SDK/compiler mismatch. Do not rely on ad-hoc Swift image processing in this environment until toolchain is fixed.

### Suggested Action
Use committed provided assets plus CSS blending, or use a dedicated image tool/provider when a true alpha PNG is required.

---

## [ERR-20260512-001] exact_text_edit

**Logged**: 2026-05-12T16:36:00+02:00
**Priority**: low
**Status**: pending
**Area**: frontend

### Summary
Initial scripted edit for removing the participant-summary proof hint used the wrong surrounding block and failed to match.

### Details
The text lived directly under `groupquest-participant-summary-head`, not inside a nested quest title block. Lint/build still ran because the shell command did not stop after the Python script exited non-zero.

### Suggested Action
Use `set -e` or chain commands with `&&` after scripted edits when later checks should only run if the edit succeeds.

### Metadata
- Source: error
- Related Files: src/components/group-quest-participant-summary.tsx
- Tags: shell, exact-match, frontend

---

## [ERR-20260512-002] component_extraction_left_reference

**Logged**: 2026-05-12T16:38:00+02:00
**Priority**: low
**Status**: pending
**Area**: frontend

### Summary
After extracting the group quest leaderboard into a client component, the server page still referenced the removed `leaderboard` constant for participant count.

### Details
`pnpm build` failed typecheck on `leaderboard.length` in the invite summary. Replaced it with the static demo participant count.

### Suggested Action
After extracting constants/components, grep for removed symbol names before running full build.

### Metadata
- Source: error
- Related Files: src/app/groupquests/[id]/page.tsx, src/components/group-quest-leaderboard.tsx
- Tags: refactor, typecheck, frontend

---

## [ERR-20260512-003] component_extraction_second_left_reference

**Logged**: 2026-05-12T16:39:00+02:00
**Priority**: low
**Status**: pending
**Area**: frontend

### Summary
A second server-page reference to the removed `leaderboard` constant remained in the invite preview list after extracting the accepted leaderboard.

### Details
The accepted leaderboard moved into a client component, but the invite onboarding preview still mapped `leaderboard.slice(0, 3)`. Added a dedicated server-safe `leaderboardPreview` constant.

### Suggested Action
Use `grep -R "removedSymbol"` after refactors, not just fix the first build error.

### Metadata
- Source: error
- Related Files: src/app/groupquests/[id]/page.tsx
- Tags: refactor, typecheck, frontend

---

## [ERR-20260512-004] missing_leave_button_css

**Logged**: 2026-05-12T20:47:00+02:00
**Priority**: low
**Status**: pending
**Area**: frontend

### Summary
The leave action rendered with browser default button styling because the intended `groupquest-leave-*` CSS rules were not present in `globals.css`.

### Details
A replacement command expected existing leave-button CSS, but `grep` showed only component classes and no CSS rules. Added explicit SQC-style gold button CSS.

### Suggested Action
After adding new component-specific classes, verify their CSS selectors exist before deploying.

### Metadata
- Source: error
- Related Files: src/components/group-quest-leave-action.tsx, src/app/globals.css
- Tags: css, ui-polish, multiplayer

---

## 2026-05-12 — ROADMAP targeted edit matched repeated verification text
- What happened: A direct `edit` replacement for a ROADMAP verification line failed because the same lint/build sentence appeared three times.
- What to do differently: Include the full surrounding roadmap item block, or use a small scripted replacement keyed by the item title when updating repeated proof text.

## 2026-05-12 — JSX SVG desc apostrophe lint failure
- What happened: `pnpm lint` failed after adding an SVG `<desc>` with `Andreas's` because `react/no-unescaped-entities` also applies inside SVG text nodes.
- What to do differently: Escape apostrophes in JSX/SVG descriptive text (`&apos;`) before running lint/build.

## 2026-05-12 — Transparent image generation and Swift chroma-key fallback failed
- What happened: OpenAI image generation rejected transparent-background requests in this runtime, and a local Swift/CoreGraphics chroma-key helper failed because the installed Swift compiler and macOS SDK versions are mismatched.
- What to do differently: When transparent image generation is unavailable, generate the scroll on a site-matching dark/solid background and use it as the template background directly; avoid relying on local Swift image processing until the toolchain mismatch is fixed.

## 2026-05-12 — ImageResponse requires explicit flex display on multi-child divs
- What happened: Local `/api/og/proof/[token]` smoke returned an empty response. Next logs showed `Expected <div> to have explicit display: flex, display: contents, or display: none if it has more than one child node` for an ImageResponse div containing two spans.
- What to do differently: In `next/og` / `ImageResponse` JSX, every div with multiple child nodes must explicitly set `display` (usually `display: "flex"`). Run a local image smoke after changing OG JSX.

## [ERR-20260513-001] sqc_node_test_chesscom_imports

**Logged**: 2026-05-13T15:28:00+02:00
**Priority**: medium
**Status**: pending
**Area**: tests

### Summary
Running `node --experimental-strip-types --test tests/*.mjs` in SQC fails for Chess.com fixture tests because Node ESM cannot resolve extensionless TS imports from `src/lib/chesscom.ts`.

### Details
The Lichess/direct fixture tests pass, but Chess.com tests that import `src/lib/chesscom.ts` fail with `ERR_MODULE_NOT_FOUND` for `src/lib/pawn-only-picnic` because the TS source uses extensionless imports that Next/Turbopack accepts but raw Node ESM does not.

### Suggested Action
Add a supported test runner/config for TypeScript path/import resolution, or make test-only imports runnable under Node (e.g. explicit `.ts` extensions or tsx/vitest). Do not treat this as verifier logic failure until the runner issue is fixed.

### Metadata
- Source: command failure
- Related Files: tests/*.mjs, src/lib/chesscom.ts, src/lib/pawn-only-picnic.ts
- Tags: sqc, tests, chesscom, esm

---

## [ERR-20260513-002] launch_qa_commonjs_lint

**Logged**: 2026-05-13T15:54:00+02:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
Adding `scripts/launch-qa-local.cjs` initially broke `pnpm lint` because project ESLint forbids `require()` imports.

### Details
The script deliberately uses CommonJS because importing `@clerk/nextjs/server` as ESM from a standalone Node script hit Clerk/Next extensionless import resolution issues. ESLint still scanned `.cjs` and raised `@typescript-eslint/no-require-imports`.

### Suggested Action
For standalone Node QA scripts that must stay CommonJS, add a file-level ESLint disable for `@typescript-eslint/no-require-imports`, or move scripts to ESM only after verifying Clerk standalone imports work.

### Metadata
- Source: command failure
- Related Files: scripts/launch-qa-local.cjs
- Tags: sqc, lint, qa

---

## [ERR-20260513-003] launch_qa_email_collision

**Logged**: 2026-05-13T16:03:00+02:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
Re-running `pnpm qa:launch:local` within the same minute caused Clerk `form_identifier_exists` because the generated QA email only used a minute-level timestamp.

### Details
The QA script generated `sqc.qa.YYYYMMDDHHMM@example.com`; two runs inside the same minute collided.

### Suggested Action
Include seconds plus a short random suffix in generated QA emails for repeatable browser QA runs.

### Metadata
- Source: command failure
- Related Files: scripts/launch-qa-local.cjs
- Tags: sqc, qa, clerk

---

## [ERR-20260513-004] sqc_admin_metadata_stale_check

**Logged**: 2026-05-13T16:17:00+02:00
**Priority**: medium
**Status**: resolved
**Area**: auth

### Summary
SQC analytics admin access was granted in Clerk private metadata, but the deployed dashboard still showed "Admin access needed" for Andreas after re-login.

### Details
The production Clerk user had `privateMetadata.sqcAdmin = true`, so the grant worked. The dashboard was relying on `currentUser()` for access checks, which can reflect session/user data differently than a fresh Clerk backend fetch.

### Suggested Action
For admin gates that depend on freshly changed private metadata, use `auth()` to get `userId` and fetch the user with `clerkClient.users.getUser(userId)` before checking access.

### Metadata
- Source: user_feedback
- Related Files: src/app/admin/analytics/page.tsx
- Tags: sqc, clerk, admin, analytics

---

## [ERR-20260513-005] zsh_dynamic_route_glob

**Logged**: 2026-05-13T16:21:00+02:00
**Priority**: low
**Status**: resolved
**Area**: tooling

### Summary
Creating Next.js dynamic API route folders failed because zsh expanded `[id]` as a glob.

### Details
Unquoted paths like `src/app/api/groupquests/[id]/join` produced `zsh: no matches found`.

### Suggested Action
Always quote dynamic route paths containing square brackets in zsh commands.

### Metadata
- Source: command failure
- Related Files: src/app/api/groupquests/[id]/join/route.ts
- Tags: zsh, nextjs, dynamic-routes

---

## [ERR-20260513-006] sqc_admin_grant_wrong_clerk_instance

**Logged**: 2026-05-13T16:31:00+02:00
**Priority**: high
**Status**: mitigated
**Area**: auth

### Summary
Granting SQC admin with local `.env.production.local` did not affect the deployed app because Vercel production uses a different live Clerk publishable key than local env files.

### Details
`vercel env pull --environment=production` showed the Vercel production publishable key hash differed from local `.env.production.local` / `.env.local`, which are test Clerk keys. The local helper updated the wrong Clerk instance.

### Suggested Action
For production Clerk metadata writes, first verify local env matches Vercel production env. For emergency admin gates, allow a known signed-in email through session/current-user claims and then repair the production secret/admin tooling properly.

### Metadata
- Source: user_feedback
- Related Files: src/app/admin/analytics/page.tsx, src/lib/analytics.ts
- Tags: sqc, clerk, vercel, admin-access

---

## [ERR-20260513-008] next_start_argument_forwarding

**Logged**: 2026-05-13T22:18:00+02:00
**Priority**: low
**Status**: pending
**Area**: tests

### Summary
`pnpm start -- -p 3107` forwarded `-p` as a project directory to `next start` in this repo.

### Details
During SQC mobile verification, the command expanded to `next start -- -p 3107` and Next reported `Invalid project directory provided ... /cc/-p`.

### Suggested Action
Use `pnpm exec next start -p <port>` or set `PORT=<port> pnpm start` for local production-server verification.

### Metadata
- Source: error
- Related Files: package.json
- Tags: nextjs, pnpm, local-verification

---

## [ERR-20260513-009] playwright_browser_cache_missing

**Logged**: 2026-05-13T22:21:00+02:00
**Priority**: low
**Status**: pending
**Area**: tests

### Summary
Repo Playwright package is installed but its managed Chromium cache is missing.

### Details
A local mobile/desktop verification script failed because Playwright could not find `chromium_headless_shell-1223` and suggested `npx playwright install`.

### Suggested Action
For quick local verification on this Mac, launch Playwright with the system Chrome executable at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`; only install Playwright browsers when explicitly needed.

### Metadata
- Source: error
- Tags: playwright, browser, local-verification

---
## [ERR-20260514-001] sqc-mobile-initial-inspection-command

**Logged**: 2026-05-14T08:08:00+02:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
Initial SQC mobile inspection command exited non-zero because it assumed a root `app/` directory exists in the SQC repo; this repo uses `src/app/`.

### Details
While resuming mobile-app work, a broad `find app src ...` command emitted `find: app: No such file or directory` before continuing through `src/`, causing a non-zero exit even though useful files were found.

### Suggested Action
For SQC, search `src/app` directly or guard optional paths with existence checks before combining them in verification commands.

### Metadata
- Source: error
- Related Files: src/app/api/mobile/account/route.ts, apps/mobile/App.tsx
- Tags: sqc, shell, repo-layout

---
## [ERR-20260514-002] git-status-outside-repo-path

**Logged**: 2026-05-14T08:17:00+02:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
`git status` failed when asked to include a workspace memory file from inside the `cc` repository.

### Details
The command mixed repo-relative SQC paths with `/Users/sam/.openclaw/workspace/memory/2026-05-14.md`, which is outside the Git repository at `/Users/sam/.openclaw/workspace/cc`. Git correctly rejected the mixed pathspec.

### Suggested Action
Run repo status only for repo files, and inspect workspace memory files separately when needed.

### Metadata
- Source: error
- Related Files: ROADMAP.md, apps/mobile/App.tsx, memory/2026-05-14.md
- Tags: git, repo-boundary, sqc

---
## [ERR-20260514-003] missing-workdir-for-sqc-mobile-grep

**Logged**: 2026-05-14T08:34:00+02:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
A grep for `apps/mobile/App.tsx` failed because the command ran from the workspace root instead of the `cc` repository.

### Details
The relative path exists under `/Users/sam/.openclaw/workspace/cc`, not the global workspace root. Re-running the same command with `workdir=/Users/sam/.openclaw/workspace/cc` succeeded.

### Suggested Action
For SQC repo-relative paths, always set the exec workdir to `/Users/sam/.openclaw/workspace/cc`.

### Metadata
- Source: error
- Related Files: apps/mobile/App.tsx
- Tags: sqc, workdir, shell

---
## [ERR-20260514-004] vercel-logs-follow-since-conflict

**Logged**: 2026-05-14T08:40:00+02:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
`vercel logs https://sidequestchess.com --since 10m` failed because deployment/URL positional logs imply `--follow`, and this Vercel CLI does not allow filtering while following.

### Details
The CLI returned: `The --follow flag does not support filtering. Remove: --since`. Retried successfully with project/environment filters: `vercel logs --environment production --level error --since 10m --limit 50 --no-follow`.

### Suggested Action
For recent filtered Vercel log scans, do not pass the deployment URL; use project/environment filters plus `--no-follow`.

### Metadata
- Source: error
- Related Files: docs/SQC_MOBILE_USERNAME_SAVE_SLICE_2026-05-14.md
- Tags: vercel, logs, deploy-verify

---
## [ERR-20260514-005] zsh-glob-route-path

**Logged**: 2026-05-14T08:45:00+02:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
A shell inspection command failed on `src/app/challenges/[id]/page.tsx` because zsh treated `[id]` as a glob pattern.

### Details
The command printed `zsh:1: no matches found: src/app/challenges/[id]/page.tsx`. Route paths with square brackets must be quoted or escaped in zsh.

### Suggested Action
Quote Next.js dynamic route paths in shell commands, e.g. `'src/app/challenges/[id]/page.tsx'`.

### Metadata
- Source: error
- Related Files: src/app/challenges/[id]/page.tsx
- Tags: zsh, nextjs, dynamic-routes

---
## [ERR-20260514-006] local-server-not-running-smoke

**Logged**: 2026-05-14T08:50:00+02:00
**Priority**: low
**Status**: resolved
**Area**: tests

### Summary
A local curl smoke for `/api/mobile/quest` failed because no server was running on localhost:3000.

### Details
The command returned `curl: (7) Failed to connect to localhost port 3000`. Starting `pnpm start` after a successful build and retrying produced the expected anonymous 401 JSON.

### Suggested Action
For local route smoke tests, start `pnpm start` (or dev server) first and stop it after the smoke check.

### Metadata
- Source: error
- Related Files: src/app/api/mobile/quest/route.ts
- Tags: local-smoke, nextjs, sqc

---
## [ERR-20260514-007] zsh-parse-error-roadmap-memory-inline

**Logged**: 2026-05-14T08:49:00+02:00
**Priority**: low
**Status**: resolved
**Area**: docs

### Summary
An inline Python/zsh command for recording the SQC mobile screenshot-review preference hit a zsh parse error.

### Details
The first combined command mixed heredoc content and shell quoting poorly and failed before writing the roadmap/memory note. Re-ran as a simpler Python-only block and completed the update.

### Suggested Action
For mixed memory+roadmap edits, prefer one Python heredoc with simple ASCII markers and avoid shell text after complex heredoc content.

### Metadata
- Source: error
- Related Files: ROADMAP.md, memory/2026-05-14.md
- Tags: zsh, heredoc, workflow

---
## [ERR-20260514-008] expo-run-android-mutated-managed-app-and-gradle-java25

**Logged**: 2026-05-14T10:55:00+02:00
**Priority**: medium
**Status**: pending
**Area**: mobile

### Summary
`expo run:android` for SQC mobile generated a local native `android/` directory and temporarily changed mobile package scripts, then local Gradle build failed under Java 25 with `Unsupported class file major version 69`.

### Details
The SQC mobile app is an Expo managed app. `expo run:android --device emulator-5554` prebuilt native files before failing to match the device name. The package script mutation was reverted. The generated `apps/mobile/android/` remains local/untracked for emulator bring-up. Running `./gradlew installDebug` then failed because Gradle/Kotlin did not support Java 25 class files.

### Suggested Action
Use a supported JDK (17 or 21) for local Android builds, and do not commit generated native Expo prebuild output unless intentionally switching workflow. Prefer documenting emulator screenshot scripts that set `JAVA_HOME` explicitly.

### Metadata
- Source: error
- Related Files: apps/mobile/package.json, apps/mobile/android/
- Tags: expo, android, gradle, java

---
## [ERR-20260514-009] eas-build-needs-expo-auth

**Logged**: 2026-05-14T14:36:00+02:00
**Priority**: medium
**Status**: blocked-external-auth
**Area**: mobile-build

### Summary
Attempting to create an Expo/EAS-hosted Android APK link failed because the machine is not logged into an Expo account and no `EXPO_TOKEN` is configured.

### Details
Command: `pnpm --dir apps/mobile dlx eas-cli build --platform android --profile android-alpha --non-interactive`
Result: `An Expo user account is required to proceed. Either log in with eas login or set the EXPO_TOKEN environment variable...`

### Suggested Action
For install links, either configure Expo auth/token on the machine or use a local standalone APK artifact delivered through OpenClaw/Telegram.

### Metadata
- Source: error
- Related Files: apps/mobile/eas.json
- Tags: eas, expo, apk, auth

---
## [ERR-20250518-001] multiplayer-refresh-build-helper-mismatch

**Logged**: 2025-05-18T00:00:00Z
**Priority**: medium
**Status**: in_progress
**Area**: backend

### Summary
Initial multiplayer refresh implementation assumed Lichess latest-game helper exports that do not exist in this codebase.

### Error
```
Turbopack build failed: export checkLatestLichessBishopFieldTrip / related latest-game helpers do not exist in src/lib/lichess.ts
```

### Context
- Attempted to wire multiplayer refresh against per-challenge latest-game helper imports.
- This repo only exposes latest finished-game lookup for Lichess, while most richer challenge checks are game-id based.

### Suggested Fix
Scope multiplayer refresh to supported latest-game verification paths first (finish-any-game), then add provider-specific adapters for other multiplayer quests.

### Metadata
- Reproducible: yes
- Related Files: src/lib/groupquest-proof.ts, src/lib/lichess.ts

---

## [ERR-20260517-001] smoke_check_path_commands

**Logged**: 2026-05-17T14:25:00+02:00
**Priority**: low
**Status**: pending
**Area**: tests

### Summary
SQC production smoke command failed because bare `curl`, `grep`, `wc`, `tr`, and `python3` were unavailable in the shell PATH during one exec session.

### Details
The binaries existed under absolute paths such as `/usr/bin/curl` and `/usr/bin/python3`. Re-running smoke checks with absolute paths succeeded.

### Suggested Action
For important smoke-check one-liners in this environment, prefer absolute `/usr/bin/...` paths or verify PATH first when using core system tools.

### Metadata
- Source: error
- Related Files: none
- Tags: smoke-test, path, shell

---

## [ERR-20260517-002] production_clerk_cleanup_env_mismatch

**Logged**: 2026-05-17T19:08:00+02:00
**Priority**: medium
**Status**: pending
**Area**: infra

### Summary
Local Clerk cleanup scripts did not affect live SQC Multiplayer Quest records because Vercel production used a hidden/different Clerk runtime secret; `vercel env pull` returned an empty `CLERK_SECRET_KEY` value.

### Details
Clearing local/test Clerk metadata reported zero remaining records, but the live `/groupquests/public` page still showed stored production quests. A temporary protected production endpoint, executed inside Vercel runtime, successfully scanned production Clerk users and cleared the live `sqcGroupQuests` records. The endpoint was then removed and redeployed.

### Suggested Action
For future one-off production Clerk metadata cleanup, prefer a short-lived protected production runtime endpoint or server-side maintenance action, then remove it immediately after verification. Do not assume pulled local env values match production runtime secrets.

### Metadata
- Source: error
- Related Files: src/app/api/internal/groupquests/clear-tests/route.ts, src/app/groupquests/public/page.tsx
- Tags: clerk, vercel, production-cleanup, metadata

---

## [ERR-20260517-003] user_browser_attach_unavailable_for_sqc_admin_action

**Logged**: 2026-05-17T20:45:00+02:00
**Priority**: low
**Status**: pending
**Area**: browser-automation

### Summary
Attempting to attach to the existing user Chrome session for an SQC admin-side action failed because Chrome MCP could not find/connect to the user profile DevTools port.

### Details
The browser status reported Chrome running, but `browser.open` with `profile="user"` failed with missing `DevToolsActivePort`. The task continued via production runtime maintenance instead.

### Suggested Action
When existing-login browser automation matters, first verify the user browser is launched with remote debugging/approved attach. If not, use another authenticated/server-side path rather than spending time on repeated browser attach retries.

### Metadata
- Source: browser tool error
- Related Files: none
- Tags: browser, chrome-mcp, user-profile, admin-maintenance

---

## [ERR-20260518-001] eas_android_build_stale_native_dir

**Logged**: 2026-05-18T12:09:42.891061+00:00
**Priority**: high
**Status**: pending
**Area**: mobile | infra

### Summary
EAS Android internal build failed because an ignored local `apps/mobile/android/` native directory was included in the EAS archive and made Gradle resolve stale native modules (`react-native-safe-area-context`, `solana-mobile_mobile-wallet-adapter-protocol`) with no variants.

### Details
The mobile app is configured like a managed Expo app, but the local ignored native Android directory existed and EAS detected/uploaded it. The fix is to exclude generated native/export artifacts from `.easignore` and remove stale local generated native output before rebuilding.

### Suggested Action
Keep `apps/mobile/android/` and `apps/mobile/dist-*` out of EAS archives unless deliberately switching to a committed bare/prebuild workflow.

### Metadata
- Source: error
- Related Files: .easignore, apps/mobile/android
- Tags: eas, expo, android, gradle

---

## [ERR-20260518-002] eas_android_free_plan_quota

**Logged**: 2026-05-18T12:18:38.550957+00:00
**Priority**: medium
**Status**: pending
**Area**: mobile | infra

### Summary
A second EAS Android internal build failed because the Expo account has used its monthly free Android build quota.

### Details
The first post-fix Android build succeeded and produced an installable auth-smoke APK. A follow-up build from the latest proof-receipt-sharing commit was blocked by EAS monthly quota reset timing.

### Suggested Action
Use the successful APK for auth smoke, then either wait for quota reset, upgrade EAS, or build locally after installing a Java runtime/Android build toolchain.

### Metadata
- Source: error
- Tags: eas, quota, android, mobile-release

---

## [ERR-20260518-003] sqc_android_device_crash_missing_clerk_peer

**Logged**: 2026-05-18T13:16:07.256119+00:00
**Priority**: high
**Status**: pending
**Area**: mobile | auth

### Summary
SQC Android APK crashed on Andreas's real device during launch/auth smoke. Local audit found `@clerk/clerk-expo` had an unmet native peer dependency on `expo-crypto`.

### Details
`expo-doctor` passed, but Clerk's package peer list includes `expo-crypto >=12`; the mobile package did not declare it directly. Added SDK-compatible `expo-crypto@~15.0.9`, verified TypeScript/lint/export, and built a local debug APK successfully with Java/Android SDK env vars.

### Suggested Action
Keep Clerk Expo native peers explicit in `apps/mobile/package.json`; for crash reports, produce a local debug APK when EAS quota is exhausted.

### Metadata
- Source: error
- Related Files: apps/mobile/package.json, pnpm-lock.yaml
- Tags: android, clerk, expo, crash

---

## [ERR-20260518-004] expo-doctor-not-on-mobile-path

**Logged**: 2026-05-18T18:36:00+02:00
**Priority**: low
**Status**: pending
**Area**: mobile tooling

### Summary
`pnpm exec expo-doctor` failed from `apps/mobile` because `expo-doctor` was not available on that package path.

### Details
During the SQC mobile website-workflow navigation redesign verification, `pnpm exec expo-doctor` in `apps/mobile` returned `Command "expo-doctor" not found`. Previous successful doctor checks used the repo/tooling context with `pnpm dlx expo-doctor` or equivalent.

### Suggested Action
For mobile doctor checks, prefer `pnpm dlx expo-doctor` from `apps/mobile` or add an explicit package script/dependency if we want `pnpm exec expo-doctor` to be stable.

### Metadata
- Source: error
- Related Files: apps/mobile/package.json
- Tags: expo, mobile, verification

---

## [ERR-20260518-005] partial-function-removal-left-type-tail

**Logged**: 2026-05-18T19:56:00+02:00
**Priority**: low
**Status**: pending
**Area**: frontend

### Summary
A scripted removal of `HeroCoatPreview` left the function parameter/type tail behind and temporarily broke TypeScript parsing.

### Details
While removing a non-web coat strip from `apps/mobile/App.tsx`, the helper removal script did not match the function declaration fully, leaving `: { challenges: MobileChallenge[] }) { ... }` in the file. `pnpm --filter @sidequestchess/mobile typecheck` caught it immediately.

### Suggested Action
After scripted function removals in TSX, run a quick grep/read around the edited boundary before running broader checks, or use a parser-aware edit when possible.

### Metadata
- Source: error
- Related Files: apps/mobile/App.tsx
- Tags: tsx, scripted-edit, mobile

---

## [ERR-20260519-001] Playwright package present but bundled browser missing

**Logged**: 2026-05-19T08:40:00+02:00
**Context**: Regenerating SQC mobile screenshots for bottom safe-area QA.
**What happened**: `chromium.launch()` failed because Playwright's cached Chromium headless shell was not installed.
**Fix/workaround**: Launch Playwright with the system Chrome executable path: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`.
**Impact**: Screenshots succeeded after the workaround.

## [ERR-20260519-001] vercel_logs_follow_filter_default

**Logged**: 2026-05-19T07:00:00Z
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary
Initial SQC daily ops log scan used `vercel logs sidequestchess.com --since 24h --limit 50`, which implicitly enabled follow mode for a deployment/domain target and rejected filtering.

### Error
```
Error: The --follow flag does not support filtering. Remove: --since, --limit
```

### Context
- Command attempted during SQC daily three-lane report production log scan.
- Vercel CLI 50.20.0 treats positional URL/deployment log targets as streaming unless `--no-follow` is provided.

### Suggested Fix
Use linked-project filters without a positional URL, or include `--no-follow` when filtering historical logs, e.g. `vercel logs --environment production --since 24h --level error --no-follow --limit 50 --json`.

### Metadata
- Reproducible: yes
- Related Files: docs/SQC_DAILY_THREE_LANE_REPORT_2026-05-19.md

### Resolution
- **Resolved**: 2026-05-19T07:00:00Z
- **Notes**: Re-ran the log scan with `--no-follow`; 500/502/503/504 filtered scans completed with no entries.

---

## [ERR-20260519-002] browser_user_profile_devtools_port_missing

**Logged**: 2026-05-19T07:00:00Z
**Priority**: low
**Status**: pending
**Area**: infra

### Summary
During the SQC daily ops report, `browser status` reported the user Chrome profile as running/CDP-ready, but `browser tabs` could not attach because the Chrome DevToolsActivePort file was missing.

### Error
```
Error: Could not connect to Chrome. Check if Chrome is running.
Cause: Could not find DevToolsActivePort for chrome at /Users/sam/Library/Application Support/Google/Chrome/DevToolsActivePort
```

### Context
- Attempted to use the existing user browser profile only to see whether authenticated `/admin/analytics` data was accessible.
- Unauthenticated HTTP check still verified `/admin/analytics` is reachable, but data was not visible in the sampled HTML.

### Suggested Fix
Restart or reattach the user Chrome session with remote debugging enabled before using `profile="user"` browser automation for authenticated checks.

### Metadata
- Reproducible: unknown
- Related Files: docs/SQC_DAILY_THREE_LANE_REPORT_2026-05-19.md

---

## [ERR-20260519-001] sqc_android_local_java_home_sdk_env

**Logged**: 2026-05-19T10:30:00+02:00
**Priority**: low
**Status**: resolved
**Area**: mobile | build

### Summary
Local SQC Android APK build initially failed because `/usr/libexec/java_home` did not see Homebrew Java and `ANDROID_HOME` defaulted to a nonexistent path.

### Details
Use explicit Homebrew paths for local Gradle APK builds on this Mac: `JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home` and `ANDROID_HOME=/opt/homebrew/share/android-commandlinetools`.

### Suggested Action
Persist these Android build env defaults in future SQC mobile build scripts or docs so local APK packaging does not fail before Gradle starts.

### Metadata
- Source: conversation
- Related Files: apps/mobile/android, artifacts/sqc-mobile-test-release-arm64-2026-05-19.apk
- Tags: android, gradle, java, sdk

---

## [ERR-20260519-002] sqc_mobile_account_narrowing_after_native_navigation_edit

**Logged**: 2026-05-19T11:28:00+02:00
**Priority**: low
**Status**: resolved
**Area**: mobile | typescript

### Summary
While removing website-opening mobile button actions, the first typecheck failed because nested handlers lost the authenticated account narrowing.

### Details
`AccountShell` returns early for signed-out accounts, but TypeScript does not safely preserve that narrowing inside nested callbacks unless the signed-in account is captured in a narrowed local constant and used consistently.

### Suggested Action
For SQC mobile account screens, define `const signedInAccount = account` immediately after the `isAuthenticatedAccount(account)` guard and use that inside callbacks/JSX.

### Metadata
- Source: error
- Related Files: apps/mobile/App.tsx
- Tags: react-native, typescript, narrowing

---

## [ERR-20260521-001] sqc-production-deploy-guard

**Logged**: 2026-05-21T07:51:00+02:00
**Priority**: medium
**Status**: pending
**Area**: infra

### Summary
SQC production deploy guard blocked because local `cc` HEAD did not match `origin/main`.

### Details
`pnpm deploy:prod:guard` reported local HEAD `d7bfcb4` while `origin/main` was `5d854c7`, so production deploy was correctly stopped before shipping the mobile auth fix.

### Suggested Action
Before production deploys from `cc`, fetch/sync to `origin/main`, reapply/commit the intended patch, then re-run lint/build and `pnpm deploy:prod:guard`.

### Metadata
- Source: command_failure
- Related Files: scripts/deploy-production-guard.mjs
- Tags: sqc, deploy, guard

---

## 2026-05-21 — Vercel Blob upload unavailable without Blob token/store
Command: `vercel blob put ...`
Result: failed because no Vercel Blob read/write token or linked Blob store was available. For ad-hoc SQC APK delivery, use a Vercel preview deployment with `public/downloads/*.apk` unless a Blob store is explicitly configured.

## [ERR-20260521-001] vercel_logs_filter_follow_default

**Logged**: 2026-05-21T07:05:00Z
**Priority**: low
**Status**: pending
**Area**: infra

### Summary
`pnpm exec vercel logs cc --since 24h` failed because passing a deployment/project positional argument enables follow mode, and Vercel CLI does not support `--since` while following.

### Details
For historical filtered SQC production logs, omit the positional target and use `--environment production --since <window> --no-follow --no-branch` plus filters such as `--status-code 500`, `--level error`, or `--json`.

### Suggested Action
Use: `pnpm exec vercel logs --environment production --status-code 500 --since 24h --no-follow --no-branch --json`.

### Metadata
- Source: error
- Related Files: docs/SQC_DAILY_THREE_LANE_REPORT_2026-05-21.md
- Tags: vercel, logs, sqc

## [ERR-20260522-001] expo_start_host_flag

**Logged**: 2026-05-22T15:31:00+02:00
**Priority**: low
**Status**: resolved
**Area**: frontend

### Summary
Expo web start rejected `--host 127.0.0.1` because Expo expects host mode values like `localhost`.

### Details
While preparing local SQC mobile UI review, `pnpm --dir apps/mobile web -- --port 8088 --host 127.0.0.1` failed with an assertion for `/^(lan|tunnel|localhost)$/`. Retried successfully with `pnpm --dir apps/mobile exec expo start --web --port 8088 --localhost`.

### Suggested Action
For Expo local UI review, use `--localhost` rather than `--host 127.0.0.1`.

---

## [ERR-20260522-002] eas_build_project_not_configured

**Logged**: 2026-05-22T15:34:00+02:00
**Priority**: medium
**Status**: investigating
**Area**: mobile

### Summary
SQC mobile EAS Android build failed in non-interactive mode with `EAS project not configured` despite `extra.eas.projectId` being present in `apps/mobile/app.json`.

### Details
Command: `pnpm --dir apps/mobile dlx eas-cli build --platform android --profile android-alpha --non-interactive`. EAS auth is present (`whoami` returns the expected account), but build refused to run and suggested `eas init`.

### Suggested Action
Run EAS diagnostics from the actual mobile app directory and verify whether EAS is reading `apps/mobile/app.json`; if needed, repair project linkage with `eas init --id <projectId>` or equivalent safe config path.

---

## [ERR-20260522-003] eas_android_free_plan_limit

**Logged**: 2026-05-22T15:36:00+02:00
**Priority**: medium
**Status**: blocked
**Area**: mobile

### Summary
Fresh SQC Android EAS APK build is blocked by Expo Free plan monthly Android build limit.

### Details
After running EAS from the correct `apps/mobile` directory, upload succeeded, but EAS rejected the build because the account has used its Android builds for the Free plan this month. Reset is reported as Mon Jun 01 2026.

### Suggested Action
For immediate native app review, use an existing APK/dev build or Expo Go/tunnel if compatible. For fresh APKs before reset, upgrade Expo plan or build locally after installing Android SDK/device/emulator tooling.

---

## [ERR-20260522-004] expo_run_android_device_serial

**Logged**: 2026-05-22T15:39:00+02:00
**Priority**: low
**Status**: pending
**Area**: mobile

### Summary
`expo run:android --device emulator-5554` did not resolve the ADB serial as a device name.

### Details
The emulator was attached via ADB as `emulator-5554`, but Expo reported `Could not find device with name: emulator-5554`. For this workflow, prefer setting `ANDROID_SERIAL=emulator-5554` or using Gradle/ADB install directly from the generated Android project.

### Suggested Action
Use `ANDROID_SERIAL=emulator-5554 pnpm exec expo run:android` or `./gradlew installDebug` + `adb shell am start ...` for deterministic emulator installs.

---

## [ERR-20260522-001] mobile_typecheck_missing_styles

**Logged**: 2026-05-22T16:36:00+02:00
**Priority**: low
**Status**: resolved
**Area**: frontend

### Summary
SQC mobile typecheck failed after adding new Apple Sports-style Today components because the new `compactStyles` keys were referenced before being defined.

### Resolution
Added the missing style definitions, reran `pnpm --filter @sidequestchess/mobile typecheck`, and confirmed it passed. Follow-up lint/build/emulator verification also passed.

### Metadata
- Source: error
- Related Files: apps/mobile/App.tsx
- Tags: react-native, styles, typecheck

---

## [ERR-20260522-002] mobile_typecheck_invalid_font_weight

**Logged**: 2026-05-22T17:45:00+02:00
**Priority**: low
**Status**: resolved
**Area**: frontend

### Summary
SQC mobile typecheck failed during Apple Sports utility pass because React Native `fontWeight` does not accept `"850"`.

### Resolution
Changed the value to the supported `"800"`, reran mobile typecheck and lint, and both passed.

### Metadata
- Source: error
- Related Files: apps/mobile/App.tsx
- Tags: react-native, typecheck, styles

---

## [ERR-20260522-003] partial_replace_script_missing_exact_block

**Logged**: 2026-05-22T18:12:00+02:00
**Priority**: low
**Status**: resolved
**Area**: frontend

### Summary
A quick Python replacement script for removing SQC mobile row action/status noise failed because one exact string did not match the current file.

### Resolution
Inspected matching lines with `grep`, then used targeted `edit` replacements for the actual blocks.

### Metadata
- Source: error
- Related Files: apps/mobile/App.tsx
- Tags: edit-script, exact-replacement

---

## [ERR-20260522-004] PIL_unavailable_for_glow_asset

**Logged**: 2026-05-22T18:18:00+02:00
**Priority**: low
**Status**: resolved
**Area**: mobile-assets

### Summary
Tried to generate a proper SQC mobile Coat of Arms glow PNG using Python Pillow, but Pillow is not installed in the environment.

### Resolution
Generated the transparent RGBA PNG manually with Python stdlib (`struct` + `zlib`) instead.

### Metadata
- Source: error
- Related Files: apps/mobile/assets/ui/coat-glow.png
- Tags: image-generation, python, mobile-assets

---

## [ERR-20260522-005] expo_run_android_unknown_clear_arg

**Logged**: 2026-05-22T18:24:00+02:00
**Priority**: low
**Status**: resolved
**Area**: mobile-dev

### Summary
Tried `pnpm exec expo run:android --clear` while checking SQC mobile glow asset changes, but this Expo command does not accept `--clear`.

### Resolution
Reran `expo run:android` without `--clear`; asset cache busting was handled by using a new versioned asset filename.

### Metadata
- Source: error
- Related Files: apps/mobile/App.tsx, apps/mobile/assets/ui/coat-glow-website-v2.png
- Tags: expo, android, cli

---
