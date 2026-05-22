---
name: preparing-prs-to-merge
description: Gets an existing GitHub pull request ready to merge when the user gives only a PR number. Checks out the PR, inspects mergeability, resolves or reports conflicts, syncs with the base branch, runs appropriate local validation, watches CI until green, handles draft/review/conversation blockers, pushes fixes when needed, and reports the exact remaining merge blockers. Use when the user asks to get a PR ready to merge, prepare a PR for merge, make PR #123 mergeable, or verify whether a PR can be merged.
allowed-tools: Read Bash Glob Grep Edit Agent AskUserQuestion
---

# Preparing PRs To Merge
Use this when the user gives a PR number and wants the PR ready to merge. Assume the current repository is the target repo unless the PR lookup fails.

Do not merge the PR unless the user explicitly asks for that. The job is to make the PR merge-ready and report the exact state.

## Inputs
Expected input: a PR number, for example `123` or `PR #123`.

If the user gives only a number:

1. Confirm you are inside a GitHub-backed git repo.
2. Infer `owner/repo` from `origin`.
3. Use `gh pr view <number>` and continue.

Ask for more information only when the current directory does not identify a GitHub repo or the PR number does not exist there.

## Starting State
Before touching the branch:

```bash
git status --short
```

If there are local changes, do not overwrite them. If they are unrelated and the repo supports worktrees, create or use a clean worktree. Otherwise stop and ask how to handle them.

Fetch the latest remote state:

```bash
git fetch --all --prune
```

Read the PR:

```bash
gh pr view <number> --json number,title,url,state,isDraft,baseRefName,headRefName,headRepositoryOwner,author,mergeable,mergeStateStatus,reviewDecision,reviewRequests,statusCheckRollup,latestReviews,commits
```

Stop immediately if the PR is closed or merged. Report that there is nothing to prepare.

## Checklist
Work through this checklist in order. Keep going until the PR is merge-ready or a blocker needs the user's judgment.

### 1. Check Out The PR
```bash
gh pr checkout <number>
```

After checkout, confirm:

```bash
git branch --show-current
git status --short
```

If checkout lands in a detached state, create a local branch matching the PR head name.

### 2. Handle Draft State
If `isDraft` is true:

- Continue preparing the branch.
- Do not mark it ready for review unless all checks pass and the user's request clearly implies readiness.
- If leaving it as draft, report draft state as a remaining blocker.

### 3. Sync With The Base Branch
Fetch the base branch:

```bash
git fetch origin <baseRefName>
```

Determine whether the PR branch is behind:

```bash
git log --oneline HEAD..origin/<baseRefName>
```

If the branch is behind, update it using the repo's established pattern:

- Prefer the repo's documented convention from `AGENTS.md`, `CONTRIBUTING.md`, or existing branch history.
- If no convention is clear, rebase local PR branches and merge upstream branches from forks only when rebasing would rewrite another contributor's branch unexpectedly.
- Resolve trivial conflicts yourself: generated files, formatting-only conflicts, import ordering, changelog placement, lockfile refreshes.
- Stop for semantic conflicts where both sides changed behavior and the correct result is not obvious.

After resolving conflicts:

```bash
git status --short
```

Commit conflict resolutions with a signed, co-authored commit if the repo requires signed commits.

### 4. Check GitHub Mergeability
Refresh the PR state:

```bash
gh pr view <number> --json mergeable,mergeStateStatus
```

Interpret blockers:

- `mergeable: CONFLICTING` or `mergeStateStatus: DIRTY` means conflicts remain.
- `mergeStateStatus: BEHIND` means the branch still needs base updates if the repo requires up-to-date branches.
- `mergeStateStatus: BLOCKED` usually means reviews, conversations, or required checks are blocking merge.
- `UNKNOWN` can be transient; wait briefly and query again before treating it as a blocker.

### 5. Run Local Validation
Inspect the repo and run the checks that fit the project before relying on CI:

- Package scripts: `bun run`, `npm run`, `pnpm run`, `yarn run`
- Common checks: lint, format check, typecheck, test, build
- Language-specific checks: `cargo test`, `go test ./...`, `pytest`, `ruff`, `swift test`, `xcodebuild test`, etc.
- Repo-specific commands from `AGENTS.md`, `CONTRIBUTING.md`, `README.md`, task runners, or CI workflow files.

If a check fails:

1. Diagnose the failure locally.
2. Make the smallest correct fix.
3. Re-run the failing check.
4. Commit and push the fix.

If a check cannot run because of missing secrets, unavailable services, or machine-specific tooling, report it clearly and rely on CI for that part.

### 6. Push Needed Updates
If you changed the branch:

```bash
git push
```

If you rebased and the push is rejected, use:

```bash
git push --force-with-lease
```

Never force-push a branch owned by someone else without checking the PR author/head repository and being explicit about the risk.

### 7. Get CI Green
Watch required checks first:

```bash
gh pr checks <number> --required --watch --fail-fast
```

Then inspect all checks:

```bash
gh pr checks <number>
```

If checks fail, use the `monitoring-ci` skill's diagnose-fix-watch loop:

1. Find the failed run or job.
2. Read the failed logs.
3. Fix lint, type, test, or build failures locally when possible.
4. Push the fix.
5. Watch the new run.

For flaky infrastructure failures, rerun only failed jobs once. If the same check fails again, treat it as real.

### 8. Review And Conversation Blockers
Check review state:

```bash
gh pr view <number> --json reviewDecision,latestReviews,reviewRequests
```

Review readiness:

- `APPROVED` is ready from a review standpoint.
- `CHANGES_REQUESTED` is a blocker; read the requested changes and fix what is clear.
- `REVIEW_REQUIRED` is a remaining blocker unless the repo allows self-merge without approval.
- Pending requested reviewers are not necessarily blockers, but report them.

Check unresolved review threads when GraphQL access is available:

```bash
gh api graphql -f query='
query($owner:String!, $repo:String!, $number:Int!) {
  repository(owner:$owner, name:$repo) {
    pullRequest(number:$number) {
      reviewThreads(first:100) {
        nodes { isResolved path line }
      }
    }
  }
}' -F owner=<owner> -F repo=<repo> -F number=<number>
```

Unresolved threads are blockers unless they are clearly informational and the repo does not require conversation resolution. Do not resolve conversations just to make the checklist pass; resolve only when the underlying issue has actually been addressed.

### 9. Final Merge Readiness Check
Query the final PR state:

```bash
gh pr view <number> --json url,isDraft,mergeable,mergeStateStatus,reviewDecision,statusCheckRollup
gh pr checks <number>
```

The PR is merge-ready only when:

- It is open.
- It is not draft, unless the user explicitly wants it kept draft.
- GitHub reports it as mergeable or has no unresolved conflict state.
- Required CI checks are green.
- Local validation that fits the project has passed or any skipped check is explained.
- Required reviews are approved or no approval is required.
- There are no unresolved required conversations.
- The branch is pushed and up to date with the remote.

## Final Response
Report the result plainly:

- PR URL
- Branch and base branch
- Whether it is merge-ready
- Checks run locally and their results
- CI status
- Fix commits pushed, if any
- Remaining blockers, if any, with the exact owner/action needed

If everything is ready, say that the PR is ready to merge. Do not say you merged it unless you actually did.
