---
name: committing
description: Creates conventional commits, handles amend and fixup workflows, configures pre-commit hooks, and splits large changes into atomic commits. Use when the user wants to commit changes, write a commit message, amend the last commit, set up commit hooks, split staged changes, or generate a changelog. Trigger phrases: "commit", "conventional commit", "amend", "fixup", "pre-commit hook", "split commit", "changelog", "commit message".
allowed-tools: Read Grep Glob Bash
---

# Committing

## Current context

- Branch: !`git branch --show-current`
- Staged: !`git diff --cached --stat`
- Unstaged: !`git diff --stat`

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

Example:
```
feat(auth): add refresh token rotation

Tokens were not being rotated on use, allowing replay attacks.
Rotation is now enforced on every token refresh.
```

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

Recommended `commit-msg` hook:
```sh
#!/bin/sh
bun run tools/commit-lint.ts "$1"
```

## Key references

| File | What it covers |
|---|---|
| `tools/commit-lint.ts` | Validate commit messages against conventional commit format |
| `tools/changelog-gen.ts` | Generate a changelog from commits between two refs |
| `tools/split-staged.ts` | Interactively split staged changes into multiple atomic commits |
