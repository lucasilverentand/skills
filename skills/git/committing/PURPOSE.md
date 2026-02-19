# Committing

Conventional commits, amend and fixup, and pre-commit hooks.

## Responsibilities

- Create conventional commit messages
- Handle amend and fixup workflows
- Configure pre-commit hooks
- Validate commit message format before pushing
- Split large changes into atomic commits
- Generate changelogs from commit history

## Tools

- `tools/commit-lint.ts` — validate commit messages against conventional commit format
- `tools/changelog-gen.ts` — generate a changelog from commits between two refs
- `tools/split-staged.ts` — interactively split staged changes into multiple atomic commits
