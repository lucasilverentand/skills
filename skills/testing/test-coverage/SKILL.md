---
name: test-coverage
description: Analyzes test coverage and identifies gaps. Use when improving test coverage, finding untested code paths, or setting up coverage thresholds.
argument-hint: [path]
allowed-tools: [Read, Bash, Glob, Grep]
---

# Test Coverage Analysis

Analyzes test coverage and provides strategies to improve it.

## Your Task

1. **Run coverage report**: Generate current coverage data
2. **Analyze results**: Identify uncovered files and lines
3. **Prioritize gaps**: Focus on critical paths first
4. **Recommend tests**: Suggest specific tests to add
5. **Set thresholds**: Configure coverage requirements

## Coverage Commands

```bash
# Vitest
npx vitest run --coverage

# Jest
npx jest --coverage

# NYC/Istanbul
npx nyc npm test
```

## Coverage Thresholds

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      },
    },
  },
});
```

## Prioritization Matrix

| Coverage Type | Priority | Focus |
|--------------|----------|-------|
| Critical paths | High | Auth, payments, data mutations |
| Error handlers | High | Catch blocks, error boundaries |
| Branch coverage | Medium | if/else, switch cases |
| Edge cases | Medium | Empty inputs, boundaries |
| Happy paths | Lower | Often already covered |

## Tips

- Focus on branch coverage, not just line coverage
- Prioritize testing error paths
- Don't chase 100% - focus on meaningful tests
- Use coverage reports to find dead code
