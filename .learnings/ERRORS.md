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
