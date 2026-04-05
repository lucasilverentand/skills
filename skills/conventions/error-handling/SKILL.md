---
name: error-handling
description: Cross-platform error handling philosophy — Result types over exceptions in TypeScript, Swift, and Rust. Covers error propagation across layers, typed errors, and boundary handling. Use when setting up error handling in a new project, designing error propagation, choosing between throws and result types, or handling errors at system boundaries (API, UI, CLI).
---

# Cross-Platform Error Handling

## Core Principle

**Return errors as values. Reserve exceptions for the unexpected.**

Every platform has its own syntax, but the mental model is the same: functions that can fail return a result that the caller must handle. Exceptions (throws, panics) are for programmer errors and truly unrecoverable states — not for "user entered invalid email."

| Platform | Success path | Error path | Throw/panic when |
|---|---|---|---|
| TypeScript | `{ ok: true, data }` | `{ ok: false, error }` | System boundaries (middleware, process handlers) |
| Swift | Return value / `Result<T, E>` | `throws` typed error | Unrecoverable state, framework requirements |
| Rust | `Ok(T)` | `Err(E)` | `.unwrap()` only in tests and provably infallible paths |

## Decision Tree

- What platform?
  - **TypeScript** → see `development/typescript/errors` for the full `{ ok, error }` pattern, Result type definition, helper constructors, and migration guide
  - **Swift** → see "Swift Error Handling" below and `references/swift-errors.md`
  - **Rust** → see "Rust Error Handling" below and `references/rust-errors.md`
  - **Cross-layer propagation** (errors crossing from DB → service → API → client) → see "Error Propagation" below

## Swift Error Handling

### Typed throws (Swift 6.2)

Swift 6.2 supports typed throws — specify exactly which error type a function can throw:

```swift
enum ValidationError: Error {
    case missingField(String)
    case invalidFormat(field: String, expected: String)
    case tooLong(field: String, max: Int)
}

func validate(_ input: CreateUserInput) throws(ValidationError) -> ValidatedUser {
    guard !input.name.isEmpty else {
        throw .missingField("name")
    }
    guard input.email.contains("@") else {
        throw .invalidFormat(field: "email", expected: "valid email address")
    }
    return ValidatedUser(name: input.name, email: input.email)
}
```

### When to throw vs. return

| Situation | Approach |
|---|---|
| Validation, parsing, expected failures | `throws` with a typed error enum |
| Optional lookups (find user, search) | Return `nil` or optional |
| Operations that always succeed if preconditions hold | Return value directly |
| Truly impossible states | `fatalError()` with explanation |

### Rules

- Error types are always enums with associated values — not strings, not generic `Error`
- Use `do/catch` at boundaries (view model → view, service → controller)
- Use `try?` sparingly — only when you genuinely want to discard the error
- Never `try!` except in tests or provably safe contexts

See `references/swift-errors.md` for complete patterns.

## Rust Error Handling

### Library errors: `thiserror`

For libraries and shared crates, define structured error types:

```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum StorageError {
    #[error("record not found: {id}")]
    NotFound { id: String },
    #[error("duplicate key: {key}")]
    DuplicateKey { key: String },
    #[error(transparent)]
    Io(#[from] std::io::Error),
}
```

### Application errors: `anyhow`

For application-level code (CLI tools, binaries), use `anyhow` for ergonomic error handling:

```rust
use anyhow::{Context, Result};

fn load_config(path: &str) -> Result<Config> {
    let content = std::fs::read_to_string(path)
        .context(format!("failed to read config at {path}"))?;
    let config: Config = toml::from_str(&content)
        .context("failed to parse config")?;
    Ok(config)
}
```

### Rules

- `?` operator for propagation — no manual `match` unless transforming the error
- `.unwrap()` only in tests and mathematically provable cases (with a comment why)
- `.expect("reason")` over `.unwrap()` when the reason isn't obvious
- `#[from]` in `thiserror` for automatic conversion from underlying errors

See `references/rust-errors.md` for complete patterns.

## Error Propagation

Errors cross layers in every application. Each layer should translate errors to its own domain:

```
Repository layer    →  StorageError (not found, duplicate, connection)
     ↓ translates
Service layer       →  DomainError (validation, authorization, business rule)
     ↓ translates
API boundary        →  HTTP status + { ok: false, error: { code, message } }
     ↓ translates
Client              →  User-facing message + recovery action
```

### Rules

1. **Don't leak implementation details** — a database connection error becomes a generic "service unavailable" at the API boundary, not a Postgres error string.
2. **Translate at each boundary** — each layer catches errors from the layer below and wraps them in its own error type.
3. **Log at the boundary, not in the middle** — the API boundary or CLI entry point logs the full error chain. Inner layers just propagate.
4. **Include context for debugging** — error messages should include enough context to find the problem without a debugger (entity ID, operation attempted, field that failed).

## Key References

| File | What it covers |
|---|---|
| `development/typescript/errors` | Full TS Result type, helper constructors, API error shapes, migration guide |
| `references/swift-errors.md` | Typed throws, error enums, do/catch patterns, view model error handling |
| `references/rust-errors.md` | thiserror/anyhow patterns, error conversion, CLI error reporting |
