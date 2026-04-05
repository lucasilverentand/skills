# Rust Error Handling Patterns

## Library Errors: thiserror

For reusable crates, define typed errors with `thiserror`:

```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ConfigError {
    #[error("missing required field: {field}")]
    MissingField { field: &'static str },

    #[error("invalid value for {field}: {value}")]
    InvalidValue { field: &'static str, value: String },

    #[error("failed to read config file")]
    ReadFailed(#[from] std::io::Error),

    #[error("failed to parse config")]
    ParseFailed(#[from] toml::de::Error),
}
```

### Key patterns

- `#[from]` enables automatic conversion with `?` — wrap underlying errors
- `#[error(transparent)]` delegates `Display` to the wrapped error
- Keep variant names descriptive: `MissingField`, not `Missing`
- Include context in variants (field name, entity ID, file path)

## Application Errors: anyhow

For binaries, CLIs, and application-level code:

```rust
use anyhow::{bail, Context, Result};

fn run() -> Result<()> {
    let config = load_config("config.toml")
        .context("failed to load configuration")?;

    let db = connect_database(&config.database_url)
        .context("failed to connect to database")?;

    if config.workers == 0 {
        bail!("worker count must be > 0");
    }

    start_server(config, db)?;
    Ok(())
}
```

### When to use which

| Context | Use | Why |
|---|---|---|
| Library crate | `thiserror` | Callers need to match on specific error variants |
| Binary / CLI | `anyhow` | Just need to display and propagate errors |
| Shared internal crate | `thiserror` | Other internal crates may need to match |

## The ? Operator

Always use `?` for propagation. Avoid manual `match` on `Result` unless you need to transform:

```rust
// Good — clean propagation
fn process(path: &str) -> Result<Output> {
    let input = std::fs::read_to_string(path)?;
    let parsed = parse(&input)?;
    let output = transform(parsed)?;
    Ok(output)
}

// Bad — unnecessary match
fn process(path: &str) -> Result<Output> {
    let input = match std::fs::read_to_string(path) {
        Ok(s) => s,
        Err(e) => return Err(e.into()),
    };
    // ...
}
```

Only use `match` when you need to handle specific error variants differently:

```rust
match storage.get(key) {
    Ok(value) => Ok(value),
    Err(StorageError::NotFound { .. }) => Ok(default_value()),
    Err(e) => Err(e.into()),
}
```

## unwrap and expect

```rust
// Never in production code:
let value = result.unwrap(); // Panics with no context

// Acceptable with explanation:
let value = result.expect("config.toml is bundled and always valid TOML");

// Always acceptable in tests:
#[test]
fn test_parse() {
    let result = parse("valid input").unwrap();
    assert_eq!(result.name, "test");
}
```

## Error Conversion Between Layers

Define `From` implementations (or use `#[from]`) to convert between error types at layer boundaries:

```rust
#[derive(Error, Debug)]
pub enum ServiceError {
    #[error("user not found: {0}")]
    NotFound(String),

    #[error("unauthorized")]
    Unauthorized,

    #[error(transparent)]
    Storage(#[from] StorageError),

    #[error(transparent)]
    Validation(#[from] ValidationError),
}
```

This lets service functions propagate storage and validation errors with `?` while also defining their own variants.

## CLI Error Reporting

For CLI tools, format errors for humans at the top level:

```rust
fn main() {
    if let Err(err) = run() {
        eprintln!("error: {err}");

        // Print the error chain for debugging
        for cause in err.chain().skip(1) {
            eprintln!("  caused by: {cause}");
        }

        std::process::exit(1);
    }
}
```

## Custom Context

Add context to errors at each level so the error chain tells the full story:

```rust
use anyhow::Context;

fn deploy(env: &str) -> Result<()> {
    let config = load_config(env)
        .with_context(|| format!("loading config for environment '{env}'"))?;

    build_artifacts(&config)
        .context("building deployment artifacts")?;

    upload(&config)
        .with_context(|| format!("uploading to {}", config.target))?;

    Ok(())
}

// Error output:
// error: uploading to production-us-east
//   caused by: connection refused
//   caused by: dns resolution failed for deploy.example.com
```
