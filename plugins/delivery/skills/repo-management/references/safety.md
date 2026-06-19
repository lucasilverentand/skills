# Safety And Repository State
Use this reference before operations that change Git history, push remote branches, delete local state, or stage files.

## Shared-State Rules
- Read `git status --short --branch` before edits, staging, commits, rebases, checkouts, or cleanups.
- Treat unexpected existing changes as user-owned. Work with them when they affect the task; ignore unrelated changes; ask only when they make the task impossible.
- Do not run destructive commands such as `git reset --hard`, `git checkout -- <path>`, `git clean`, or forced worktree removal unless the user clearly asked for that operation.
- Never stage secrets, private keys, tokens, `.env` files, credentials, private customer data, or generated binaries that do not belong in source control.
- Prefer specific path staging over `git add .` or `git add -A`.
- Use `git worktree` for clean PR/CI work when the current tree has unrelated local changes.

## Branches
- Follow repo-local naming instructions first.
- Avoid reserved bot prefixes when repo instructions forbid them.
- Prefer clear topic names such as `repo-management-skill`, `fix-pr-123-ci`, or a Linear branch name when one is available.
- Fetch with pruning before interpreting remote branch state:

```bash
git fetch --all --prune
```

## Signed And Attributed Commits
Follow repo instructions for commit signing and attribution. When signed commits are required, commit with `-S`:

```bash
git commit -S -m "$(cat <<'EOF'
type(scope): subject

What changed: ...

Why: ...

Co-authored-by: Codex <codex@openai.com>
EOF
)"
```

If signing fails, stop and report the blocker. Do not create an unsigned commit in a repo that requires signed commits.

When co-authoring is required, include the trailer in every commit created by the agent.

## Pushes
- Use normal `git push` for new commits on non-rewritten branches.
- Use `git push --force-with-lease` after a rebase or amended commit on a branch you own.
- Do not force-push someone else's branch without explicit permission and a clear risk note.
- Do not push branches with prefixes forbidden by repo policy.

## GitHub Verification
When local GPG cannot verify a GitHub web-flow merge commit, verify it through GitHub:

```bash
gh api repos/<owner>/<repo>/commits/<sha> --jq '.commit.verification'
```
