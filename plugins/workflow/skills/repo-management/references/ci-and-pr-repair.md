# CI And PR Repair
Use this reference when watching checks, fixing failing CI, or making an existing PR merge-ready.

## Identify The Target
For the current branch:

```bash
gh pr view --json number,title,url,isDraft,baseRefName,headRefName,mergeable,mergeStateStatus,reviewDecision,statusCheckRollup
```

For a numbered PR:

```bash
gh pr view <number> --json number,title,url,state,isDraft,baseRefName,headRefName,headRepositoryOwner,author,mergeable,mergeStateStatus,reviewDecision,reviewRequests,statusCheckRollup,latestReviews,commits
```

Stop if the PR is closed or merged.

## Check Out A PR Safely
If local changes exist, create or use a clean worktree before checking out the PR.

```bash
gh pr checkout <number>
git status --short --branch
```

If checkout lands detached, create a local branch matching the PR head name.

## Merge Readiness Checklist
Work through these in order:

1. Branch is checked out and local state is clean.
2. Branch is synced with the base branch according to repo convention.
3. Mergeability is not conflicting or dirty.
4. Relevant local validation passes or is clearly skipped for an environmental reason.
5. Required CI checks are green.
6. Draft state, required reviews, and unresolved conversations are handled or reported.
7. Any fix commits are signed, attributed as required, pushed, and watched.

Do not merge unless the user explicitly asks.

## Watch CI
Prefer `gh pr checks` for PRs:

```bash
gh pr checks <number> --required --watch --fail-fast
gh pr checks <number>
```

For branch runs:

```bash
gh run list --branch "$(git branch --show-current)" --limit 1 --json databaseId,status,conclusion,name
gh run watch <run-id> --exit-status
```

Use actual watch commands rather than sleep loops.

## Diagnose Failures
Find failed jobs:

```bash
gh run view <run-id> --json jobs --jq '.jobs[] | select(.conclusion == "failure") | {name, conclusion}'
gh run view <run-id> --log-failed
```

Trim large logs to the failure section. Classify the failure:

- Lint or format.
- Type checking.
- Unit/integration test.
- Build/package.
- Missing secret, service, simulator/device, or other local/CI environment.
- Flaky infrastructure.

## Fix Loop
1. Reproduce locally with the smallest relevant command.
2. Fix the root cause, not just the assertion text.
3. Re-run the failing check locally.
4. Commit and push the fix.
5. Watch the new CI run.

For flaky infrastructure failures, rerun failed jobs once:

```bash
gh run rerun <run-id> --failed
```

If the same check fails again, treat it as real.

Stop after three failed fix attempts on the same check and report the blocker with logs and what was tried.

## Review And Conversation Blockers
```bash
gh pr view <number> --json reviewDecision,latestReviews,reviewRequests
```

- `APPROVED`: review is clear.
- `CHANGES_REQUESTED`: read and address clear requested changes.
- `REVIEW_REQUIRED`: report as a remaining blocker unless self-merge is allowed.
- Pending reviewers are informational unless branch rules require them.

Check unresolved review threads when available:

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

Resolve conversations only when the underlying issue has actually been addressed.
