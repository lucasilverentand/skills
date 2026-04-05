---
name: code-style
description: Code style and patterns across TypeScript, Swift, and Rust — naming, file organization, async patterns, and cross-cutting principles. Use when writing new code, reviewing code for style consistency, onboarding onto codebase conventions, or wondering how to name or structure something.
---

# Code Style

## Decision Tree

- What language?
  - **TypeScript** → see "TypeScript" below
  - **Swift** → see "Swift" below
  - **Rust** → see "Rust" below
  - **General / cross-cutting** → see "Cross-Cutting Principles" below

## TypeScript

### Naming

| Thing | Convention | Example |
|---|---|---|
| Variables, functions | `camelCase` | `getUserById`, `isActive` |
| Types, interfaces, classes | `PascalCase` | `UserProfile`, `ApiResponse` |
| Constants (true constants) | `SCREAMING_SNAKE` | `MAX_RETRIES`, `DEFAULT_TIMEOUT` |
| Files | `kebab-case` | `user-profile.ts`, `api-client.ts` |
| Directories | `kebab-case` | `background-jobs/`, `error-handling/` |
| React components | `PascalCase` file matching component | `UserCard.tsx` exports `UserCard` |
| Env / config keys | `SCREAMING_SNAKE` | `DATABASE_URL`, `API_KEY` |

### Exports

- **Named exports only** — no `export default`. Named exports make refactoring safer (renames propagate), improve IDE autocomplete, and prevent inconsistent import names.
- One module per file. The file name should describe what it exports.

### Imports

- Use `import type { Foo }` for type-only imports — keeps runtime bundles clean.
- Group imports: built-ins → external packages → internal modules → relative imports. Biome enforces this.
- Avoid barrel files (`index.ts` that re-exports everything) in large packages — they defeat tree-shaking.

### Async

- Always `await` promises — never leave a promise floating. Floating promises hide errors.
- Use `Promise.all()` for independent concurrent operations.
- Use `Promise.allSettled()` when failures should not cancel siblings.
- Use `for...of` with `await` for sequential async operations — never `forEach` with async callbacks.
- Prefer `async/await` over `.then()` chains for readability.

### Functions

- Arrow functions for callbacks and inline functions: `array.map((x) => x.id)`
- Function declarations for top-level named functions: `function createUser() {}`
- Avoid `function` expressions assigned to variables: use declarations or arrows, not `const foo = function() {}`

### Error handling

- Return `{ ok, error }` result types from internal functions — see `development/typescript/errors` for the full pattern.
- Only `throw` at system boundaries (middleware error handlers, process-level catches).
- Access env through `@scope/config`, never `process.env` directly in application code.

## Swift

### Language version

- **Swift 6.2**, iOS 26 minimum deployment target.
- Strict concurrency enabled — no `@unchecked Sendable`, no `nonisolated(unsafe)`.

### Patterns

- **SwiftUI-first** — only use UIKit when SwiftUI genuinely cannot do it (custom text layout, advanced gestures, UIKit-only APIs).
- **`@Observable`** for view models and shared state — not `ObservableObject` + `@Published` (that's the old pattern).
- **`@MainActor`** for all UI-layer types (view models, coordinators).
- **`Sendable`** conformance for types that cross actor boundaries.
- **Zero third-party dependencies** — Swift's stdlib + Apple frameworks cover nearly everything. See `conventions/dependencies`.

### Naming

Follow Swift API Design Guidelines:
- Methods read as English phrases: `array.insert(element, at: index)`
- Boolean properties read as assertions: `isEmpty`, `isValid`, `hasContent`
- Factory methods use `make` prefix: `makeCoordinator()`
- Protocols that describe capability use `-able`/`-ible`: `Codable`, `Sendable`

### Error handling

- Use `throws` with typed errors (Swift 6.2 typed throws).
- Error types as enums with associated values.
- See `conventions/error-handling` for the full cross-platform pattern.

## Rust

### Patterns

- **Clippy clean** — no warnings, no `#[allow]` without a comment explaining why.
- **`Result<T, E>`** everywhere — see `conventions/error-handling` for `thiserror`/`anyhow` patterns.
- **`?` operator** for error propagation — no manual `match` on `Result` unless you need to transform the error.
- **`clap`** derive for CLI argument parsing.
- **`serde`** for all serialization.
- Prefer iterators over index-based loops.
- Prefer `impl Trait` over `dyn Trait` when the concrete type is known at compile time.

### Naming

Follow Rust API Guidelines (RFC 430):
- Types: `PascalCase`
- Functions, methods, variables: `snake_case`
- Constants: `SCREAMING_SNAKE_CASE`
- Crates and modules: `snake_case`

## Cross-Cutting Principles

These apply to all languages:

### Keep functions small
- Aim for < 30 lines per function. If a function is longer, it's probably doing too many things.
- Extract when you can name the extracted piece meaningfully — don't extract just to hit a line count.

### Early returns
- Return early for error cases and preconditions. Avoid deep nesting.
- `if (invalid) return error` is clearer than `if (valid) { ... long block ... }`.

### Comments
- Comments explain **why**, never **what**. The code shows what; the comment shows intent.
- Don't comment obvious code. `// increment counter` above `counter++` is noise.
- Use comments for: business rules, non-obvious performance choices, workarounds with links to issues.

### No dead code
- Delete unused functions, commented-out code, and unreachable branches.
- Version control is the archive — don't keep dead code "just in case."

### Consistency over cleverness
- Match the patterns already in the file / module / project.
- A boring solution everyone can read beats a clever one-liner that needs a comment to explain.
