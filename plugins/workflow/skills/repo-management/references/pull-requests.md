# Pull Requests
Use this reference when opening a pull request, updating a PR branch, or preparing a branch for review.

## Preflight
```bash
git status --short --branch
git remote get-url origin
gh pr view --json number,title,url 2>/dev/null
```

If a PR already exists for the branch, update that PR instead of creating a duplicate.

Read project conventions:

- `AGENTS.md`
- `CLAUDE.md`
- `CONTRIBUTING.md`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/CODEOWNERS`

## Sync With Base
Determine the default target branch, usually `main`, falling back to `master` when needed:

```bash
git fetch origin
git rebase origin/main
```

Use the repo's documented convention if it prefers merges. Resolve conflicts with [conflicts.md](conflicts.md).

## Validate Before PR
Run checks that match the project and the change:

- Repo scripts such as `bun run ci`, `npm test`, `pnpm lint`, `cargo test`, `go test ./...`, `pytest`, `swift test`, or `xcodebuild test`.
- Formatting and type checking when available.
- Targeted tests for changed behavior.

If a check cannot run because of missing services, secrets, devices, or local tooling, record that explicitly in the PR body and final response.

## Push
```bash
git push -u origin HEAD
```

After a rebase or amended commit:

```bash
git push --force-with-lease origin HEAD
```

## Title And Body
Match the repository's existing PR title convention. When unclear, use a conventional title such as:

```text
feat: add repository management skill
```

Use proper GitHub Flavored Markdown. If no template exists, use:

```markdown
## Summary

- What changed.
- Why it matters.

## Test plan

- [x] Command or check that passed.
- [ ] Manual or CI check still pending, if any.
```

Include deploy notes only when there are migrations, feature flags, environment changes, or sequencing concerns.

## Draft Or Ready
Open a draft when work is incomplete, validation is missing, or the user asks for draft. Open ready for review when the work is complete and appropriate checks pass.

```bash
gh pr create --title "<title>" --body-file <file>
gh pr create --draft --title "<title>" --body-file <file>
```

## After Creating
Use [ci-and-pr-repair.md](ci-and-pr-repair.md) to watch CI. Do not leave a newly opened PR unchecked when GitHub Actions are available.
