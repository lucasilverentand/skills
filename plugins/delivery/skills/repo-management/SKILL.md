---
name: repo-management
description: "End-to-end repository management: inspect and protect local state, create signed and well-scoped commits, split messy working trees, rebase or merge and resolve conflicts, open GitHub pull requests, repair PRs, watch and fix CI, clean stale branches/worktrees/stashes, and leave repos in a shippable state. Use when the user asks to commit, create a PR, clean up a repo, rebase, resolve conflicts, fix CI, make a PR merge-ready, watch checks, merge or prepare branches, or otherwise manage Git/GitHub repository state."
---

# Repo Management
Use this skill for repository operations that affect Git state, GitHub PRs, CI, branches, worktrees, or stashes. Treat the repository as shared state: inspect first, protect user changes, then carry the work through to the appropriate durable endpoint.

## First Checks
Run these before changing repository state:

```bash
git rev-parse --show-toplevel
git status --short --branch
git worktree list
git remote -v
```

Read repo-local instructions before committing, rebasing, pushing, or opening PRs:

- `AGENTS.md`
- `CLAUDE.md`
- `CONTRIBUTING.md`
- `.github/PULL_REQUEST_TEMPLATE.md`
- Relevant CI workflow files under `.github/workflows/`

If local changes exist, identify whether they belong to the current task. Do not overwrite, reset, or discard user work. Use a new worktree when a PR or branch operation would collide with unrelated local changes.

## Route The Work
- **Safety, branch, signing, and user-change rules**: read [references/safety.md](references/safety.md).
- **Committing or splitting changes**: read [references/commits.md](references/commits.md).
- **Opening a PR or updating an existing branch PR**: read [references/pull-requests.md](references/pull-requests.md).
- **Rebases, merges, cherry-picks, and conflict resolution**: read [references/conflicts.md](references/conflicts.md).
- **Watching CI, diagnosing failures, and making a PR merge-ready**: read [references/ci-and-pr-repair.md](references/ci-and-pr-repair.md).
- **Cleaning a repo after work is done**: read [references/cleanup.md](references/cleanup.md).

Load only the reference files needed for the current request. When a task crosses workflows, keep one active state narrative: what changed, what was validated, what was pushed, and what blockers remain.

## Default Execution Policy
Work to completion when the user asks for a repository outcome:

- A commit request ends with signed, scoped commits and a clean or explained working tree.
- A PR request ends with a pushed branch and PR URL, unless credentials or policy block it.
- A CI repair request ends with green checks or a precise remaining blocker.
- A cleanup request ends on the default branch with stale local state handled or explicitly deferred.

Do not merge PRs, drop stashes with unique work, delete unmerged branches, force-push another contributor's branch, or discard files unless the user asked for that exact action or the repo instructions make it routine and safe.

## Reporting
Report the repository outcome, not a transcript. Include:

- Branch and PR URL when relevant.
- Commits created or pushed.
- Checks run locally and CI status.
- Conflicts resolved or blockers left.
- Any local state intentionally left behind.
