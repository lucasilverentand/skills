---
name: testing
description: Designs test strategies, authors tests at all levels (unit, integration, E2E), diagnoses broken or flaky tests, and configures CI pipelines. Covers TypeScript (Bun test), web E2E (Playwright), React Native (Maestro), and Swift (Swift Testing framework). Use when writing new tests, generating scaffolds, identifying untested code, configuring runners, fixing consistent or intermittent failures, updating stale snapshots, triaging mass breakage after a refactor, setting up CI workflows, optimizing pipeline speed, managing caching, or configuring matrix builds.
allowed-tools: Read Grep Glob Bash Write Edit
---

# Testing & CI

## Decision Tree

- What is the task?
  - **Design a test strategy for a new feature or module** → see "Strategy Design" below
  - **Write tests for existing code** → see "Authoring Tests" below (TypeScript: unit/integration; Hono routes: see "Hono route tests" subsection; Swift: see "Swift tests" subsection)
  - **Generate test file boilerplate** → run `tools/test-scaffold.ts <source-file>`, then populate
  - **Find untested code paths** → run `tools/coverage-gaps.ts`, then see "Authoring Tests" below
  - **Configure the test runner** → see "Runner Configuration" below
  - **Fix consistently failing tests** → see "Diagnosing Consistent Failures" below
  - **Fix flaky / intermittent tests** → run `tools/flaky-history.ts`, then see "Fixing Flakiness" below
  - **Update outdated snapshots** → see "Snapshot Updates" below
  - **Tests pass locally but fail in CI** → see "Environment Divergence" below
  - **Many tests broke after a refactor** → see "Mass Failure Triage" below
  - **Set up CI for a new project** → run `tools/workflow-gen.ts <project-type>`, then see "CI: New Workflow" below
  - **CI pipeline is slow** → run `tools/pipeline-timing.ts`, then see "CI: Speed Optimization" below
  - **CI cache hit rate is low** → run `tools/cache-audit.ts`, then see "CI: Cache Strategy" below
  - **CI pipeline is flaky (intermittent failures)** → see "CI: Flakiness Reduction" below
  - **Add matrix builds for cross-platform testing** → see "CI: Matrix Builds" below
  - **Validate an existing workflow file** → run `tools/ci-lint.ts <workflow-path>`

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
- Tests must never depend on real secrets — use `.env.test` with fake/placeholder values, not production or development credentials. CI injects test-specific secrets via GitHub Actions secrets, never production values.

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

### Hono route tests (TypeScript)

For Hono APIs backed by Drizzle + SQLite/D1, integration tests run against a real in-memory database — never mock the data layer.

**In-memory database setup**

Create an in-memory SQLite instance and run the actual Drizzle migrations once, then clear tables between tests (faster than recreating):

```ts
import { Database } from "bun:sqlite"
import { drizzle } from "drizzle-orm/bun-sqlite"
import { migrate } from "drizzle-orm/bun-sqlite/migrator"
import { beforeEach } from "bun:test"

function createTestDb() {
  const sqlite = new Database(":memory:")
  sqlite.exec("PRAGMA foreign_keys = ON")
  const db = drizzle(sqlite)
  migrate(db, { migrationsFolder: "drizzle/migrations" })
  return Object.assign(db, { $client: sqlite })
}

const db = createTestDb()

beforeEach(() => {
  db.$client.exec("PRAGMA foreign_keys = OFF")
  const tables = db.$client
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '__drizzle%'")
    .all() as { name: string }[]
  for (const { name } of tables) db.$client.exec(`DELETE FROM "${name}"`)
  db.$client.exec("PRAGMA foreign_keys = ON")
})
```

**Test app factory**

Wrap the router under test in a minimal Hono app that injects DB and auth context via middleware — do not spin up a real server:

```ts
import { Hono } from "hono"
import { usersRouter } from "./routes/users"

function createTestApp(options: { userId?: string | null } = {}) {
  const app = new Hono()
  app.use("*", async (c, next) => {
    c.set("db", db)
    c.set("user", options.userId ? { id: options.userId } : null)
    await next()
  })
  app.route("/", usersRouter)
  return app
}
```

**Writing tests**

Call routes directly with `app.request()` — no real server, no port binding:

```ts
import { describe, expect, test } from "bun:test"

describe("POST /users", () => {
  test("creates a user and returns 201", async () => {
    const app = createTestApp({ userId: "user-1" })
    const res = await app.request("/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Alice", email: "alice@example.com" }),
    })
    expect(res.status).toBe(201)
    const body = await res.json() as { ok: boolean; data: { name: string } }
    expect(body.ok).toBe(true)
    expect(body.data.name).toBe("Alice")
  })

  test("returns 401 when no user in context", async () => {
    const app = createTestApp({ userId: null })
    const res = await app.request("/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Alice", email: "alice@example.com" }),
    })
    expect(res.status).toBe(401)
  })
})
```

**Rules**

- Use `bun:sqlite` in-memory DB with real migrations — test actual query behavior, not mocked clients
- Only mock hard external boundaries: logger, email sending, HTTP calls to third-party services
- Clear tables in `beforeEach`, not `afterEach` — a failing test leaves state intact for debugging
- Create typed seed helper functions for common entities to keep test bodies readable

### E2E tests (Playwright)

See `references/playwright.md` for configuration, auth fixtures, selectors, seeding, and test patterns.

### E2E tests (Maestro)

See `references/maestro.md` for flow anatomy, composing helpers, selectors, scrolling, running locally, and CI integration.

### Swift tests

Use Swift Testing (`import Testing`) for all new Swift tests — not XCTest.

**Basic test:**

```swift
import Testing

@Test func formatsDateCorrectly() {
    #expect(DateFormatter.display(Date(timeIntervalSince1970: 0)) == "Jan 1, 1970")
}
```

**Test suites** — group related tests with `@Suite`:

```swift
@Suite("UserValidator")
struct UserValidatorTests {
    @Test func acceptsValidEmail() {
        #expect(UserValidator.isValidEmail("user@example.com"))
    }

    @Test func rejectsEmptyEmail() {
        #expect(!UserValidator.isValidEmail(""))
    }

    @Test func throwsOnMissingName() {
        #expect(throws: ValidationError.missingField("name")) {
            try UserValidator.validate(User(name: "", email: "a@b.com"))
        }
    }
}
```

**Async tests** — async/await works natively, no special setup:

```swift
@Test func fetchesResourceSuccessfully() async throws {
    let client = MockHTTPClient(response: .sampleUser)
    let service = UserService(client: client)
    let user = try await service.fetch(id: "usr_123")
    #expect(user.id == "usr_123")
}
```

**Parameterized tests** — test multiple inputs with one function:

```swift
@Test("rejects invalid emails", arguments: ["", "notanemail", "@no-user.com", "no-domain@"])
func invalidEmailRejected(email: String) {
    #expect(!UserValidator.isValidEmail(email))
}
```

**`#require` for preconditions** — stops the test immediately if the condition fails (like an unwrap):

```swift
@Test func parsesResponseBody() throws {
    let data = try #require(responseData, "Expected non-nil response data")
    let decoded = try JSONDecoder().decode(User.self, from: data)
    #expect(decoded.name == "Alice")
}
```

**`@MainActor` tests** — for observable view models and UI-layer state:

```swift
@Test @MainActor
func viewModelPopulatesItemsAfterLoad() async {
    let vm = ItemListViewModel(store: MockItemStore(items: [.sample]))
    await vm.load()
    #expect(vm.items.count == 1)
}
```

**Tagging** — group tests by concern for selective runs:

```swift
extension Tag {
    @Tag static var networking: Self
    @Tag static var validation: Self
}

@Test(.tags(.networking))
func requestIncludesAuthHeader() async throws { ... }
```

Run tagged subset: `swift test --filter networking`.

**Rules:**
- Never use XCTest for new tests — Swift Testing is the standard from Swift 6.2
- Use `#expect` for assertions — not `XCTAssertEqual`, `XCTAssertTrue`, etc.
- Use `throws` on `@Test` for tests exercising throwing code; combine with `#require` for preconditions
- Keep each `@Test` to one behavior — one assertion (or a small set of tightly related ones)
- Name tests as behaviors: `"rejectsEmptyInput"` not `"testValidationEmpty"`
- Prefer real implementations over mocks — only mock at hard system boundaries (network, filesystem)

## Runner Configuration

- **Bun** — `bun test` with `bunfig.toml` for test globs and coverage thresholds
- **Swift** — `swift test` for SPM packages; `xcodebuild test -scheme <Scheme>` for Xcode projects; `tuist test` for Tuist-managed projects
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

---

## CI: New Workflow

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
      - run: bun install --frozen-lockfile  # Fail if lockfile is stale — prevents supply chain drift
      - run: bun run typecheck
      - run: bun run lint
      - run: bun test --coverage
```

Rules:
- Pin action versions to full commit SHA — never use tags (`@v4`) as they can be moved to point to malicious code. Use `tools/action-pin.ts` from `security/supply-chain` to automate this. Format: `actions/checkout@<sha> # v4.1.1`
- Use `--frozen-lockfile` for installs to catch lockfile drift early
- Separate lint/typecheck from tests — they catch different problems and should report independently
- Never use `continue-on-error: true` to hide failures

## CI: Speed Optimization

1. Run `tools/pipeline-timing.ts <run-id>` to see step-by-step duration breakdown
2. Find the slowest steps and classify:

| Slow step | Optimization |
|---|---|
| Dependency install | Add dependency caching (see "CI: Cache Strategy") |
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

## CI: Cache Strategy

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

## CI: Flakiness Reduction

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

## CI: Matrix Builds

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

## Key References

| File | What it covers |
|---|---|
| `references/playwright.md` | Config, auth fixtures, selectors, seeding, and test patterns for web E2E |
| `references/maestro.md` | Flow anatomy, helpers, selectors, running locally, and CI for React Native E2E |
| `tools/coverage-gaps.ts` | Find modules and functions lacking test coverage |
| `tools/test-scaffold.ts` | Generate test file boilerplate for a given source file |
| `tools/flaky-detector.ts` | Identify tests with inconsistent pass/fail history |
| `tools/test-matrix.ts` | Generate a test case matrix from input parameter combinations |
| `tools/failure-parse.ts` | Parse test runner output and group failures by root cause |
| `tools/flaky-history.ts` | Track pass/fail history and rank tests by flakiness score |
| `tools/snapshot-update.ts` | Detect outdated snapshots and regenerate from current output |
| `tools/test-isolate.ts` | Run a single test in an isolated environment to check for side-effect dependencies |
| `tools/ci-lint.ts` | Validate GitHub Actions workflow files for common misconfigurations |
| `tools/pipeline-timing.ts` | Parse CI logs and report step-by-step duration breakdowns |
| `tools/cache-audit.ts` | Analyze cache hit rates and suggest missing cache keys |
| `tools/workflow-gen.ts` | Scaffold a GitHub Actions workflow from a project template |
