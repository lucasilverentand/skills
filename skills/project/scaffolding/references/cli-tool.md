# CLI Tool

CLI tools as standalone packages or workspace crates. Bun for scripting tools, Rust for performance-sensitive or distributed binaries.

## Choosing a runtime

- Simple scripting, codegen, or dev tooling → **Bun**
- Performance-sensitive, system-level, or distributed binary → **Rust**
- Fast startup and single binary for non-developers → **Rust**
- Internal dev tool in a bun workspace → **Bun**

## Bun CLI setup

```json
{
  "name": "@<project>/cli",
  "type": "module",
  "bin": { "<tool-name>": "src/index.ts" },
  "scripts": {
    "dev": "bun run src/index.ts",
    "build": "bun build src/index.ts --compile --outfile dist/<tool-name>"
  }
}
```

### Argument parsing

Simple (1-3 flags): `Bun.argv.slice(2)` with manual parsing.

Complex (subcommands): use `citty`:

```ts
import { defineCommand, runMain } from "citty";
const main = defineCommand({
  meta: { name: "my-tool", description: "Does things" },
  args: { name: { type: "positional" }, template: { type: "string", default: "default" } },
  run({ args }) { console.log(`Creating ${args.name}`); },
});
runMain(main);
```

## Rust CLI setup

### Workspace layout

Keep business logic out of the binary crate — put it in a library crate so it's testable and reusable:

```
my-tool/
  Cargo.toml           # workspace
  my-tool/
    Cargo.toml         # binary crate
    src/main.rs
  my-tool-core/
    Cargo.toml         # library crate (business logic, no CLI deps)
    src/lib.rs
```

Workspace `Cargo.toml`:

```toml
[workspace]
members = ["my-tool", "my-tool-core"]
resolver = "2"

[workspace.dependencies]
anyhow = "1"
clap = { version = "4", features = ["derive"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
thiserror = "1"
```

Binary crate `Cargo.toml`:

```toml
[package]
name = "my-tool"
version = "0.1.0"
edition = "2021"

[[bin]]
name = "my-tool"
path = "src/main.rs"

[dependencies]
anyhow = { workspace = true }
clap = { workspace = true }
serde_json = { workspace = true }
my-tool-core = { path = "../my-tool-core" }
```

### Subcommands with clap derive

```rust
use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(name = "my-tool", about = "Does things", version)]
struct Cli {
    /// Output as JSON
    #[arg(long, global = true)]
    json: bool,

    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Create a new item
    Create {
        /// Name of the item
        name: String,
        /// Simulate without making changes
        #[arg(long)]
        dry_run: bool,
    },
    /// List all items
    List {
        /// Filter by status
        #[arg(long)]
        status: Option<String>,
    },
}

fn run() -> anyhow::Result<()> {
    let cli = Cli::parse();
    match cli.command {
        Commands::Create { name, dry_run } => create(name, dry_run, cli.json),
        Commands::List { status } => list(status, cli.json),
    }
}

fn main() {
    if let Err(e) = run() {
        eprintln!("error: {e:#}");
        std::process::exit(1);
    }
}
```

### Error handling

Use `anyhow` in the binary (collects any error type), `thiserror` in the library (typed errors callers can match on):

```rust
// Library crate: typed errors
#[derive(thiserror::Error, Debug)]
pub enum CoreError {
    #[error("item not found: {0}")]
    NotFound(String),
    #[error("permission denied")]
    PermissionDenied,
}
```

```rust
// Binary: anyhow propagates everything
fn create(name: String, dry_run: bool, json: bool) -> anyhow::Result<()> {
    if dry_run {
        eprintln!("dry run: would create {name}");
        return Ok(());
    }
    my_tool_core::create(&name)?;  // ? converts CoreError → anyhow::Error
    print_result(&name, json);
    Ok(())
}
```

## Output formatting

All CLIs support two modes:
1. **Human-readable** (default) — formatted text for terminals
2. **JSON** (`--json` flag) — structured output for piping and scripting

Rust:

```rust
fn print_result(name: &str, json: bool) {
    if json {
        println!("{}", serde_json::json!({ "name": name, "status": "created" }));
    } else {
        println!("Created: {name}");
    }
}
```

Bun:

```ts
function printResult(name: string, json: boolean) {
    if (json) {
        console.log(JSON.stringify({ name, status: "created" }));
    } else {
        console.log(`Created: ${name}`);
    }
}
```

## Conventions

- Print errors to stderr (`eprintln!` / `console.error`), output data to stdout
- Exit with non-zero code on failure
- Always support `--help` (clap generates it; citty generates it)
- Support `--json` for any command that produces output — makes tools composable
- Support `--dry-run` for any command that writes or deletes

## Tools

| Tool | Purpose |
|---|---|
| `tools/cli-scaffold.ts` | Generate a new Bun CLI project with arg parsing |
| `tools/command-list.ts` | List all subcommands in a Bun or Rust CLI |
