# Testing
Test pyramid, Worker tests, database testing, fixtures, mocking, and E2E strategy.

## Pyramid
Mostly unit, some integration, few E2E. Unit tests are fast and precise. Integration tests catch wiring bugs. E2E tests catch user-facing regressions but are slow and flaky — keep the count low and the coverage targeted.

## Worker tests
Vitest + `@cloudflare/vitest-pool-workers`. Tests run inside the local Workers runtime with real bindings (D1, KV, R2, Durable Objects). Because mocked bindings don't catch D1 SQL dialect differences, KV eventual consistency quirks, or Durable Object state behavior.

## Test database
Pglite locally for fast iteration. Real Neon branch in CI — because pglite doesn't replicate Postgres version-specific behavior, RLS policies, extensions, or migration edge cases. A test suite that passes on pglite but fails on real Postgres is worse than no tests.

## Reset strategy
Fresh schema per suite (run migrations at boot). Truncate per test. Fast, isolated, deterministic. Never rely on test ordering — each test starts from a known state.

## Fixtures
Factories for test subjects — generate unique data per test so tests don't collide. Seed file for static reference data (plans, enums, feature flags, lookup tables) that mirrors production shape.

## Mocking
Real implementations whenever possible. Mock only at hard boundaries: network calls, hardware, third-party APIs. Use sandboxes for services that offer them (Stripe test mode, Resend sandbox, PostHog debug mode).

Prior incident: mocked DB tests passed but prod migration failed because the mock didn't enforce the same constraints. This is why we test against real databases.

## E2E
Split into two tiers:

- **Quick smoke** (every PR): critical paths only — sign up, core action, payment. Runs in <5 minutes.
- **In-depth** (nightly/main merge): broader coverage, edge cases, cross-browser. Can take 15-30 minutes.

Playwright for web, Maestro for mobile.

## Anti-patterns
- Mocking the database — hides real constraint violations, migration bugs, and SQL dialect issues.
- Testing implementation details instead of behavior — brittle tests that break on every refactor.
- E2E tests that cover everything — slow, flaky, and expensive to maintain. Save E2E for user-facing critical paths.
