---
name: jsdoc-comments
description: Adds JSDoc/TSDoc comments to code. Use when documenting functions, classes, or modules with inline documentation.
argument-hint: [file]
allowed-tools: [Read, Write, Edit, Glob, Grep]
---

# JSDoc Comments

Adds JSDoc/TSDoc documentation comments to code.

## Your Task

1. **Identify targets**: Find undocumented exports
2. **Analyze code**: Understand function behavior
3. **Write comments**: Add JSDoc/TSDoc blocks
4. **Include examples**: Add usage examples
5. **Verify**: Check TypeScript integration

## Function Documentation

```typescript
/**
 * Calculates the total price including tax.
 *
 * @param items - Array of items with prices
 * @param taxRate - Tax rate as decimal (e.g., 0.1 for 10%)
 * @returns Total price with tax applied
 *
 * @example
 * ```ts
 * const total = calculateTotal([{ price: 100 }], 0.1);
 * // Returns 110
 * ```
 */
export function calculateTotal(items: Item[], taxRate: number): number {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  return subtotal * (1 + taxRate);
}
```

## Class Documentation

```typescript
/**
 * Manages user authentication and sessions.
 *
 * @example
 * ```ts
 * const auth = new AuthManager({ secret: 'xxx' });
 * const token = await auth.login(email, password);
 * ```
 */
export class AuthManager {
  /**
   * Creates a new AuthManager instance.
   * @param config - Authentication configuration
   */
  constructor(private config: AuthConfig) {}

  /**
   * Authenticates a user and returns a session token.
   *
   * @param email - User's email address
   * @param password - User's password
   * @returns JWT access token
   * @throws {AuthError} If credentials are invalid
   */
  async login(email: string, password: string): Promise<string> {
    // implementation
  }
}
```

## Common Tags

| Tag | Purpose |
|-----|---------|
| `@param` | Document parameter |
| `@returns` | Document return value |
| `@throws` | Document exceptions |
| `@example` | Usage example |
| `@deprecated` | Mark as deprecated |
| `@see` | Reference related items |
| `@internal` | Mark as internal |

## Tips

- Focus on "why" not "what"
- Include edge cases in description
- Use @example for complex functions
- Keep descriptions concise
- Document thrown errors
