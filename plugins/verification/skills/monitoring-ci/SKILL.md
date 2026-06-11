---
name: monitoring-ci
description: Monitors CI checks on the current branch, diagnoses failures from logs, fixes them (lint, typecheck, test, build), pushes the fix, and re-watches until green. Uses gh run watch for live monitoring and gh run view --log-failed for diagnosis. Use when CI is failing, after pushing to a PR, when the user says "watch CI", "fix CI", "why is CI failing", or proactively after creating a PR or pushing changes.
allowed-tools: Read Bash Glob Grep Edit Agent
---

# Monitoring CI
Watch CI, diagnose failures, fix them, and get the branch to green.

## Current context
- Branch: !`git branch --show-current`
- PR: !`gh pr view --json number,title,url --jq '"\(.url) — \(.title)"' 2>/dev/null || echo "no PR"`
- Latest run: !`gh run list --branch $(git branch --show-current) --limit 1 --json status,conclusion,name,databaseId --jq '.[0] | "\(.name): \(.status) \(.conclusion // "")" + " (ID: \(.databaseId))"' 2>/dev/null || echo "unknown"`

## Decision tree
- What's happening?
  - **No runs exist yet** (just pushed, nothing triggered) -> go to "Watch"
  - **Run in progress** -> go to "Watch"
  - **Run failed** -> go to "Diagnose"
  - **Run succeeded** -> tell the user CI is green, done
  - **User wants to proactively monitor after a push** -> go to "Watch"

## Watch
Start monitoring CI in the background so the user isn't blocked.

### 1. Find the run to watch
If there's a PR, use PR checks. Otherwise find the latest run for the branch:

```bash
gh run list --branch $(git branch --show-current) --limit 1 --json databaseId,status --jq '.[0]'
```

### 2. Watch it
Run this as a **background Bash task**:

```bash
gh run watch <run-id> --exit-status 2>&1; echo "CI_EXIT=$?"
```

This streams live status and exits when the run completes. `--exit-status` makes it return a non-zero exit code on failure.

### 3. React to the result
When the background task completes:

- **Exit code 0** -> CI passed. Tell the user the PR is green.
- **Non-zero exit code** -> CI failed. Go to "Diagnose".

## Diagnose

### 1. Identify failed checks
```bash
gh run view <run-id> --json jobs --jq '.jobs[] | select(.conclusion == "failure") | {name, conclusion}'
```

If working from a PR instead of a run ID:

```bash
gh pr checks --json name,state,link --jq '.[] | select(.state == "FAILURE")'
```

### 2. Read the failure logs
Start with just the failed step output:

```bash
gh run view <run-id> --log-failed 2>&1 | tail -100
```

Trim to the last 100 lines — the error is almost always at the end. Read the output and classify the failure.

### 3. Escalate if needed
If the failure isn't clear from `--log-failed` (e.g., the error references something earlier in the log, or the failed step is a wrapper that calls something else):

```bash
gh run view <run-id> --log --json jobs --jq '.jobs[] | select(.conclusion == "failure") | .name'
```

Then read the full log for that specific job:

```bash
gh run view <run-id> --log 2>&1 | grep -A 50 "<failed step name>"
```

Focus on the section around the error. Don't dump entire logs into context.

### 4. Classify the failure
- **Lint / format error** -> go to "Fix: lint"
- **Type error** -> go to "Fix: typecheck"
- **Test failure** -> go to "Fix: test"
- **Build error** -> go to "Fix: build"
- **Flaky / infrastructure** (timeout, network error, runner issue, rate limit) -> go to "Rerun"
- **Unknown / can't diagnose** -> show the logs to the user and ask for guidance

## Fix: lint
Run the project's linter/formatter locally to reproduce and fix:

1. Check the project for lint tooling — look for `biome.json`, `.eslintrc`, `prettier` config, `ruff.toml`, `Cargo.toml`, etc.
2. Run the linter with auto-fix: `bunx biome check --write .` / `bun lint --fix` / equivalent
3. If auto-fix doesn't cover it, read the error and fix manually
4. Commit with `fix: resolve lint errors` and push
5. Go to "Watch" to monitor the new run

## Fix: typecheck
1. Run the type checker locally: `bunx tsc --noEmit` / equivalent
2. Read the errors and fix them
3. Commit with `fix: resolve type errors` and push
4. Go to "Watch"

## Fix: test
1. Identify which test(s) failed from the CI logs
2. Run the failing test locally to reproduce: `bun test <specific test file>`
3. Read the test and the code it's testing to understand the failure
4. Fix the code or the test — whichever is wrong
5. Re-run the test locally to verify the fix
6. Commit with `fix: resolve test failure in <area>` and push
7. Go to "Watch"

## Fix: build
1. Read the build error from the logs
2. Run the build locally: `bun run build` / equivalent
3. Fix the error — common causes:
   - Missing import/export
   - Dependency not installed
   - Environment variable not set (warn the user, don't add secrets)
   - Incompatible dependency version
4. Commit with `fix: resolve build error` and push
5. Go to "Watch"

## Rerun
For flaky checks or infrastructure failures:

```bash
gh run rerun <run-id> --failed
```

This reruns only the failed jobs, not the entire workflow. Then go to "Watch" to monitor the rerun.

If the same check fails again after a rerun, it's probably not flaky — go to "Diagnose" and treat it as a real failure.

## The fix-watch loop
After pushing a fix, always loop back to "Watch" to monitor the new run. Keep looping until CI is green or you've exhausted what can be fixed automatically.

Track iterations to avoid infinite loops:

- **1st failure** -> diagnose and fix normally
- **2nd failure on the same check** -> the first fix didn't work. Read the new error carefully, it may be a different issue or the fix was incomplete
- **3rd failure on the same check** -> stop and tell the user. Three strikes means this needs human judgment

Different checks failing on different iterations is fine — keep fixing. The 3-strike limit is per check, not total.

## Proactive use
Use this skill proactively:

- After the `creating-prs` skill creates a PR — start watching CI immediately
- After pushing commits to a branch with an open PR
- After pushing a CI fix — watch to confirm it worked

When used proactively, always run the watch in the background so the user can keep working.
