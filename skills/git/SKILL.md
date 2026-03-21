---
name: git
description: Complete git workflow toolkit — branching, committing (conventional commits, amend, fixup, changelog), conflict resolution, history analysis (blame, bisect, archeology), stashing, tagging (semver), remote management (fork sync, multi-org), worktrees, and full repo cleanup with hunk-level commit organization. Use for any git operation including creating branches, writing commit messages, resolving merge conflicts, tracing code history, managing stashes, creating tags, syncing forks, working with worktrees, or cleaning up a messy repo.
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
  - **Branching** — create, rebase, compare, or clean up branches → go to "Branching"
  - **Committing** — write commits, amend, fixup, split, changelog → go to "Committing"
  - **Conflicts** — resolve merge conflicts, forecast conflicts, lockfile conflicts → go to "Conflicts"
  - **History** — blame, bisect, archeology, ownership, activity → go to "History"
  - **Stashing** — save, restore, inspect, clean up stashes → go to "Stashing"
  - **Tagging** — create tags, semver, push tags, compare releases → go to "Tagging"
  - **Remotes** — add/remove remotes, sync forks, push strategies → go to "Remotes"
  - **Worktrees** — create, list, clean up worktrees → go to "Worktrees"
  - **Clean repo** (`/clean-repo`) — full interactive cleanup: organize messy changes into atomic commits, clean stale branches/worktrees, push → go to "Clean Repo"

---

# Branching

## Decision Tree

- What do you need to do?
  - **Create a new branch** → follow "Creating a branch" below
  - **Rebase a branch** → follow "Rebase workflow" below
  - **Compare two branches** → run `tools/branch-diff-summary.ts <base> <target>`
  - **Clean up merged or stale branches** → follow "Branch cleanup" below
  - **Check branch naming** → run `tools/branch-naming-check.ts`

## Creating a branch

1. Determine the branch type and name it using the convention:
   - `feat/<short-description>` — new feature
   - `fix/<short-description>` — bug fix
   - `refactor/<short-description>` — code refactoring
   - `chore/<short-description>` — tooling, deps, config
   - `docs/<short-description>` — documentation only
2. Branch from the correct base:
   - **Feature or fix** → branch from `main` (or the team's integration branch)
   - **Hotfix on a release** → branch from the release tag
3. Run: `git checkout -b <branch-name>`
4. Validate the name: `tools/branch-naming-check.ts`

## Rebase workflow

1. Fetch latest: `git fetch origin`
2. Check what has diverged: `git log --oneline HEAD..origin/main`
3. Rebase interactively if you need to squash or reorder: `git rebase -i origin/main`
   - **Fixup commits present** → squash them into their parent during the rebase
   - **Only trivial updates** → `git rebase origin/main` (non-interactive)
4. Resolve any conflicts that arise (see the Conflicts section)
5. Force-push only your own branch (never shared/protected branches): `git push --force-with-lease`

## Branch cleanup

1. List stale branches: `tools/stale-branches.ts` — shows branches with no commits in 30+ days
2. Verify a branch is safe to delete:
   - **Already merged into main** → safe to delete
   - **Not merged** → confirm with the user before deleting
3. Delete local: `git branch -d <branch-name>`
4. Delete remote: `git push origin --delete <branch-name>`
5. Prune remote-tracking refs: `git remote prune origin`

---

# Committing

## Decision Tree

- What do you need to do?
  - **Write a commit message for staged changes** → follow "Writing a commit" below
  - **Amend the last commit** → follow "Amending" below
  - **Create a fixup commit to squash later** → follow "Fixup workflow" below
  - **Split large staged changes into atomic commits** → run `tools/split-staged.ts`
  - **Set up pre-commit hooks** → follow "Pre-commit hooks" below
  - **Generate a changelog** → run `tools/changelog-gen.ts <from-ref> <to-ref>`

## Writing a commit

Conventional commit format: `<type>(<scope>): <short description>`

Types:
- `feat` — new capability visible to users or callers
- `fix` — corrects a bug
- `refactor` — restructures code without changing behavior
- `test` — adds or updates tests only
- `docs` — documentation only
- `chore` — tooling, deps, config, CI

Rules:
1. Subject line: imperative mood, lowercase after the colon, no period, max 72 chars
2. Scope is optional but useful for monorepos: `feat(api):`, `fix(auth):`
3. Body (optional): explain *why*, not *what* — the diff shows what
4. Breaking change: add `!` after type, e.g. `feat!:`, and a `BREAKING CHANGE:` footer
5. Validate before pushing: `tools/commit-lint.ts <message>`

## Amending

Use amend only for the most recent commit that has NOT been pushed:
- Fix the staged changes, then: `git commit --amend --no-edit`
- Update the message only: `git commit --amend -m "<new message>"`

If the commit is already pushed, prefer a new `fix:` commit instead of a force-push.

## Fixup workflow

1. Make the fix and stage it: `git add <files>`
2. Create a fixup commit targeting the commit to squash into: `git commit --fixup=<hash>`
3. Later, when cleaning history: `git rebase -i --autosquash origin/main`

## Pre-commit hooks

Use a git hooks manager (e.g. lefthook or husky) or write hooks directly in `.git/hooks/`:
- `pre-commit` — run linter, formatter, type-check
- `commit-msg` — validate commit message format: `tools/commit-lint.ts "$1"`

---

# Conflicts

## Decision Tree

- What is your situation?
  - **Currently in a conflicted merge/rebase** → follow "Resolving conflicts" below
  - **About to merge and want to check first** → run `tools/conflict-forecast.ts <base> <target>`
  - **Recurring conflicts on specific files** → run `tools/conflict-hotspots.ts`
  - **Lockfile conflict (bun.lockb, package-lock.json)** → run `tools/lockfile-resolve.ts`

## Resolving conflicts

1. List all conflicting files: `git diff --name-only --diff-filter=U`
2. For each conflicting file:
   - Open the file and find conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
   - Understand both sides before choosing — read the full context, not just the markers
   - **Trivial: one side is clearly right** → take that side and remove markers
   - **Both sides have valid changes** → merge the intent manually
   - **Semantic conflict (both compile but logic is wrong)** → understand what each side intended; the correct resolution is often neither A nor B verbatim
3. After resolving each file: `git add <file>`
4. Continue the operation: `git rebase --continue` or `git merge --continue`
5. Abort if stuck: `git rebase --abort` or `git merge --abort`

## Lockfile conflicts

Lockfile conflicts are almost always best resolved by regeneration rather than manual editing:
1. Run `tools/lockfile-resolve.ts` — this accepts both sides and regenerates the lockfile
2. Or manually: take either version of the lockfile, then run `bun install` to regenerate
3. Stage the result: `git add bun.lockb`

## Prevention strategies

- Merge or rebase from main frequently to keep branches short-lived
- Run `tools/conflict-forecast.ts <base> <target>` before starting a long merge
- Keep files small and focused — large files with many collaborators are hotspots

---

# History

## Decision Tree

- What are you trying to find?
  - **When/why a specific line or function was changed** → follow "Tracing a change" below
  - **Who owns a file or directory** → run `tools/ownership-map.ts <path>`
  - **Full history of a function or code block** → run `tools/code-archeology.ts <file> <pattern>`
  - **Activity summary by author or directory** → run `tools/activity-report.ts`
  - **Find which commit introduced a bug** → follow "Bisect" below
  - **Compare changes across commits or branches** → follow "Diff analysis" below

## Tracing a change

1. Find when a line was last changed: `git blame -L <start>,<end> <file>`
2. Read the commit that changed it: `git show <hash>`
3. If you need the full history of a block across renames and refactors:
   - Run `tools/code-archeology.ts <file> "<pattern>"` — traces across renames using `git log -S` and `--follow`

## Bisect

1. Start: `git bisect start`
2. Mark the known bad commit: `git bisect bad <bad-hash>` (or `HEAD`)
3. Mark the known good commit: `git bisect good <good-hash>`
4. Git checks out the midpoint — test it, then mark: `git bisect good` or `git bisect bad`
5. Repeat until git identifies the first bad commit
6. End: `git bisect reset`

For automated bisect with a test command: `git bisect run <command>`

## Diff analysis

- Changes in a commit: `git show <hash>`
- Changes between commits: `git diff <hash1>..<hash2>`
- Changes between branches: `git diff <base>...<target>` (three dots = from common ancestor)
- Changes to a specific file over time: `git log -p -- <file>`
- Stat summary only: `git diff --stat <base>...<target>`

## Log queries

- By author: `git log --author="<name>"`
- By date: `git log --since="2 weeks ago"`
- Affecting a file: `git log --oneline -- <file>`
- Message search: `git log --grep="<pattern>"`
- Code search: `git log -S "<string>"` — finds commits that added/removed a string

---

# Stashing

## Decision tree

- What are you doing?
  - **Saving current changes to a stash** → what should be included?
    - **All tracked changes (default)** → run `bun run tools/stash-save.ts`
    - **Include untracked files too** → run `bun run tools/stash-save.ts --include-untracked`
    - **Only specific files** → follow "Partial stash" below
    - **With a custom message** → run `bun run tools/stash-save.ts --message "description"`
  - **Restoring stashed changes** → how should the stash be handled after restoring?
    - **Restore and remove from stash list** → `git stash pop` (or `git stash pop stash@{n}`)
    - **Restore but keep in stash list** → `git stash apply` (or `git stash apply stash@{n}`)
    - **Not sure which stash to restore** → `git stash list`, then `git stash show stash@{n}` for details
  - **Inspecting stash contents** → `git stash show stash@{n}` for stats, `git stash show -p stash@{n}` for full diff
  - **Creating a branch from a stash** → `git stash branch <branch-name> stash@{n}`
  - **Cleaning up old stashes** → `git stash drop stash@{n}` for one, `git stash clear` for all (confirm first)

## Restoring with pop

Pop removes the stash entry after applying. Use when you're done context-switching and want to resume work.

```bash
# Restore the most recent stash
git stash pop

# Restore a specific stash
git stash pop stash@{2}
```

If pop produces merge conflicts:
1. The stash is NOT dropped (it stays in the list)
2. Resolve the conflicts in the working tree
3. Stage the resolved files with `git add`
4. Manually drop the stash: `git stash drop stash@{n}`

## Restoring with apply

Apply keeps the stash in the list. Use when you want to apply the same stash to multiple branches or keep it as a backup.

```bash
# Apply the most recent stash
git stash apply

# Apply a specific stash
git stash apply stash@{1}

# Apply and try to reinstate the index (staged vs unstaged distinction)
git stash apply --index
```

## Partial stash

```bash
# Stash specific files only
git stash push -m "description" -- path/to/file1 path/to/file2

# Interactive selection (choose hunks to stash)
git stash push -p

# Stash everything except already-staged changes
git stash push --keep-index
```

## Stash branches

Create a branch from a stash when the stash conflicts with current work or when the stashed changes deserve their own branch.

```bash
# Create a new branch from a stash, apply the stash, and drop it
git stash branch <branch-name> stash@{n}
```

This checks out the commit where the stash was originally created, creates a new branch, applies the stash, and drops it if successful.

## Stash cleanup

```bash
# Drop a single stash entry
git stash drop stash@{n}

# Clear ALL stashes (destructive — confirm with user first)
git stash clear
```

Never run `git stash clear` without explicit user confirmation — it permanently deletes all stashes.

---

# Tagging

## Decision Tree

- What do you need to do?
  - **Create a new tag** → follow "Creating tags" below
  - **List or search tags** → `git tag -l --sort=-v:refname` or `git tag -l "v1.*"`
  - **Compare two tags** → `git log --oneline <tag1>..<tag2>` for commits, `git diff --stat <tag1>..<tag2>` for changes
  - **Push tags to remote** → follow "Pushing tags" below
  - **Plan a release from tags** → follow "Tag-based releases" below

## Annotated vs lightweight tags

| Type | When to use | Command |
|---|---|---|
| **Annotated** (default) | Releases, milestones — stores author, date, message | `git tag -a v1.2.3 -m "message"` |
| **Lightweight** | Temporary markers, local bookmarks | `git tag v1.2.3-temp` |

Always prefer annotated tags for anything shared with a team or used in CI/CD.

## Semver conventions

Tags follow semantic versioning: `v<major>.<minor>.<patch>`
- **Major** (`v2.0.0`) — breaking changes, incompatible API updates
- **Minor** (`v1.1.0`) — new features, backward-compatible additions
- **Patch** (`v1.0.1`) — bug fixes, backward-compatible corrections

Pre-release suffixes: `v1.2.3-beta.1`, `v1.2.3-rc.1`

To determine the next version:
1. Check the latest tag: `git describe --tags --abbrev=0`
2. Review changes since that tag: `git log --oneline <latest>..HEAD`
3. Bump major if breaking, minor if features added, patch if only fixes

## Creating tags

1. Decide the version number using semver conventions above
2. Validate and create: `tools/tag-create.ts v1.2.3 --message "Release v1.2.3"`
   - Add `--lightweight` to skip the annotation
3. To tag a specific commit (not HEAD): `tools/tag-create.ts v1.2.3 abc1234`

## Pushing tags

Tags are **not** pushed by `git push` by default:
- Single tag: `git push origin v1.2.3`
- All tags: `git push origin --tags`
- Only annotated tags: `git push origin --follow-tags`

Never force-push tags that others may have pulled. If a tag was created in error:
1. Delete remote: `git push origin --delete v1.2.3`
2. Delete local: `git tag -d v1.2.3`
3. Recreate with the correct target

## Tag-based releases

1. List recent tags: `git tag -l --sort=-v:refname | head -5`
2. Compare the last two releases: `git log --oneline v1.1.0..v1.2.0`
3. Generate a changelog from the diff output
4. Create the new tag: `tools/tag-create.ts v1.3.0 --message "Release v1.3.0"`
5. Push: `git push origin v1.3.0`

---

# Remotes

## Decision Tree

- What do you need to do?
  - **Add or remove a remote** → follow "Adding and removing remotes" below
  - **Sync a fork with upstream** → run `tools/remote-sync.ts` or follow "Upstream sync" below
  - **Check ahead/behind status** → `git branch -vv` or `git rev-list --left-right --count <branch>...<remote>/<branch>`
  - **Clean up stale remote branches** → `git fetch --all --prune` then `git branch -vv | grep 'gone]'`
  - **Configure push behavior** → follow "Push strategies" below
  - **Work with multiple orgs** → follow "Multi-org workflow" below

## Adding and removing remotes

```sh
git remote add <name> <url>        # Add a remote
git remote remove <name>           # Remove (also removes tracking branches)
git remote rename <old> <new>      # Rename
git remote set-url <name> <url>    # Change URL (e.g. HTTPS → SSH)
```

- Use `origin` for your primary remote (usually set by `git clone`)
- Use `upstream` for the original repo when working on a fork

## Upstream sync for forks

1. Add the upstream remote (once): `git remote add upstream <original-repo-url>`
2. Sync automatically: `tools/remote-sync.ts`
   - Use `--rebase` to rebase instead of merge
   - Use `--branch <name>` if the default branch isn't `main`
   - Use `--remote <name>` if the upstream remote has a different name
3. Or sync manually:
   ```sh
   git fetch upstream
   git merge upstream/main
   # or: git rebase upstream/main
   git push origin main
   ```

## Push strategies

Git supports different push behaviors via `push.default`:

- **`simple`** (default since Git 2.0) — pushes current branch to its upstream tracking branch, only if names match. Safest option.
- **`upstream`** — pushes current branch to its upstream tracking branch, even if names differ.
- **`matching`** — pushes all local branches that have a matching remote branch. Avoid — too broad.
- **`current`** — pushes current branch to same-name remote branch, creating it if needed. Convenient for feature branches.

Set: `git config push.default <strategy>`

## Remote tracking branches

- List all remote-tracking branches: `git branch -r`
- Show tracking configuration: `git branch -vv`
- Set a local branch to track a remote branch: `git branch -u <remote>/<branch>`
- Fetch all remotes: `git fetch --all`
- Fetch and prune stale refs: `git fetch --all --prune`

## Multi-org workflow

1. Keep `origin` pointing to your fork
2. Add each org's repo as a named remote:
   ```sh
   git remote add upstream git@github.com:org/repo.git
   git remote add staging git@github.com:org/repo-staging.git
   ```
3. Fetch all regularly: `git fetch --all`
4. Push feature branches to `origin`, open PRs against `upstream`
5. Prune stale branches: `git fetch --all --prune`

---

# Worktrees

## Decision Tree

- What do you need to do?
  - **Create a new worktree** → run `tools/worktree-create.ts <branch>` or follow "Creating a worktree" below
  - **List all worktrees** → `git worktree list`
  - **Clean up stale worktrees** → run `tools/worktree-prune.ts`
  - **Repair a broken worktree** → follow "Repairing worktrees" below

## Creating a worktree

1. Use the automated tool for standard layout: `tools/worktree-create.ts <branch-name>`
   - Creates the worktree at a standard path (e.g. `../repo-name-<branch>`)
   - Links to an existing branch, or creates a new one
2. Or create manually:
   ```sh
   # Existing branch
   git worktree add ../<repo>-<branch> <branch>
   # New branch
   git worktree add -b <new-branch> ../<repo>-<branch> origin/main
   ```
3. Run `bun install` in the new worktree if needed

## Working with worktrees

- Each worktree shares the same git history and objects — commits made in any worktree are immediately visible in others
- You cannot check out the same branch in two worktrees simultaneously
- Keep worktrees short-lived — one per active issue or feature

## Cleaning up

1. Check what's stale: `tools/worktree-prune.ts` — lists worktrees whose branches are merged or deleted
2. Remove a specific worktree: `git worktree remove <path>`
   - If the working tree has uncommitted changes, use `--force` only after confirming nothing is needed
3. Run `git worktree prune` to clean up stale administrative files

## Repairing worktrees

If a worktree shows as broken (directory deleted or moved):
1. List all worktrees: `git worktree list`
2. Remove the broken entry: `git worktree remove --force <path>`
3. Prune stale refs: `git worktree prune`
4. Re-create if still needed: `tools/worktree-create.ts <branch>`

---

# Clean Repo

This section is invoked via `/clean-repo`. It is **interactive by default** — present findings before acting, propose actions and wait for confirmation on destructive steps. If the user says "just do it" or "auto", proceed without asking.

## Decision tree

Run these phases in order. Skip phases that have nothing to do.

- **Phase 1: Inventory** → assess full state
- **Phase 2: Stash WIP** → stash changes the user isn't ready to commit
- **Phase 3: Organize commits** → the core phase
- **Phase 4: Clean worktrees** → remove stale worktrees
- **Phase 5: Clean branches** → delete merged/gone branches
- **Phase 6: Push and PR** → push and optionally create PRs

## Phase 1: Inventory

1. Run `tools/repo-status.ts --json` to get a structured overview
2. Present a summary: uncommitted files, unpushed commits, stale worktrees, merged branches, tracking status
3. Ask the user what to exclude or skip

## Phase 2: Stash WIP

If the user marks some changes as not ready to commit:
1. Stash with descriptive message: `git stash push -m "WIP: <description>" -- <files>`
2. Confirm the stash was created

## Phase 3: Organize commits

### Step 1: Analyze changes at hunk level

Run `tools/change-analyzer.ts --json` — classifies each hunk by conventional commit type and groups into proposed commits.

### Step 2: Propose commit plan

Present proposed commits in a numbered list showing type, message, files, and hunks. Wait for user confirmation. The user may merge, reorder, retype, or exclude commits.

### Step 3: Execute commits

For each approved commit:
1. Reset staging: `git reset HEAD`
2. Stage specific hunks: `tools/stage-hunks.ts <commit-index>`
3. Create the commit with the conventional message

### Commit type classification

| Signal | Type |
|---|---|
| New file with feature code | `feat` |
| Bug fix (error handling, null check, off-by-one) | `fix` |
| Code restructure, rename, extract (no behavior change) | `refactor` |
| Test files (`.test.`, `.spec.`, `__tests__/`) | `test` |
| Documentation files (`.md`, `docs/`) | `docs` |
| Config, CI, deps, tooling | `chore` |
| Performance improvement | `perf` |

### Scope detection

- Monorepo packages: `packages/<name>/` → scope is `<name>`
- Top-level directories: `src/<module>/` → scope is `<module>`

## Phase 4: Clean worktrees

1. List worktrees, check for uncommitted changes
2. Propose removing safe ones (branch merged, no changes)
3. Remove confirmed: `git worktree remove <path>`, then `git worktree prune`

## Phase 5: Clean branches

1. Find merged: `git branch --merged main | grep -v '^\*\|main$'`
2. Find gone: `git branch -vv | grep ': gone]'`
3. Delete confirmed: `git branch -d <branch>`
4. Prune: `git remote prune origin`

## Phase 6: Push and PR

1. Check for unpushed commits: `git log --oneline @{upstream}..HEAD`
2. Ask the user: push directly, create branch + PR, or skip
3. Push: `git push -u origin <branch>`
4. Create PR if requested: `gh pr create`

## Final summary

Show a concise recap of what was done (commits created, worktrees removed, branches deleted, pushed).

---

# Tool reference

| Tool | What it does |
|---|---|
| `tools/branch-diff-summary.ts` | Summarize changes between two branches |
| `tools/branch-naming-check.ts` | Validate branch names against naming conventions |
| `tools/stale-branches.ts` | List branches with no commits in the last N days |
| `tools/commit-lint.ts` | Validate commit messages against conventional commit format |
| `tools/changelog-gen.ts` | Generate a changelog from commits between two refs |
| `tools/split-staged.ts` | Suggest how to split staged changes into atomic commits |
| `tools/conflict-forecast.ts` | Detect files likely to conflict between two branches |
| `tools/conflict-hotspots.ts` | Report files with the most merge conflicts in recent history |
| `tools/lockfile-resolve.ts` | Auto-resolve lockfile conflicts by regenerating |
| `tools/activity-report.ts` | Summarize commit activity by author and directory |
| `tools/ownership-map.ts` | Generate file/directory ownership map from blame data |
| `tools/code-archeology.ts` | Trace the full history of a function or code pattern |
| `tools/stash-save.ts` | Smart stash with auto-generated descriptive message |
| `tools/tag-create.ts` | Create annotated or lightweight tags with semver validation |
| `tools/remote-sync.ts` | Sync a fork with its upstream remote |
| `tools/worktree-create.ts` | Create a worktree linked to a branch with standard layout |
| `tools/worktree-prune.ts` | Detect and remove stale worktrees |
| `tools/repo-status.ts` | Full repository state assessment |
| `tools/change-analyzer.ts` | Hunk-level change analysis and commit type classification |
| `tools/stage-hunks.ts` | Stage specific hunks for a proposed commit group |
