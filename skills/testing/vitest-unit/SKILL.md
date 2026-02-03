---
name: vitest-unit
description: Configures Vitest for unit testing with TypeScript support. Use when setting up unit tests, migrating from Jest, or configuring test coverage.
argument-hint: [file-to-test]
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# Vitest Unit Testing

Sets up Vitest for fast, TypeScript-native unit testing.

## Your Task

1. **Check existing setup**: Look for existing test configuration
2. **Install Vitest**: Add vitest and related dependencies
3. **Configure**: Create or update vitest.config.ts
4. **Create test structure**: Set up test files and patterns
5. **Verify**: Run tests to confirm setup works

## Quick Start

```bash
npm install -D vitest @vitest/coverage-v8
```

## Configuration Template

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.{test,spec}.{js,ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

## Example Test

```typescript
import { describe, it, expect, vi } from 'vitest';
import { calculateTotal } from './cart';

describe('calculateTotal', () => {
  it('sums item prices correctly', () => {
    const items = [{ price: 10 }, { price: 20 }];
    expect(calculateTotal(items)).toBe(30);
  });

  it('handles empty cart', () => {
    expect(calculateTotal([])).toBe(0);
  });

  it('applies discount', () => {
    const items = [{ price: 100 }];
    expect(calculateTotal(items, 0.1)).toBe(90);
  });
});
```

## Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Tips

- Use `vitest --ui` for interactive test browser
- Use `vi.mock()` for module mocking
- Use `vi.fn()` for function spies
