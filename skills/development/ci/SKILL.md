---
name: ci
description: Creates and updates CI/CD workflows, optimizes pipeline speed and reliability, manages caching strategies, and configures matrix builds. Use when setting up CI for a new project, a pipeline is slow or flaky, cache hit rates are low, or cross-platform testing needs configuring.
allowed-tools: Read Grep Glob Bash Write Edit
---

# CI

## Decision Tree

- What is the CI task?
  - **Set up CI for a new project** → run `tools/workflow-gen.ts <project-type>`, then see "New Workflow" below
  - **Pipeline is slow** → run `tools/pipeline-timing.ts`, then see "Speed Optimization" below
  - **Cache hit rate is low** → run `tools/cache-audit.ts`, then see "Cache Strategy" below
  - **Pipeline is flaky (intermittent failures)** → see "Flakiness Reduction" below
  - **Add matrix builds for cross-platform testing** → see "Matrix Builds" below
  - **Validate an existing workflow file** → run `tools/ci-lint.ts <workflow-path>`

## New Workflow

1. Run `tools/workflow-gen.ts <project-type>` to scaffold a baseline workflow
2. Review and customize the generated file for the project's actual needs
3. Run `tools/ci-lint.ts` to validate before committing

Baseline structure for a TypeScript/Bun project:

```yaml
on:
  push:
    branches: [main]
  pull_request:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run typecheck
      - run: bun run lint
      - run: bun test --coverage
```

Rules:
- Pin action versions to full SHA for security (`actions/checkout@<sha>` not `@latest`)
- Use `--frozen-lockfile` for installs to catch lockfile drift early
- Separate lint/typecheck from tests — they catch different problems and should report independently
- Never use `continue-on-error: true` to hide failures

## Speed Optimization

1. Run `tools/pipeline-timing.ts <run-id>` to see step-by-step duration breakdown
2. Find the slowest steps and classify:

| Slow step | Optimization |
|---|---|
| Dependency install | Add dependency caching (see "Cache Strategy") |
| Build | Cache build artifacts keyed to source hash |
| Tests | Parallelize with job matrix or `--shard` flag |
| Docker build | Use `cache-from: type=gha` with BuildKit |
| Repeated setup across jobs | Extract to a reusable workflow or composite action |

3. Consider job parallelism — if lint, typecheck, and tests are sequential, split into parallel jobs
4. Use `paths` filters so frontend changes don't run backend tests and vice versa:

```yaml
on:
  push:
    paths:
      - 'packages/api/**'
```

## Cache Strategy

After running `tools/cache-audit.ts`:

1. Check cache hit rate per key — a rate below 70% means the key is too specific or the cache expires too often
2. Fix cache keys:
   - **Too specific** (includes branch name or PR number) → use only file hashes
   - **Not specific enough** (no hash) → will serve stale cache after dependency changes
   - **Correct key pattern**: `<runner-os>-<tool>-<lockfile-hash>`

Standard Bun cache:
```yaml
- uses: actions/cache@v4
  with:
    path: ~/.bun/install/cache
    key: ${{ runner.os }}-bun-${{ hashFiles('**/bun.lockb') }}
    restore-keys: |
      ${{ runner.os }}-bun-
```

3. For build caches, use `restore-keys` with a prefix fallback so a partial cache is better than none
4. Don't cache `node_modules` directly — cache the package manager's global store instead

## Flakiness Reduction

CI flakiness sources and fixes:

| Pattern | Root cause | Fix |
|---|---|---|
| Network timeout on dependency install | Registry instability | Add retry: `--network-timeout 60000`; use a mirror |
| Port conflicts in parallel jobs | Multiple services on the same port | Use dynamic ports or unique port per job index |
| Race condition in E2E tests | Tests start before server is ready | Add health check polling before test run |
| Quota exceeded on external API | Tests call real APIs | Stub external APIs in CI; only test real ones in staging |
| Different behavior on Linux vs. macOS | Path separators, case sensitivity | Normalize paths; test on Linux in CI |

For persistent flakiness:
1. Rerun the failed job — if it passes, it's environmental
2. Check if the failure correlates with a specific runner or time of day → suspect resource contention
3. Isolate flaky tests and run them 20 times in the flaky job's environment to reproduce

## Matrix Builds

Use matrix builds when the code must work across multiple versions, platforms, or configurations.

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, macos-latest, windows-latest]
    node: [18, 20, 22]
  fail-fast: false  # collect all failures, not just the first
```

Rules:
- Set `fail-fast: false` so one matrix failure doesn't cancel all others
- Exclude known-unsupported combinations with `exclude:` rather than letting them fail
- For large matrices, use `include:` to add special cases rather than a full Cartesian product

## Key references

| File | What it covers |
|---|---|
| `tools/ci-lint.ts` | Validate GitHub Actions workflow files for common misconfigurations |
| `tools/pipeline-timing.ts` | Parse CI logs and report step-by-step duration breakdowns |
| `tools/cache-audit.ts` | Analyze cache hit rates and suggest missing cache keys |
| `tools/workflow-gen.ts` | Scaffold a GitHub Actions workflow from a project template |
