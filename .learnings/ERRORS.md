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
