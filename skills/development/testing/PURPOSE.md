# Testing

Design test strategies and author tests at all levels: unit, integration, and E2E.

## Responsibilities

- Design test strategies for features and modules
- Author unit, integration, and E2E tests
- Ensure meaningful coverage of actual behavior
- Generate test scaffolds for new modules
- Identify untested code paths and edge cases
- Configure test runners and reporting

## Tools

- `tools/coverage-gaps.ts` — find modules and functions lacking test coverage
- `tools/test-scaffold.ts` — generate test file boilerplate for a given source file
- `tools/flaky-detector.ts` — identify tests with inconsistent pass/fail history
- `tools/test-matrix.ts` — generate a test case matrix from input parameter combinations
