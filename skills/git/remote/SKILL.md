---
name: remote
description: Manages remote repositories, syncs forks with upstream, and maintains remote-tracking branches. Use when the user wants to add or remove a remote, sync a fork, check ahead/behind status across remotes, prune stale remote branches, or work with multiple remotes. Trigger phrases: "add remote", "remove remote", "sync fork", "upstream", "ahead behind", "prune remote", "remote branches", "push to remote", "fetch from remote", "multi-remote".
allowed-tools: Read Grep Glob Bash
---

# Remotes

## Current context

- Remotes: !`git remote -v`

## Decision Tree

- What do you need to do?
  - **Add or remove a remote** → follow "Adding and removing remotes" below
  - **Sync a fork with upstream** → run `tools/remote-sync.ts` or follow "Upstream sync for forks" below
  - **Check ahead/behind status** → `git branch -vv` or `git rev-list --left-right --count <branch>...<remote>/<branch>`
  - **Clean up stale remote branches** → `git fetch --all --prune` then `git branch -vv | grep 'gone]'`
  - **Configure push behavior** → follow "Push strategies" below
  - **Work with multiple orgs** → follow "Multi-org workflow" below

## Adding and removing remotes

1. **Add a remote:**
   ```sh
   git remote add <name> <url>
   ```
   - Use `origin` for your primary remote (usually set by `git clone`)
   - Use `upstream` for the original repo when working on a fork
   - Use a descriptive name for additional remotes (e.g. `staging`, `deploy`, org name)
2. **Remove a remote:**
   ```sh
   git remote remove <name>
   ```
   This also removes all remote-tracking branches for that remote.
3. **Rename a remote:**
   ```sh
   git remote rename <old> <new>
   ```
4. **Change a remote's URL:**
   ```sh
   git remote set-url <name> <new-url>
   ```
   Useful when switching between HTTPS and SSH.

## Upstream sync for forks

Keep a fork up to date with the original repository:

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
- **`upstream`** — pushes current branch to its upstream tracking branch, even if names differ. Useful when local and remote branch names don't match.
- **`matching`** — pushes all local branches that have a matching remote branch. Avoid in most workflows — too broad.
- **`current`** — pushes current branch to a remote branch of the same name, creating it if needed. Convenient for feature branches.

Set the strategy: `git config push.default <strategy>`

For pushing to a specific remote: `git push <remote> <branch>`
For setting upstream tracking: `git push -u <remote> <branch>`

## Remote tracking branches

- List all remote-tracking branches: `git branch -r`
- Show tracking configuration: `git branch -vv`
- Set a local branch to track a remote branch: `git branch -u <remote>/<branch>`
- Fetch all remotes: `git fetch --all`
- Fetch and prune stale refs: `git fetch --all --prune`
- Check tracking status: `git branch -vv`

## Multi-org workflow

When contributing to repos across multiple GitHub organizations:

1. Keep `origin` pointing to your fork
2. Add each org's repo as a named remote:
   ```sh
   git remote add upstream git@github.com:org/repo.git
   git remote add staging git@github.com:org/repo-staging.git
   ```
3. Fetch all regularly: `git fetch --all`
4. Push feature branches to `origin`, then open PRs against `upstream`
5. Check divergence: `git branch -vv` or `git log --oneline <remote>/<branch>..HEAD`
6. Prune stale branches: `git fetch --all --prune`

## Key references

| File / Command | What it covers |
|---|---|
| `tools/remote-sync.ts` | Sync a fork with its upstream remote |
| `git branch -vv` | Show tracking status and ahead/behind counts |
| `git fetch --all --prune` | Fetch all remotes and remove stale tracking branches |
