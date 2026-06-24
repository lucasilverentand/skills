# Commits
Use this reference when committing, splitting a working tree, writing commit messages, or cleaning unfinished changes into reviewable history.

## Inspect Before Staging
Run these in parallel where possible:

```bash
git status --short
git diff
git diff --staged
git log --oneline -5
```

Read changed files when the diff alone does not explain the intent. Commit messages should capture both the diff and the reason from the conversation or issue context.

## Scope Discipline
Each commit should cover one logical concern:

- One feature or behavior change plus its tests.
- One bug fix plus its regression test.
- One refactor with no behavior change.
- One dependency/config update plus required mechanical follow-up.

Split when a subject would need "and" to describe unrelated work. Do not split trivial mechanical details away from the change that requires them.

## Single Commit Flow
1. Confirm the changes are one concern.
2. Stage explicit paths only.
3. Review `git diff --staged`.
4. Commit with the repo's signing/co-author rules.
5. Run `git status --short --branch`.

Use conventional commit style unless the repo clearly uses another style:

```text
type(scope): imperative subject
```

Common types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `ci`, `build`, `style`.

Write a body for non-trivial changes:

```text
What changed: describe the concrete shape of the diff.

Why: describe the problem, decision, or tradeoff that is not obvious from the files.
```

## Multi-Commit Flow
Use this for mixed working trees.

1. Inventory every changed file and diff hunk.
2. Group changes by logical concern.
3. Plan the commit order so dependencies come first.
4. Present the plan when the split is non-obvious or line-level staging is needed.
5. Stage and commit one concern at a time.
6. After each commit, confirm the remaining diff is expected.

For line-level splits, prefer `git add -p` when it works. If hunks are tangled, edit carefully to stage only the intended state, then restore the remaining working-tree changes without using destructive checkout/reset commands.

## Commit Message Template
```bash
git commit -S -m "$(cat <<'EOF'
type(scope): short imperative subject

What changed: ...

Why: ...

Co-authored-by: Codex <codex@openai.com>
EOF
)"
```

Omit `-S` or the co-author trailer only when repo instructions do not require them.

## Final Check
Show the resulting local state:

```bash
git log --oneline -N
git status --short --branch
```
