---
name: snapshot-testing
description: Sets up snapshot testing for UI components and data structures. Use when testing component output, API responses, or detecting unintended changes.
argument-hint: [component]
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# Snapshot Testing

Sets up snapshot testing to detect unintended changes in output.

## Your Task

1. **Identify targets**: Find components/outputs to snapshot
2. **Create snapshot tests**: Write tests that capture output
3. **Review snapshots**: Verify initial snapshots are correct
4. **Set up workflow**: Configure snapshot updates in CI
5. **Document process**: Explain when to update snapshots

## Component Snapshot Example

```typescript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <UserCard
        name="John Doe"
        email="john@example.com"
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with avatar', () => {
    const { container } = render(
      <UserCard
        name="Jane Doe"
        email="jane@example.com"
        avatarUrl="/avatar.jpg"
      />
    );
    expect(container).toMatchSnapshot();
  });
});
```

## Data Snapshot Example

```typescript
import { describe, it, expect } from 'vitest';
import { transformData } from './transform';

describe('transformData', () => {
  it('transforms API response correctly', () => {
    const input = { raw: 'data' };
    const result = transformData(input);
    expect(result).toMatchSnapshot();
  });
});
```

## Inline Snapshots

```typescript
it('uses inline snapshot', () => {
  expect(formatUser({ name: 'John' })).toMatchInlineSnapshot(`
    {
      "displayName": "John",
      "initials": "J",
    }
  `);
});
```

## Tips

- Review snapshot diffs carefully in PRs
- Use inline snapshots for small outputs
- Update snapshots with `vitest -u` or `jest -u`
- Don't snapshot unstable data (timestamps, IDs)
