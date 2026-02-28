---
name: contributing
description: Creates and maintains contributor documentation — CONTRIBUTING.md, GitHub PR and issue templates, CODEOWNERS, code of conduct, and security policy. Use when setting up a new open-source or team project, onboarding contributors, or standardizing how pull requests and issues are filed.
allowed-tools: Read Glob Bash Write Edit
---

# Contributing

## Decision Tree

- What do you need?
  - **Setting up contributor docs for a new project** → does the project have CI configured?
    - **Yes** → follow "Full scaffold" below — the tooling detection picks up CI config
    - **No** → set up CI first (see `development/ci` skill), then follow "Full scaffold" below
  - **Adding or updating CONTRIBUTING.md** → does a CONTRIBUTING.md already exist?
    - **Yes** → run `tools/contrib-gen.ts --update` to merge new tooling into existing doc
    - **No** → run `tools/contrib-gen.ts` to scaffold from scratch
  - **Adding PR or issue templates** → see `references/github-templates.md`
  - **Adding CODEOWNERS** → see `references/github-templates.md` for format and patterns
  - **Adding a security policy** → see `references/github-templates.md` for SECURITY.md template
  - **Adding a code of conduct** → see `references/code-of-conduct.md`
  - **Verifying setup steps work** → run `tools/setup-validator.ts` — are there failures?
    - **Yes** → fix the documented commands, then re-run until clean
    - **No** → setup docs are valid
  - **Reviewing an existing CONTRIBUTING.md** → check it covers all sections in "CONTRIBUTING.md structure" below

## Full scaffold

1. Read existing tooling: `package.json`, CI config, `README.md` to understand the stack
2. Run `tools/contrib-gen.ts` — it infers tooling, test runner, and branch strategy from the repo
3. Review the generated `CONTRIBUTING.md` against the structure below — fill in any gaps
4. Run `tools/template-scaffold.ts` to generate PR and issue templates (see `references/github-templates.md`)
5. Add `CODEOWNERS` if the project has multiple teams or ownership areas
6. Add `SECURITY.md` for public projects
7. Run `tools/setup-validator.ts` to verify documented setup steps execute cleanly
8. Fix any steps that fail validation before committing

## CONTRIBUTING.md structure

Every CONTRIBUTING.md should cover these sections. Adapt depth to project size.

### 1. Welcome and quick links

Short intro thanking contributors, linking to the code of conduct, issue tracker, and discussion channels.

```markdown
# Contributing to ProjectName

Thanks for your interest in contributing! Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before participating.

- [Issue tracker](https://github.com/org/repo/issues)
- [Discussions](https://github.com/org/repo/discussions)
- [Development setup](#development-setup)
```

### 2. Development setup

Step-by-step instructions that a new contributor can copy-paste. Include prerequisites, install, and verify commands.

```markdown
## Development Setup

### Prerequisites
- [Bun](https://bun.sh) >= 1.2
- [OrbStack](https://orbstack.dev) (for running local services)

### Install
git clone https://github.com/org/repo.git
cd repo
bun install
cp .env.example .env

### Verify
bun test
bun run dev
```

Always include a "verify" step so contributors can confirm their setup works. Run `tools/setup-validator.ts` to confirm these commands succeed.

### 3. Branching strategy

Document the branching model and naming conventions.

```markdown
## Branching

- `main` — production-ready code, protected
- Feature branches: `feat/short-description`
- Bug fix branches: `fix/short-description`
- Create branches from `main`, keep them short-lived
```

### 4. Commit conventions

Specify the commit format and provide examples.

```markdown
## Commits

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat: add user profile page` — new feature
- `fix: resolve auth token expiry bug` — bug fix
- `refactor: extract validation logic` — code change that is not a fix or feature
- `test: add integration tests for payments` — adding tests
- `docs: update API reference` — documentation only
- `chore: bump dependencies` — maintenance

Keep commits atomic — one logical change per commit.
```

### 5. Pull request process

Explain what a good PR looks like and how the review process works.

```markdown
## Pull Requests

1. Create a feature branch from `main`
2. Make your changes with tests
3. Run `bun test` and `bun run lint` before pushing
4. Open a PR against `main` — fill in the PR template
5. Address review feedback
6. A maintainer will merge once approved

### PR expectations
- Link the related issue (`Closes #123`)
- Include tests for new behavior
- Update docs if the public API changes
- Keep PRs focused — one feature or fix per PR
```

### 6. Testing requirements

Document what tests are expected and how to run them.

```markdown
## Testing

- Unit tests: `bun test`
- E2E tests: `bun run test:e2e` (requires local DB running)
- Every new feature or bug fix should include tests
- Tests run against real local services, not mocks
```

### 7. Code style

Reference the formatter and linter config rather than listing rules.

```markdown
## Code Style

We use [Biome](https://biomejs.dev) for formatting and linting. Run:

bun run lint      # check
bun run lint:fix  # auto-fix

Configuration is in `biome.json`. Do not override it in your editor.
```

## Code of conduct

Use the [Contributor Covenant v2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/) as the default. See `references/code-of-conduct.md` for setup, customization, and enforcement process.

### Quick setup

1. Create `CODE_OF_CONDUCT.md` in the repo root
2. Replace placeholder contact info with the actual enforcement contact (project maintainer email or team alias)
3. Link from CONTRIBUTING.md and README.md

For small projects, a minimal code of conduct is also documented in `references/code-of-conduct.md`.

## CODEOWNERS

Assigns automatic reviewers based on file paths. Place at `.github/CODEOWNERS`. See `references/github-templates.md` for full syntax and patterns.

Key rules:
- Later rules override earlier ones (last match wins)
- Use `@org/team-name` for teams, `@username` for individuals
- Requires branch protection with "Require review from Code Owners" enabled

## Security policy

Public projects should have a `SECURITY.md` with:
- Supported versions table
- Reporting instructions (not public issues — use GitHub Security Advisories or email)
- Response timeline commitments
- Disclosure policy

See `references/github-templates.md` for the full template.

## GitHub repository settings

For a well-configured project, also set:

### Branch protection on `main`

- Require PR reviews before merging (1-2 approvals)
- Require status checks to pass (CI, lint, tests)
- Require review from Code Owners (if CODEOWNERS is set)
- Require linear history (no merge commits) or squash merging

### Repository features

- Enable Discussions for Q&A and proposals
- Enable Security Advisories for private vulnerability reporting
- Disable wiki if using docs in the repo
- Add repository topics for discoverability

## Key references

| File | What it covers |
|---|---|
| `references/github-templates.md` | PR template, issue templates, CODEOWNERS, SECURITY.md, FUNDING.yml |
| `references/code-of-conduct.md` | Contributor Covenant setup, minimal CoC, enforcement process |
| `tools/contrib-gen.ts` | Scaffold CONTRIBUTING.md from repo tooling and branch strategy |
| `tools/template-scaffold.ts` | Generate GitHub PR and issue templates |
| `tools/setup-validator.ts` | Verify documented setup steps run cleanly |
