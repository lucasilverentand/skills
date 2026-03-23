---
name: git
description: Git workflow conventions — branching strategy, conventional commits, hunk-level commit organization, conflict handling, history analysis, stashing, tagging, remotes, worktrees, and full repo cleanup. Use for any git operation.
allowed-tools: Read Grep Glob Bash Agent
invocation: /clean-repo
---

# Git

## Current context

- Branch: !`git branch --show-current`
- Status: !`git status --short | head -20`
- Latest tag: !`git describe --tags --abbrev=0 2>/dev/null || echo "no tags"`
- Remotes: !`git remote -v 2>/dev/null | head -6`
- Stash list: !`git stash list --format="%gd: %s (%cr)" 2>/dev/null | head -5`
- Worktrees: !`git worktree list 2>/dev/null`
- Unpushed: !`git log --oneline @{upstream}..HEAD 2>/dev/null || echo "(no upstream)"`

## Decision Tree

- What do you need to do?
  - **Branching** — create, rebase, compare, cleanup → "Branching conventions"
  - **Committing** — write commits, amend, fixup, split, changelog → "Committing conventions"
  - **Clean repo** (`/clean-repo`) — organize messy changes into atomic commits, clean up, push → "Clean Repo"
  - **Conflicts** — resolve merge/rebase conflicts → "Conflict handling"
  - **History** — blame, bisect, archeology, ownership → "History tools"
  - **Cherry-pick** — pick commits, backport fixes → "Cherry-pick"
  - **Stashing / Tagging / Remotes / Worktrees** — use the relevant tools below, Claude knows the git mechanics

---

# Branching conventions

- Name branches: `feat/<desc>`, `fix/<desc>`, `refactor/<desc>`, `chore/<desc>`, `docs/<desc>`
- Branch from `main` for features/fixes; from the release tag for hotfixes
- Validate naming: `tools/branch-naming-check.ts`
- Compare branches: `tools/branch-diff-summary.ts <base> <target>`
- Find stale branches (30+ days): `tools/stale-branches.ts`
- Rebase: prefer `--force-with-lease` over `--force` when pushing rebased branches. Never force-push shared/protected branches.
- Clean merged branches: `git branch -d <name>`, then `git remote prune origin`

---

# Committing conventions

Conventional commit format: `<type>(<scope>): <short description>`

Types:
- `feat` — new capability visible to users or callers
- `fix` — corrects a bug
- `refactor` — restructures code without changing behavior
- `test` — adds or updates tests only
- `docs` — documentation only
- `chore` — tooling, deps, config, CI
- `perf` — performance improvement

Rules:
1. Subject line: imperative mood, lowercase after colon, no period, max 72 chars
2. Scope: optional, use package or module name — `feat(api):`, `fix(auth):`
3. Body: explain *why*, not *what* — the diff shows what
4. Breaking change: `feat!:` + `BREAKING CHANGE:` footer
5. Validate: `tools/commit-lint.ts <message>`

Amend only unpushed commits. If already pushed, make a new `fix:` commit instead.

Fixup workflow: `git commit --fixup=<hash>`, then `git rebase -i --autosquash origin/main`

Split large staged changes: `tools/split-staged.ts`

Generate changelog: `tools/changelog-gen.ts <from-ref> <to-ref>`

---

# Clean Repo

Invoked via `/clean-repo`. **Interactive by default** — present findings before acting, propose actions and wait for confirmation. If the user says "just do it" or "auto", proceed without asking.

## Phases (run in order, skip phases with nothing to do)

### Phase 1: Inventory

1. Run `tools/repo-status.ts --json`
2. Present summary: uncommitted files, unpushed commits, stale worktrees, merged branches, tracking status
3. Ask what to exclude or skip

### Phase 2: Stash WIP

If the user marks changes as not ready: `git stash push -m "WIP: <description>" -- <files>`

### Phase 3: Organize commits

This is the core phase — all uncommitted changes become clean conventional commits.

1. **Analyze**: `tools/change-analyzer.ts --json` — classifies each hunk by commit type, groups into proposed commits
2. **Propose**: present numbered commit plan (type, message, files/hunks). Wait for confirmation. User may merge, reorder, retype, exclude.
3. **Execute** each approved commit:
   - `git reset HEAD`
   - `tools/stage-hunks.ts <commit-index>` to stage specific hunks
   - Create commit with conventional message
   - Report: `created: <short hash> <message>`

Commit type classification:

| Signal | Type |
|---|---|
| New file with feature code | `feat` |
| Bug fix (error handling, null check, off-by-one) | `fix` |
| Code restructure, rename, extract (no behavior change) | `refactor` |
| Test files (`.test.`, `.spec.`, `__tests__/`) | `test` |
| Documentation files (`.md`, `docs/`) | `docs` |
| Config, CI, deps, tooling | `chore` |
| Performance improvement | `perf` |

Scope detection: `packages/<name>/` → scope is `<name>`, `src/<module>/` → scope is `<module>`

### Phase 4: Clean worktrees

Run `tools/worktree-prune.ts`. Remove worktrees whose branches are merged and have no uncommitted changes. Confirm before removing anything with uncommitted work.

### Phase 5: Clean branches

Delete merged branches (`git branch --merged main`) and branches with deleted remotes (`gone]`). Prune: `git remote prune origin`.

### Phase 6: Push

1. Check for unpushed commits
2. Ask: push to current branch, create new branch, or skip
3. Push: `git push -u origin <branch>`

### Final summary

```
Done:
  commits: 3 created (refactor, feat, test)
  worktrees: 2 removed
  branches: 1 deleted
  pushed: main → origin/main (3 commits)
```

---

# Conflict handling

- Resolve lockfile conflicts by regeneration, not manual editing: `tools/lockfile-resolve.ts`
- Forecast conflicts before merging: `tools/conflict-forecast.ts <base> <target>`
- Find recurring conflict hotspots: `tools/conflict-hotspots.ts`
- Prevention: rebase from main frequently, keep branches short-lived

---

# History tools

- Trace a function's history across renames: `tools/code-archeology.ts <file> <pattern>`
- File/directory ownership map: `tools/ownership-map.ts <path>`
- Activity report by author/directory: `tools/activity-report.ts`

---

# Cherry-pick

- Range picks: `tools/cherry-pick-range.ts <start> <end>`
- Backport to release branch: `tools/backport.ts <target-branch> <commit...>`
- Verify if commit was already picked: `git log --cherry-pick --oneline <source>...<target>`

---

# Other operations

- **Stash with descriptive message**: `tools/stash-save.ts` (auto-generates message from changed files)
- **Create semver tag**: `tools/tag-create.ts v1.2.3 --message "Release v1.2.3"` — always annotated for shared tags, push explicitly with `git push origin <tag>`
- **Sync fork with upstream**: `tools/remote-sync.ts`
- **Create worktree**: `tools/worktree-create.ts <branch>`
- **Prune stale worktrees**: `tools/worktree-prune.ts`

---

# Tool reference

| Tool | What it does |
|---|---|
| `tools/branch-diff-summary.ts` | Summarize changes between two branches |
| `tools/branch-naming-check.ts` | Validate branch names against conventions |
| `tools/stale-branches.ts` | List branches with no commits in 30+ days |
| `tools/commit-lint.ts` | Validate commit messages against conventional format |
| `tools/changelog-gen.ts` | Generate changelog from commits between two refs |
| `tools/split-staged.ts` | Suggest splitting staged changes into atomic commits |
| `tools/conflict-forecast.ts` | Detect files likely to conflict between branches |
| `tools/conflict-hotspots.ts` | Report files with most merge conflicts in history |
| `tools/lockfile-resolve.ts` | Auto-resolve lockfile conflicts by regeneration |
| `tools/activity-report.ts` | Summarize commit activity by author and directory |
| `tools/ownership-map.ts` | File/directory ownership map from blame data |
| `tools/code-archeology.ts` | Trace history of a function or code pattern |
| `tools/stash-save.ts` | Smart stash with auto-generated descriptive message |
| `tools/tag-create.ts` | Create tags with semver validation |
| `tools/remote-sync.ts` | Sync a fork with upstream |
| `tools/worktree-create.ts` | Create worktree linked to a branch |
| `tools/worktree-prune.ts` | Detect and remove stale worktrees |
| `tools/repo-status.ts` | Full repository state assessment |
| `tools/change-analyzer.ts` | Hunk-level change analysis and commit type classification |
| `tools/stage-hunks.ts` | Stage specific hunks for a proposed commit group |
| `tools/cherry-pick-range.ts` | Pick a range of commits with per-commit reporting |
| `tools/backport.ts` | Cherry-pick commits onto a release branch |
