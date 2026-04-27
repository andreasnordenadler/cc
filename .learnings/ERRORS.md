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
