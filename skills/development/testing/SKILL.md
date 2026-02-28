---
name: testing
description: Designs test strategies, authors tests at all levels (unit, integration, E2E), and diagnoses broken or flaky tests. Use when writing new tests, generating scaffolds, identifying untested code, configuring runners, fixing consistent or intermittent failures, updating stale snapshots, or triaging mass breakage after a refactor.
allowed-tools: Read Grep Glob Bash Write Edit
---

# Testing

## Decision Tree

- What is the testing task?
  - **Design a test strategy for a new feature or module** → see "Strategy Design" below
  - **Write tests for existing code** → see "Authoring Tests" below
  - **Generate test file boilerplate** → run `tools/test-scaffold.ts <source-file>`, then populate
  - **Find untested code paths** → run `tools/coverage-gaps.ts`, then see "Authoring Tests" below
  - **Configure the test runner** → see "Runner Configuration" below
  - **Fix consistently failing tests** → see "Diagnosing Consistent Failures" below
  - **Fix flaky / intermittent tests** → run `tools/flaky-history.ts`, then see "Fixing Flakiness" below
  - **Update outdated snapshots** → see "Snapshot Updates" below
  - **Tests pass locally but fail in CI** → see "Environment Divergence" below
  - **Many tests broke after a refactor** → see "Mass Failure Triage" below

## Strategy Design

Before writing a single test, answer:

1. What are the system boundaries? (network, DB, filesystem, time)
2. What are the critical user paths vs. internal helpers?
3. What failure modes matter? (data corruption, silent errors, wrong output)

Then choose the level:
- **Unit** — pure functions, business logic with no I/O, parser/validator logic
- **Integration** — multiple modules working together with real DB/filesystem, auth flows, API routes
- **E2E** — full user journeys through the actual UI or HTTP interface

Rules:
- Prefer real implementations over mocks — only mock at hard boundaries (network, external APIs, hardware)
- E2E tests run against a real local database, not in-memory fakes
- Test behavior, not implementation — assert what the code produces, not how it does it
- One test file per source module. Mirror the source tree under `tests/` or co-locate with `*.test.ts`

## Authoring Tests

### Unit tests

1. Identify the function's contract: inputs → outputs, edge cases, error conditions
2. Write one `describe` block per function or class
3. Cover: happy path, boundary values, empty/null inputs, error throws
4. Use `expect` matchers that communicate intent (`.toEqual`, `.toThrow`, `.toMatchObject`)
5. Name tests as behavior: `"returns empty array when input is empty"` not `"test 1"`

### Integration tests

1. Spin up real dependencies (DB, cache) using test fixtures or a local container
2. Seed known state before each test, tear down after
3. Test at the module boundary — call the public API, not internal functions
4. Assert on side effects (DB state, emitted events) not just return values

### E2E tests

For web (Playwright):
1. Write tests against a running dev server with a seeded local DB
2. Use stable selectors (`data-testid`, roles) not CSS classes
3. Group by user journey, not by component

For native (Maestro):
1. One `.yaml` flow per feature journey
2. Use `tapOn:` with text or accessibility IDs, not coordinates
3. Assert screen state with `assertVisible:` after each significant action

## Runner Configuration

- **Bun** — `bun test` with `bunfig.toml` for test globs and coverage thresholds
- **Vitest** — `vitest.config.ts`, enable `coverage.provider: 'v8'` for accurate coverage
- Coverage thresholds: set per-module, not project-wide; critical modules ≥80%, utilities ≥60%
- CI: always run tests with `--bail` to fail fast, pipe results through `tools/failure-parse.ts`

## Diagnosing Consistent Failures

1. Run `tools/failure-parse.ts` on the test output to group failures by root cause
2. For each failure group, classify the cause:
   - **Assertion mismatch** — the code changed behavior; decide: is the new behavior correct?
     - **Yes, code is correct** → update the test assertions to match new behavior
     - **No, code is wrong** → fix the code, not the test
   - **Import/compilation error** — module moved, renamed, or API changed → update imports and callers
   - **Null/undefined access** — missing setup, wrong fixture, or unhandled optional chain → add missing setup or fix the guard
   - **Async timeout** — operation takes longer than the test timeout → increase timeout or fix the slow operation
3. Read the failing test to understand what it was testing before touching anything
4. Fix one failure group at a time; re-run after each fix

## Fixing Flakiness

Common causes and fixes:

| Symptom | Root cause | Fix |
|---|---|---|
| Fails ~50% of the time | Race condition or unresolved promise | Await all async operations; use `waitFor` helpers |
| Fails after running many tests | Shared mutable global state | Reset state in `beforeEach`/`afterEach` |
| Fails at certain times of day | Hardcoded dates or time arithmetic | Freeze time with `vi.setSystemTime()` or equivalent |
| Fails on CI but not locally | Different OS, timezone, or locale | Normalize: set `TZ=UTC`, pin locale, use path utilities |
| Fails when tests run in different order | Order-dependent side effects | Use `tools/test-isolate.ts` to confirm, then isolate state |

Steps:
1. Confirm flakiness score with `tools/flaky-history.ts` — only fix genuinely flaky tests (not one-off failures)
2. Run `tools/test-isolate.ts <test-id>` to determine if failure is environmental or ordering-dependent
3. Apply the fix from the table above
4. Run the test 10+ times (`bun test --repeat 10` or equivalent) to confirm the fix holds

## Snapshot Updates

When `tools/snapshot-update.ts` detects stale snapshots:
1. Review what changed — is the output change intentional?
   - **Yes** → regenerate snapshots: `bun test --update-snapshots` (or framework equivalent)
   - **No** → the code regressed; fix the code instead
2. After regenerating, review the diff carefully — snapshot updates can silently swallow regressions
3. Commit updated snapshots alongside the code change that caused them

## Environment Divergence

When a test passes locally but fails in CI:
1. Check if the failure is a missing env var → ensure CI sets the same vars as local `.env.test`
2. Check OS-specific behavior (file paths, line endings, case sensitivity) → use `path.join`, normalize line endings
3. Check if CI runs tests in parallel with a shared resource (port, DB) → isolate with unique ports or DB names per worker
4. Check if a dependency version differs → lock all versions in `package.json` and commit the lockfile
5. Reproduce locally by running with CI environment: same `NODE_ENV`, same env vars, same parallelism settings

## Mass Failure Triage

When a refactor breaks many tests at once:
1. Run `tools/failure-parse.ts` to cluster by failure type
2. Find the common root: is it a changed interface, renamed export, or moved module?
3. Fix the root cause first, then re-run to see what's left
4. Do not update tests to accommodate a bad refactor — if 30 tests break, the refactor may be wrong

## Key References

| File | What it covers |
|---|---|
| `tools/coverage-gaps.ts` | Find modules and functions lacking test coverage |
| `tools/test-scaffold.ts` | Generate test file boilerplate for a given source file |
| `tools/flaky-detector.ts` | Identify tests with inconsistent pass/fail history |
| `tools/test-matrix.ts` | Generate a test case matrix from input parameter combinations |
| `tools/failure-parse.ts` | Parse test runner output and group failures by root cause |
| `tools/flaky-history.ts` | Track pass/fail history and rank tests by flakiness score |
| `tools/snapshot-update.ts` | Detect outdated snapshots and regenerate from current output |
| `tools/test-isolate.ts` | Run a single test in an isolated environment to check for side-effect dependencies |
