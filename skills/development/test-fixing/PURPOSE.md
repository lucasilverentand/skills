# Test Fixing

Diagnose and fix broken or flaky tests.

## Responsibilities

- Diagnose root causes of test failures
- Fix broken and flaky tests
- Improve test reliability and determinism
- Isolate environment-dependent test behavior
- Update test assertions after intentional code changes

## Tools

- `tools/failure-parse.ts` — parse test runner output and group failures by root cause
- `tools/flaky-history.ts` — track pass/fail history for each test and rank by flakiness score
- `tools/snapshot-update.ts` — detect outdated snapshots and regenerate them from current output
- `tools/test-isolate.ts` — run a single test in an isolated environment to check for side-effect dependencies
