# Testing & CI

Design test strategies, author tests at all levels, diagnose and fix broken or flaky tests, and configure CI pipelines.

## Responsibilities

- Design test strategies for features and modules
- Author unit, integration, and E2E tests
- Ensure meaningful coverage of actual behavior
- Generate test scaffolds for new modules
- Identify untested code paths and edge cases
- Configure test runners and reporting
- Diagnose root causes of test failures
- Fix broken and flaky tests
- Improve test reliability and determinism
- Isolate environment-dependent test behavior
- Update test assertions and snapshots after intentional code changes
- Triage mass test breakage after refactors
- Create and update CI workflow configurations
- Optimize CI pipeline speed and reliability
- Manage caching strategies for faster builds
- Configure matrix builds for cross-platform testing
- Validate workflow files for misconfigurations
- Reduce CI flakiness rates

## Tools

- `tools/coverage-gaps.ts` — find modules and functions lacking test coverage
- `tools/test-scaffold.ts` — generate test file boilerplate for a given source file
- `tools/flaky-detector.ts` — identify tests with inconsistent pass/fail history
- `tools/test-matrix.ts` — generate a test case matrix from input parameter combinations
- `tools/failure-parse.ts` — parse test runner output and group failures by root cause
- `tools/flaky-history.ts` — track pass/fail history for each test and rank by flakiness score
- `tools/snapshot-update.ts` — detect outdated snapshots and regenerate them from current output
- `tools/test-isolate.ts` — run a single test in an isolated environment to check for side-effect dependencies
- `tools/ci-lint.ts` — validate GitHub Actions workflow files for common misconfigurations
- `tools/pipeline-timing.ts` — parse CI logs and report step-by-step duration breakdowns
- `tools/cache-audit.ts` — analyze cache hit rates and suggest missing cache keys
- `tools/workflow-gen.ts` — scaffold a GitHub Actions workflow from a project template
